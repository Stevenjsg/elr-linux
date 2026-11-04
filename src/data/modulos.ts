/**
 * Registro de los módulos que se empaquetan para plataformas (SCORM y cmi5).
 *
 * Las páginas de src/pages/scorm y src/pages/cmi5 y los scripts de
 * empaquetado recorren esta lista. Para añadir un módulo nuevo (por ejemplo, el 3):
 *
 *   1. Crea src/data/modulo-3.ts con `leccion` y `partes`, igual que modulo-2.ts.
 *   2. Crea src/components/modulo-3/ con un componente por parte y su Partes.astro.
 *   3. Añádelo a la lista de abajo y a src/components/PartesModulo.astro.
 *
 * Con eso, `npm run scorm` y `npm run cmi5` generan también sus paquetes, y el
 * curso cmi5 completo (elr-curso-cmi5.zip) lo incluye como un bloque más.
 *
 * Este archivo lo importan también los scripts de Node: los imports llevan la
 * extensión .ts para que Node pueda resolverlos sin Vite.
 */
import type { Leccion, Parte } from './tipos.ts'
import * as modulo2 from './modulo-2.ts'

export interface Modulo {
	/** Segmento de URL y nombre de los paquetes: «modulo-2». */
	slug: string
	leccion: Leccion
	partes: Parte[]
}

export const modulos: Modulo[] = [
	{ slug: 'modulo-2', leccion: modulo2.leccion, partes: modulo2.partes },
	// { slug: 'modulo-3', leccion: modulo3.leccion, partes: modulo3.partes },
]

export const buscarModulo = (slug: string) => modulos.find((m) => m.slug === slug)
