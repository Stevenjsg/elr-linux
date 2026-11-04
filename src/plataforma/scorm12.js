/*
 * Envoltorio mínimo de SCORM 1.2. Sin LMS, la página se lee igual.
 *
 * Expone window.PLATAFORMA con la misma forma que src/plataforma/cmi5.js, para
 * que las partes y los cuestionarios no sepan qué plataforma los ha lanzado.
 * Todas las operaciones devuelven promesas aunque SCORM sea síncrono.
 */
window.PLATAFORMA = (function () {
	var API = null
	var vivo = false
	var estado = 'sin-plataforma'

	function buscar(v) {
		var saltos = 0
		while (v && !v.API && v.parent && v.parent !== v && saltos < 500) {
			saltos++
			v = v.parent
		}
		return v ? v.API : null
	}

	function localizar() {
		try {
			return buscar(window) || (window.opener ? buscar(window.opener) : null)
		} catch (e) {
			return null
		}
	}

	return {
		nombre: 'SCORM 1.2',
		/* 'conectado' | 'sin-plataforma' | 'error' */
		estado: function () {
			return estado
		},
		iniciar: function () {
			API = localizar()
			if (!API) return Promise.resolve(false)
			vivo = API.LMSInitialize('') === 'true'
			estado = vivo ? 'conectado' : 'error'
			if (vivo) {
				var actual = API.LMSGetValue('cmi.core.lesson_status')
				if (!actual || actual === 'not attempted') {
					API.LMSSetValue('cmi.core.lesson_status', 'incomplete')
					API.LMSCommit('')
				}
			}
			return Promise.resolve(vivo)
		},
		yaCompletada: function () {
			return vivo && API.LMSGetValue('cmi.core.lesson_status') === 'completed'
		},
		completar: function () {
			if (!vivo) return Promise.resolve(false)
			API.LMSSetValue('cmi.core.lesson_status', 'completed')
			API.LMSCommit('')
			return Promise.resolve(true)
		},
		/* Para las partes con cuestionario: nota sobre 100 y aprobado/suspenso. */
		puntuar: function (bruta, aprobado) {
			if (!vivo) return Promise.resolve(false)
			API.LMSSetValue('cmi.core.score.min', '0')
			API.LMSSetValue('cmi.core.score.max', '100')
			API.LMSSetValue('cmi.core.score.raw', String(bruta))
			API.LMSSetValue('cmi.core.lesson_status', aprobado ? 'passed' : 'failed')
			API.LMSCommit('')
			return Promise.resolve(true)
		},
		/* En SCORM es el reproductor del LMS quien vuelve: no hay URL de retorno. */
		urlRetorno: function () {
			return null
		},
		salir: function () {
			return Promise.resolve()
		},
		cerrar: function () {
			if (!vivo) return
			API.LMSFinish('')
			vivo = false
		},
	}
})()
