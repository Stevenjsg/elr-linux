/*
 * Envoltorio xAPI Launch con la librería de Veracity (veracity-tech/lrs-launch-example):
 * ADL xAPIWrapper (xapiwrapper.min.js) + ADL.launch. Sin plataforma, la página se lee igual.
 *
 * Expone window.PLATAFORMA con la misma forma que src/plataforma/cmi5.js y scorm12.js,
 * más un método propio, evento(), para registrar lo que hace el alumno en la página.
 *
 * Acepta los dos lanzamientos que usa lrs.io; en los dos, ninguna credencial vive en el código:
 *
 *   xAPI Launch  ?xAPILaunchKey=…&xAPILaunchService=…
 *                ADL.launch hace un POST a <xAPILaunchService>launch/<xAPILaunchKey>,
 *                recibe endpoint y actor y devuelve un XAPIWrapper ya configurado.
 *                La sesión con el LRS va en una cookie (withCredentials).
 *
 *   Tin Can      ?endpoint=…&auth=…&actor=…[&registration=…]
 *                Es como lrs.io lanza los paquetes con tincan.xml (el de Rise también).
 *                ADL.XAPIWrapper lee esos parámetros solo al cargarse.
 *
 * Qué envía:
 *   initialized                 al abrir la parte
 *   experienced (sección)       la primera vez que cada sección entra en pantalla
 *   played / experienced (medio) al reproducir un vídeo o audio y al llegar al final
 *   answered (pregunta)         por cada pregunta al corregir un cuestionario
 *   completed                   al marcar la parte como terminada (o al puntuarla)
 *   passed | failed             con la puntuación del cuestionario
 *   terminated                  al salir o cerrar la pestaña
 *
 * La página define antes window.ELR_XAPI = { actividad, nombre, curso, nombreCurso }.
 */
window.PLATAFORMA = (function () {
	var CFG = window.ELR_XAPI || {}
	var XAPI = 'http://adlnet.gov/expapi/verbs/'
	var VIDEO = 'https://w3id.org/xapi/video/verbs/'
	var TIPO = 'http://adlnet.gov/expapi/activities/'
	var VERBOS = {
		initialized: [XAPI + 'initialized', 'initialized', 'inicializó'],
		experienced: [XAPI + 'experienced', 'experienced', 'vio'],
		played: [VIDEO + 'played', 'played', 'reprodujo'],
		answered: [XAPI + 'answered', 'answered', 'respondió'],
		completed: [XAPI + 'completed', 'completed', 'completó'],
		passed: [XAPI + 'passed', 'passed', 'aprobó'],
		failed: [XAPI + 'failed', 'failed', 'suspendió'],
		terminated: [XAPI + 'terminated', 'terminated', 'terminó'],
	}

	var q = new URLSearchParams(location.search)
	var modo = q.get('xAPILaunchKey') && q.get('xAPILaunchService') ? 'launch' : q.get('endpoint') && q.get('auth') && q.get('actor') ? 'tincan' : null
	var lanzado = !!modo
	var estado = lanzado ? 'error' : 'sin-plataforma'
	var wrapper = null
	var actor = null
	var registro = null
	var vivo = false
	var terminado = false
	var completado = false
	var aprobado = false
	var inicio = Date.now()

	function duracion() {
		return 'PT' + ((Date.now() - inicio) / 1000).toFixed(2) + 'S'
	}

	function texto(s) {
		return { 'es-ES': s }
	}

	function actividad(id, nombre, tipo, extra) {
		var def = { type: TIPO + (tipo || 'lesson') }
		if (nombre) def.name = texto(nombre)
		for (var k in extra || {}) def[k] = extra[k]
		return { objectType: 'Activity', id: id, definition: def }
	}

	function statement(verbo, objeto, resultado) {
		var v = VERBOS[verbo]
		var esLaParte = !objeto
		var ctx = {
			language: 'es-ES',
			contextActivities: {
				grouping: CFG.curso ? [actividad(CFG.curso, CFG.nombreCurso, 'course')] : [],
			},
		}
		// Lo que pasa dentro de la parte (secciones, preguntas, medios) cuelga de ella.
		if (!esLaParte) ctx.contextActivities.parent = [actividad(CFG.actividad, CFG.nombre)]
		if (registro) ctx.registration = registro
		var s = {
			id: window.ADL && ADL.ruuid ? ADL.ruuid() : undefined,
			actor: actor,
			verb: { id: v[0], display: { 'en-US': v[1], 'es-ES': v[2] } },
			object: objeto || actividad(CFG.actividad, CFG.nombre),
			context: ctx,
			timestamp: new Date().toISOString(),
		}
		if (resultado) s.result = resultado
		return s
	}

	/* Envío con la librería: ADL.XAPIWrapper.sendStatement, asíncrono. */
	function enviar(verbo, objeto, resultado) {
		if (!vivo || terminado) return Promise.resolve(false)
		var s = statement(verbo, objeto, resultado)
		return new Promise(function (ok) {
			wrapper.sendStatement(s, function (r) {
				var bien = r && r.status >= 200 && r.status < 300
				if (!bien) console.error('[xapi]', verbo, r && r.status, r && r.responseText)
				ok(bien)
			})
		})
	}

	/*
	 * Al cerrar la pestaña una petición asíncrona normal se pierde, y la síncrona
	 * del wrapper está prohibida en los navegadores actuales. Se manda con
	 * fetch keepalive al mismo endpoint y con la misma sesión que usa la librería.
	 */
	function enviarAlSalir(s) {
		var lrs = wrapper.lrs
		var cabeceras = { 'Content-Type': 'application/json', 'X-Experience-API-Version': '1.0.3' }
		if (lrs.auth) cabeceras.Authorization = lrs.auth
		return fetch(lrs.endpoint + 'statements', {
			method: 'POST',
			headers: cabeceras,
			body: JSON.stringify(s),
			// Con xAPI Launch la sesión es una cookie; con Tin Can basta la cabecera auth.
			credentials: modo === 'launch' ? 'include' : 'omit',
			keepalive: true,
		}).catch(function (e) {
			console.error('[xapi] terminated', e)
		})
	}

	function terminar(alSalir) {
		if (!vivo || terminado) return Promise.resolve()
		var resultado = { duration: duracion() }
		if (alSalir) {
			var s = statement('terminated', null, resultado)
			terminado = true
			return enviarAlSalir(s)
		}
		return enviar('terminated', null, resultado).then(function () {
			terminado = true
		})
	}

	/* Tin Can: la librería ya está configurada con los parámetros de la URL. */
	function iniciarTinCan() {
		try {
			wrapper = ADL.XAPIWrapper
			actor = normalizarActor(JSON.parse(q.get('actor')))
			registro = q.get('registration') || null
		} catch (e) {
			console.error('[xapi] actor', e)
			estado = 'error'
			return Promise.resolve(false)
		}
		vivo = true
		estado = 'conectado'
		return enviar('initialized').then(function (bien) {
			if (!bien) {
				vivo = false
				estado = 'error'
				return false
			}
			seguirPagina()
			return true
		})
	}

	/* Algunos LMS mandan el actor en el formato antiguo de Tin Can: {"name":["…"],"mbox":["…"]}. */
	function normalizarActor(a) {
		var r = {}
		for (var k in a) r[k] = Array.isArray(a[k]) ? a[k][0] : a[k]
		if (r.account && Array.isArray(r.account)) r.account = r.account[0]
		if (r.account && r.account.accountName) {
			r.account = { homePage: r.account.accountServiceHomePage, name: r.account.accountName }
		}
		r.objectType = 'Agent'
		return r
	}

	/* ---- Seguimiento automático de la página: secciones, medios y cuestionarios ---- */

	function idDe(sufijo) {
		return CFG.actividad + '/' + sufijo
	}

	function seguirPagina() {
		var vistas = {}
		if ('IntersectionObserver' in window) {
			var obs = new IntersectionObserver(
				function (entradas) {
					entradas.forEach(function (e) {
						var sec = e.target
						// Vista = ocupa media pantalla, o la mitad de sí misma si es corta.
						var visible = e.intersectionRect.height
						var basta = Math.min(window.innerHeight, e.boundingClientRect.height) * 0.5
						if (!e.isIntersecting || visible < basta || vistas[sec.id]) return
						vistas[sec.id] = true
						obs.unobserve(sec)
						var titulo = sec.querySelector('h2, h3')
						enviar(
							'experienced',
							actividad(idDe('seccion/' + sec.id), titulo ? titulo.textContent.trim() : sec.id, 'module'),
						)
					})
				},
				// Varios umbrales para reevaluar mientras se desplaza. rootMargin no sirve:
				// lrs.io muestra el contenido en un iframe de otro origen y ahí se ignora.
				{ threshold: [0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1] },
			)
			document.querySelectorAll('main section[id]').forEach(function (s) {
				obs.observe(s)
			})
		}

		// play y ended no burbujean: se escuchan en la fase de captura.
		function medio(e) {
			var m = e.target
			if (!(m instanceof HTMLMediaElement)) return
			var fuente = m.currentSrc || m.src || ''
			var nombre = fuente.split('/').pop().split('?')[0] || 'medio'
			var obj = actividad(idDe('medio/' + nombre), nombre, 'media')
			var resultado = { extensions: { 'https://w3id.org/xapi/video/extensions/time': Math.round(m.currentTime) } }
			if (e.type === 'play') enviar('played', obj, resultado)
			else enviar('experienced', obj, { completion: true })
		}
		document.addEventListener('play', medio, true)
		document.addEventListener('ended', medio, true)

		document.addEventListener('quiz:corregido', function (e) {
			var d = e.detail || {}
			;(d.respuestas || []).forEach(function (r) {
				var obj = actividad(idDe('pregunta/' + d.id + '-' + r.numero), r.enunciado, 'cmi.interaction', {
					interactionType: 'choice',
					correctResponsesPattern: [String(r.correcta)],
					choices: r.opciones.map(function (o, i) {
						return { id: String(i), description: texto(o) }
					}),
				})
				enviar('answered', obj, {
					response: r.elegida === null ? '' : String(r.elegida),
					success: r.acertada,
				})
			})
		})
	}

	return {
		nombre: 'xapi',
		/* 'conectado' | 'sin-plataforma' | 'error' */
		estado: function () {
			return estado
		},

		iniciar: function () {
			if (!lanzado || !window.ADL || !ADL.launch) return Promise.resolve(false)
			if (modo === 'tincan') return iniciarTinCan()
			return new Promise(function (ok) {
				ADL.launch(function (err, datos, w) {
					if (err) {
						console.error('[xapi] ADL.launch', err)
						estado = 'error'
						return ok(false)
					}
					wrapper = w
					actor = datos.actor
					registro = datos.registration || null
					vivo = true
					estado = 'conectado'
					enviar('initialized').then(function () {
						seguirPagina()
						ok(true)
					})
				}, true)
			})
		},

		yaCompletada: function () {
			return vivo && completado
		},

		completar: function () {
			if (!vivo || terminado) return Promise.resolve(false)
			if (completado) return Promise.resolve(true)
			completado = true
			return enviar('completed', null, { completion: true, duration: duracion() }).then(function (ok) {
				if (!ok) completado = false
				return ok
			})
		},

		/* Nota sobre 100. */
		puntuar: function (bruta, aprobada) {
			if (!vivo || terminado) return Promise.resolve(false)
			var resultado = {
				score: { scaled: Math.max(0, Math.min(1, bruta / 100)), raw: bruta, min: 0, max: 100 },
				success: !!aprobada,
				completion: true,
				duration: duracion(),
			}
			var previo = completado ? Promise.resolve(true) : this.completar()
			return previo.then(function () {
				if (aprobado) return true
				if (aprobada) aprobado = true
				return enviar(aprobada ? 'passed' : 'failed', null, resultado)
			})
		},

		/* Para registrar cualquier otra cosa desde la página. */
		evento: function (verbo, objeto, resultado) {
			if (!VERBOS[verbo]) return Promise.resolve(false)
			return enviar(verbo, objeto, resultado)
		},

		/* xAPI Launch no pasa URL de retorno: lrs.io recupera el control al cerrar. */
		urlRetorno: function () {
			return null
		},

		salir: function () {
			return terminar(false)
		},

		cerrar: function () {
			terminar(true)
		},
	}
})()
