/**
 * Contenido modular del módulo 3 (tramo 03, lección 1: permisos).
 *
 * Única fuente de verdad sobre QUÉ partes tiene la lección y en qué orden. La web
 * las pinta todas seguidas; el paquete xAPI las pinta en una sola página y sigue
 * cada una como sección.
 *
 * El contenido de cada parte vive en src/components/modulo-3/<id>.astro.
 * Sigue la presentación presentaciones/permisos-linux.pptx.
 */

import type { Leccion, Parte } from './tipos.ts'

export type { Medio, Parte } from './tipos.ts'

export const leccion = {
	modulo: 3,
	tramo: 'Tramo 03',
	posicion: 'Lección 1 de 4',
	titulo: 'Mandas: permisos de archivos',
	tituloSeo: 'Permisos en Linux: leer ls -l, números y chmod | elr',
	descripcion:
		'Lección del tramo 03 del curso elr. Aprende a leer los permisos que enseña ls -l, a pasarlos a números y a cambiarlos con chmod sin abrirle la puerta a todo el mundo.',
	entradilla:
		'«Permiso denegado» no es un error: es Linux haciendo su trabajo. En media hora sabrás leer quién puede tocar cada archivo, traducirlo a tres cifras y cambiarlo con una sola orden.',
	pie: 'Tramo 03 del curso elr, aprende Linux sin romper nada.',
} as const satisfies Leccion

export const partes: Parte[] = [
	{ id: 'resultados', numero: '01', titulo: 'Resultados de aprendizaje', minutos: 2 },
	{ id: 'denegado', numero: '02', titulo: '¿Por qué me dice que no?', minutos: 4 },
	{ id: 'leer', numero: '03', titulo: 'Diez letras que lo cuentan todo', minutos: 6 },
	{ id: 'numeros', numero: '04', titulo: 'Cada letra vale un número', minutos: 5 },
	{ id: 'chmod', numero: '05', titulo: 'Cámbialos con chmod', minutos: 6 },
	{ id: 'pruebalo', numero: '06', titulo: 'Pruébalo tú', minutos: 4, medios: ['simulador'] },
	{ id: 'resumen', numero: '07', titulo: 'Resumen', minutos: 1 },
	{ id: 'glosario', numero: '08', titulo: 'Glosario', minutos: 1 },
	{
		id: 'actividades',
		numero: '09',
		titulo: 'Actividades',
		minutos: 5,
		medios: ['cuestionario'],
		completaSola: true,
		notaMinima: 70,
	},
]

/** Duración total, calculada en vez de escrita a mano para que no se desincronice. */
export const minutosTotales = partes.reduce((suma, p) => suma + p.minutos, 0)

export const duracionTexto = `${minutosTotales} min aprox.`
