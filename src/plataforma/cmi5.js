/*
 * Envoltorio cmi5 (xAPI) sin dependencias. Sin plataforma, la página se lee igual.
 *
 * Expone window.PLATAFORMA con la misma forma que src/plataforma/scorm12.js.
 *
 * Cómo funciona el lanzamiento cmi5 (especificación cmi5, sección 8):
 *   1. La plataforma (lrs.io u otro LMS) abre la página con estos parámetros:
 *      endpoint, fetch, actor, registration y activityId.
 *   2. La página hace un POST a «fetch» y recibe un token de un solo uso.
 *      Ninguna credencial del LRS vive en el código.
 *   3. Lee el documento de estado «LMS.LaunchData»: modo de lanzamiento, nota
 *      de corte, URL de retorno y la plantilla de contexto de los statements.
 *   4. Envía initialized → (completed | passed | failed) → terminated.
 *
 * Reglas de la especificación que respeta:
 *   - initialized es el primero y terminated el último de cada sesión.
 *   - completed y passed se envían una sola vez por matrícula (registration).
 *     Para saberlo entre sesiones guarda su progreso en un documento de estado
 *     propio del LRS.
 *   - failed no se envía después de passed, ni más de una vez por matrícula.
 *   - En los modos Browse y Review solo se envían initialized y terminated.
 *   - Si la plataforma manda nota de corte (masteryScore), manda ella.
 *   - Tras terminated no se envía nada más: recargar la página no reabre la
 *     sesión (el token solo vale una vez). Hay que volver a abrir desde la plataforma.
 */
window.PLATAFORMA = (function () {
	var q = new URLSearchParams(location.search)
	var endpoint = q.get('endpoint')
	var urlFetch = q.get('fetch')
	var registro = q.get('registration')
	var actividad = q.get('activityId')
	var actor = null
	try {
		actor = JSON.parse(q.get('actor') || 'null')
	} catch (e) {
		actor = null
	}
	var lanzado = !!(endpoint && urlFetch && actor && registro && actividad)
	if (endpoint && endpoint.slice(-1) !== '/') endpoint += '/'

	var XAPI = 'http://adlnet.gov/expapi/verbs/'
	var CMI5 = 'https://w3id.org/xapi/cmi5/context/'
	var ESTADO_PROPIO = 'https://sjsilgom.upv.edu.es/xapi/elr/estado/progreso'
	var VERBOS = {
		initialized: ['initialized', 'inicializó'],
		completed: ['completed', 'completó'],
		passed: ['passed', 'aprobó'],
		failed: ['failed', 'suspendió'],
		terminated: ['terminated', 'terminó'],
	}

	var auth = null
	var datos = null
	var vivo = false
	var terminado = false
	var estado = lanzado ? 'error' : 'sin-plataforma'
	var inicio = Date.now()
	var progreso = { completado: false, aprobado: false, suspendido: false }
	// Los statements salen en orden: cada envío espera al anterior.
	var cola = Promise.resolve()

	/* ---- sessionStorage: sobrevive a una recarga dentro de la misma pestaña ---- */
	var PREFIJO = 'elr-cmi5:' + registro + ':' + actividad + ':'
	function leer(k) {
		try {
			return sessionStorage.getItem(PREFIJO + k)
		} catch (e) {
			return null
		}
	}
	function guardar(k, v) {
		try {
			sessionStorage.setItem(PREFIJO + k, String(v))
		} catch (e) {}
	}

	function cabeceras() {
		return {
			Authorization: auth,
			'X-Experience-API-Version': '1.0.3',
			'Content-Type': 'application/json',
		}
	}

	function uuid() {
		if (window.crypto && crypto.randomUUID) return crypto.randomUUID()
		var b = crypto.getRandomValues(new Uint8Array(16))
		b[6] = (b[6] & 0x0f) | 0x40
		b[8] = (b[8] & 0x3f) | 0x80
		var h = Array.prototype.map.call(b, function (x) {
			return (x + 256).toString(16).slice(1)
		}).join('')
		return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20)
	}

	function duracion() {
		return 'PT' + ((Date.now() - inicio) / 1000).toFixed(2) + 'S'
	}

	function urlEstado(stateId) {
		return (
			endpoint +
			'activities/state?' +
			new URLSearchParams({
				stateId: stateId,
				activityId: actividad,
				agent: JSON.stringify(actor),
				registration: registro,
			})
		)
	}

	function token() {
		var guardado = leer('token')
		if (guardado) return Promise.resolve(guardado)
		return fetch(urlFetch, { method: 'POST' })
			.then(function (r) {
				return r.json().then(function (j) {
					if (!r.ok || !j['auth-token']) {
						throw new Error('fetch: ' + (j['error-text'] || r.status))
					}
					guardar('token', j['auth-token'])
					return j['auth-token']
				})
			})
	}

	function statement(verbo, resultado, moveOn, maestria) {
		var v = VERBOS[verbo]
		// La plantilla de contexto de la plataforma va tal cual; se añaden encima
		// la matrícula y las categorías que exige cmi5.
		var ctx = JSON.parse(JSON.stringify((datos && datos.contextTemplate) || {}))
		ctx.registration = registro
		ctx.contextActivities = ctx.contextActivities || {}
		ctx.contextActivities.category = (ctx.contextActivities.category || []).concat(
			{ id: CMI5 + 'categories/cmi5' },
			moveOn ? [{ id: CMI5 + 'categories/moveon' }] : [],
		)
		if (typeof maestria === 'number') {
			ctx.extensions = ctx.extensions || {}
			ctx.extensions[CMI5 + 'extensions/masteryscore'] = maestria
		}
		var s = {
			id: uuid(),
			actor: actor,
			verb: { id: XAPI + v[0], display: { 'en-US': v[0], 'es-ES': v[1] } },
			object: { objectType: 'Activity', id: actividad },
			context: ctx,
			timestamp: new Date().toISOString(),
		}
		if (resultado) s.result = resultado
		return s
	}

	function enviar(s, alSalir) {
		return fetch(endpoint + 'statements', {
			method: 'POST',
			headers: cabeceras(),
			body: JSON.stringify(s),
			keepalive: !!alSalir,
		}).then(function (r) {
			if (!r.ok) throw new Error('statements: ' + r.status)
		})
	}

	function encolar(verbo, resultado, moveOn, maestria) {
		var s = statement(verbo, resultado, moveOn, maestria)
		// Un envío fallido no bloquea los siguientes: el error lo recoge quien llamó.
		cola = cola
			.catch(function () {})
			.then(function () {
				return enviar(s)
			})
		return cola
	}

	function guardarProgreso() {
		return fetch(urlEstado(ESTADO_PROPIO), {
			method: 'PUT',
			headers: cabeceras(),
			body: JSON.stringify(progreso),
		}).then(function (r) {
			if (!r.ok) throw new Error('estado: ' + r.status)
		})
	}

	function normal() {
		return vivo && !terminado && datos.launchMode === 'Normal'
	}

	function fallo(e) {
		console.error('[cmi5]', e)
		return false
	}

	function terminar(alSalir) {
		if (!vivo || terminado) return Promise.resolve()
		terminado = true
		guardar('terminado', '1')
		return enviar(statement('terminated', { duration: duracion() }), alSalir)
	}

	return {
		nombre: 'cmi5',
		/* 'conectado' | 'revision' | 'sin-plataforma' | 'sesion-cerrada' | 'error' */
		estado: function () {
			return estado
		},

		iniciar: function () {
			if (!lanzado) return Promise.resolve(false)
			if (leer('terminado')) {
				estado = 'sesion-cerrada'
				return Promise.resolve(false)
			}
			return token()
				.then(function (t) {
					auth = 'Basic ' + t
					return fetch(urlEstado('LMS.LaunchData'), { headers: cabeceras() })
				})
				.then(function (r) {
					if (!r.ok) throw new Error('LMS.LaunchData: ' + r.status)
					return r.json()
				})
				.then(function (d) {
					datos = d
					// 404 = primera vez en esta matrícula: no hay progreso guardado.
					return fetch(urlEstado(ESTADO_PROPIO), { headers: cabeceras() })
				})
				.then(function (r) {
					return r.ok ? r.json() : null
				})
				.then(function (p) {
					if (p) for (var k in progreso) progreso[k] = !!p[k]
					var antes = Number(leer('inicio'))
					if (antes) inicio = antes
					else guardar('inicio', inicio)
					vivo = true
					estado = datos.launchMode === 'Normal' ? 'conectado' : 'revision'
					// Una recarga dentro de la misma sesión no repite initialized.
					if (leer('iniciado')) return
					guardar('iniciado', '1')
					return encolar('initialized')
				})
				.then(function () {
					return vivo
				})
				.catch(function (e) {
					vivo = false
					estado = 'error'
					return fallo(e)
				})
		},

		yaCompletada: function () {
			return vivo && progreso.completado
		},

		completar: function () {
			if (!normal()) return Promise.resolve(false)
			if (progreso.completado) return Promise.resolve(true)
			progreso.completado = true
			return encolar('completed', { completion: true, duration: duracion() }, true)
				.catch(function (e) {
					// No llegó: se podrá volver a intentar.
					progreso.completado = false
					throw e
				})
				.then(guardarProgreso)
				.then(function () {
					return true
				})
				.catch(fallo)
		},

		/* Nota sobre 100. Si la plataforma manda nota de corte, decide ella. */
		puntuar: function (bruta, aprobado) {
			if (!normal()) return Promise.resolve(false)
			var escalada = Math.max(0, Math.min(1, bruta / 100))
			var maestria = typeof datos.masteryScore === 'number' ? datos.masteryScore : null
			if (maestria !== null) aprobado = escalada >= maestria
			var resultado = {
				score: { scaled: escalada, raw: bruta, min: 0, max: 100 },
				success: aprobado,
				duration: duracion(),
			}

			if (!progreso.completado) {
				progreso.completado = true
				encolar('completed', { completion: true, duration: duracion() }, true)
			}
			if (aprobado && !progreso.aprobado) {
				progreso.aprobado = true
				encolar('passed', resultado, true, maestria)
			} else if (!aprobado && !progreso.aprobado && !progreso.suspendido) {
				progreso.suspendido = true
				encolar('failed', resultado, true, maestria)
			}
			return cola
				.then(guardarProgreso)
				.then(function () {
					return true
				})
				.catch(fallo)
		},

		/* URL a la que volver al salir, si la plataforma la ha indicado. */
		urlRetorno: function () {
			return (vivo && datos && datos.returnURL) || null
		},

		/* Cierra la sesión (terminated) y vuelve a la plataforma. */
		salir: function () {
			var destino = this.urlRetorno()
			return cola
				.catch(function () {})
				.then(function () {
					return terminar(false)
				})
				.catch(fallo)
				.then(function () {
					if (destino) location.href = destino
				})
		},

		/* Al cerrar la pestaña: terminated con keepalive para que llegue igualmente. */
		cerrar: function () {
			terminar(true).catch(fallo)
		},
	}
})()
