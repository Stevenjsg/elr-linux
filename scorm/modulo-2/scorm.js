/**
 * Envoltorio mínimo de SCORM 1.2.
 * Si no encuentra el LMS, la página sigue funcionando: solo deja de informar.
 */
(function (global) {
	'use strict';

	var API = null;
	var iniciado = false;

	function buscarEn(ventana) {
		var saltos = 0;
		while (ventana && !ventana.API && ventana.parent && ventana.parent !== ventana && saltos < 500) {
			saltos++;
			ventana = ventana.parent;
		}
		return ventana ? ventana.API : null;
	}

	function localizar() {
		var encontrada = null;
		try {
			encontrada = buscarEn(window);
			if (!encontrada && window.opener) encontrada = buscarEn(window.opener);
		} catch (e) {
			encontrada = null;
		}
		return encontrada;
	}

	function iniciar() {
		API = localizar();
		if (!API) return false;
		iniciado = API.LMSInitialize('') === 'true';
		if (iniciado) {
			var estado = API.LMSGetValue('cmi.core.lesson_status');
			if (!estado || estado === 'not attempted' || estado === '') {
				API.LMSSetValue('cmi.core.lesson_status', 'incomplete');
				API.LMSCommit('');
			}
		}
		return iniciado;
	}

	function completar() {
		if (!iniciado || !API) return false;
		API.LMSSetValue('cmi.core.lesson_status', 'completed');
		API.LMSCommit('');
		return true;
	}

	function cerrar() {
		if (!iniciado || !API) return;
		API.LMSFinish('');
		iniciado = false;
	}

	global.SCORM = {
		iniciar: iniciar,
		completar: completar,
		cerrar: cerrar,
		hayLMS: function () { return iniciado; }
	};
})(window);
