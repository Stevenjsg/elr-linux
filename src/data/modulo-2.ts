/**
 * Contenido modular del módulo 2.
 *
 * Esta es la única fuente de verdad sobre QUÉ partes tiene la lección y en qué
 * orden. La web las pinta todas seguidas; el paquete SCORM genera una página
 * (un SCO) por cada una, de modo que el LMS pueda seguir el progreso parte a
 * parte en lugar de tratar la lección entera como un único bloque.
 *
 * El contenido de cada parte vive en src/components/modulo-2/<id>.astro.
 */

export type Medio = 'grafico' | 'audio' | 'video' | 'simulador' | 'cuestionario'

export interface Parte {
	/** Identificador estable: también es el segmento de URL y el ID del SCO. */
	id: string
	/** Número que se muestra en el índice. */
	numero: string
	/** Título visible y entrada del índice. */
	titulo: string
	/** Minutos estimados, para el índice y para los metadatos del SCO. */
	minutos: number
	/** Qué recursos no textuales aparecen en esta parte. */
	medios?: Medio[]
	/** La parte informa ella misma de su estado al LMS (cuestionarios). */
	completaSola?: boolean
	/** Nota mínima sobre 100 para dar la parte por superada. */
	notaMinima?: number
}

export const leccion = {
	modulo: 2,
	tramo: 'Tramo 02',
	posicion: 'Lección 1 de 4',
	titulo: 'Te mueves: rutas y carpetas',
	tituloSeo: 'Te mueves: rutas y carpetas con pwd, ls y cd | elr',
	descripcion:
		'Lección del tramo 02 del curso elr. Aprende el árbol de directorios de Linux y muévete por él con pwd, ls y cd, con gráfico, audio, vídeo y un simulador de terminal.',
	entradilla:
		'Un sistema de archivos es un mapa, y ahora mismo no sabes leerlo. En media hora sabrás siempre dónde estás, qué hay a tu alrededor y cómo llegar a cualquier sitio. Con tres comandos.',
	pie: 'Tramo 02 del curso elr, aprende Linux sin romper nada.',
} as const

export const partes: Parte[] = [
	{ id: 'resultados', numero: '01', titulo: 'Resultados de aprendizaje', minutos: 2 },
	{ id: 'donde-estoy', numero: '02', titulo: '¿Dónde estoy?', minutos: 4 },
	{ id: 'todo-cuelga', numero: '03', titulo: 'Todo cuelga de /', minutos: 6, medios: ['grafico', 'audio'] },
	{ id: 'mirar', numero: '04', titulo: 'Mirar antes de moverse', minutos: 5 },
	{ id: 'moverse', numero: '05', titulo: 'Moverse', minutos: 7, medios: ['video'] },
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

export const buscarParte = (id: string) => partes.find((p) => p.id === id)

export const vecina = (id: string) => {
	const i = partes.findIndex((p) => p.id === id)
	return {
		anterior: i > 0 ? partes[i - 1] : null,
		siguiente: i >= 0 && i < partes.length - 1 ? partes[i + 1] : null,
		indice: i,
	}
}
