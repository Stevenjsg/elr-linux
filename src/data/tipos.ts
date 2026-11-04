/**
 * Tipos compartidos por todos los módulos del curso.
 *
 * Cada módulo (src/data/modulo-N.ts) exporta un `leccion` y un `partes` con esta
 * forma, y se registra en src/data/modulos.ts para que la web, el paquete SCORM
 * y el paquete cmi5 lo encuentren sin tocar más código.
 */

export type Medio = 'grafico' | 'audio' | 'video' | 'simulador' | 'cuestionario'

export interface Parte {
	/** Identificador estable: también es el segmento de URL y el ID del SCO / AU. */
	id: string
	/** Número que se muestra en el índice. */
	numero: string
	/** Título visible y entrada del índice. */
	titulo: string
	/** Minutos estimados, para el índice y para los metadatos del SCO / AU. */
	minutos: number
	/** Qué recursos no textuales aparecen en esta parte. */
	medios?: Medio[]
	/** La parte informa ella misma de su estado a la plataforma (cuestionarios). */
	completaSola?: boolean
	/** Nota mínima sobre 100 para dar la parte por superada. */
	notaMinima?: number
}

export interface Leccion {
	modulo: number
	tramo: string
	posicion: string
	titulo: string
	tituloSeo: string
	descripcion: string
	entradilla: string
	pie: string
}
