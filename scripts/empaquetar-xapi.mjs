/**
 * Convierte el build de Astro en paquetes xAPI para lrs.io, con la librería de
 * veracity-tech/lrs-launch-example (ADL xAPIWrapper + ADL.launch).
 *
 *   xapi/elr-<modulo>-xapi.zip   El módulo entero en una sola página.
 *
 * lrs.io registra un único punto de entrada por zip, así que el tutorial va en una
 * página (leccion/index.html) y no en una por parte. El manifiesto es un tincan.xml,
 * el formato que lrs.io reconoce como «Tincan/xAPI» (igual que el paquete de Rise).
 * La página acepta tanto el lanzamiento Tin Can como xAPI Launch.
 *
 *   node scripts/empaquetar-xapi.mjs              # todos los módulos
 *   node scripts/empaquetar-xapi.mjs modulo-2     # solo ese módulo
 */
import fs from 'node:fs'
import path from 'node:path'
import { modulos } from '../src/data/modulos.ts'
import {
	DIST,
	RAIZ,
	avisarAusentes,
	buscarAusentes,
	comprimir,
	elegirModulos,
	escapar,
	exigirBuild,
	prepararCarpeta,
} from './paquete-comun.mjs'

/**
 * Raíz de los IRIs. Distinta de la del paquete cmi5 (…/elr) para que los dos
 * paquetes convivan en el mismo LRS. Debe coincidir con la de src/layouts/ParteSuelta.astro.
 */
const IRI = 'https://sjsilgom.upv.edu.es/xapi/elr/xapi'
const IDIOMA = 'es-ES'
const SALIDA = path.join(RAIZ, 'xapi')
const LIBRERIA = path.join('vendor', 'xapiwrapper.min.js')
const PAGINA = 'leccion/index.html'

exigirBuild('xapi')
const elegidos = elegirModulos(modulos, process.argv.slice(2))

for (const modulo of elegidos) {
	const { leccion, partes, slug } = modulo
	const salida = path.join(SALIDA, slug)
	const zip = path.join(SALIDA, `elr-${slug}-xapi.zip`)

	prepararCarpeta(salida)
	fs.mkdirSync(path.join(salida, 'vendor'))
	fs.copyFileSync(path.join(DIST, LIBRERIA), path.join(salida, LIBRERIA))

	// La página va un nivel por debajo de la raíz: las rutas absolutas pasan a «../».
	const html = fs
		.readFileSync(path.join(DIST, 'xapi', slug, 'index.html'), 'utf8')
		.replace(/(href|src)="\/(?!\/)/g, '$1="../')
	fs.mkdirSync(path.join(salida, path.dirname(PAGINA)))
	fs.writeFileSync(path.join(salida, PAGINA), html)

	const id = `${IRI}/${slug}`
	const minutos = partes.reduce((n, p) => n + p.minutos, 0)
	const xml = `<?xml version="1.0" encoding="utf-8"?>
<tincan xmlns="http://projecttincan.com/tincan.xsd">
	<activities>
		<activity id="${id}" type="http://adlnet.gov/expapi/activities/course">
			<name lang="${IDIOMA}">${escapar(`${leccion.tramo} — ${leccion.titulo}`)}</name>
			<description lang="${IDIOMA}">${escapar(`${leccion.descripcion} ${minutos} min aprox.`)}</description>
			<launch lang="${IDIOMA}">${PAGINA}</launch>
		</activity>
${partes
	.map(
		(parte) => `		<activity id="${id}/seccion/${parte.id}" type="http://adlnet.gov/expapi/activities/module">
			<name lang="${IDIOMA}">${escapar(`${parte.numero}. ${parte.titulo}`)}</name>
		</activity>`,
	)
	.join('\n')}
	</activities>
</tincan>
`
	fs.writeFileSync(path.join(salida, 'tincan.xml'), xml)

	const kb = comprimir(salida, zip)
	console.log(`Paquete xAPI generado: ${path.relative(RAIZ, zip)} (${kb} KB)`)
	console.log(`  1 página con ${partes.length} secciones (${PAGINA}); librería ${LIBRERIA}`)
	avisarAusentes(buscarAusentes(salida, [PAGINA]))
}
