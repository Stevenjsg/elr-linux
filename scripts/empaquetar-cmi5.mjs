/**
 * Convierte el build de Astro en paquetes cmi5 (xAPI) para lrs.io u otro LMS cmi5.
 *
 * Genera dos tipos de paquete a partir de src/data/modulos.ts:
 *
 *   cmi5/elr-<modulo>-cmi5.zip   Un curso por módulo, con una AU por parte.
 *   cmi5/elr-curso-cmi5.zip      El curso entero: un bloque por módulo, con una
 *                                AU por parte. Al registrar el módulo 3 en
 *                                modulos.ts entra aquí solo.
 *
 * Cada parte es una AU independiente para que la plataforma siga el progreso
 * parte a parte, igual que los SCOs del paquete SCORM. Los identificadores de las
 * AUs son los mismos en los dos tipos de paquete, así que los statements de una
 * parte se pueden comparar sea cual sea el paquete que se haya subido.
 *
 *   node scripts/empaquetar-cmi5.mjs              # todos los módulos + curso entero
 *   node scripts/empaquetar-cmi5.mjs modulo-2     # solo ese módulo (y el curso con él)
 */
import fs from 'node:fs'
import path from 'node:path'
import { modulos } from '../src/data/modulos.ts'
import {
	RAIZ,
	avisarAusentes,
	buscarAusentes,
	comprimir,
	copiarPartes,
	elegirModulos,
	escapar,
	exigirBuild,
	prepararCarpeta,
} from './paquete-comun.mjs'

/**
 * Raíz de los identificadores (IRIs) del curso, los bloques y las AUs. Son
 * identificadores, no URLs que tengan que funcionar: no cambiarlos nunca una vez
 * publicados, o el LRS tratará las partes como actividades nuevas.
 */
const IRI = 'https://sjsilgom.upv.edu.es/xapi/elr'
const IDIOMA = 'es-ES'
const SALIDA = path.join(RAIZ, 'cmi5')

const texto = (etiqueta, valor, sangria) =>
	`${sangria}<${etiqueta}>\n${sangria}\t<langstring lang="${IDIOMA}">${escapar(valor)}</langstring>\n${sangria}</${etiqueta}>`

/**
 * Una AU por parte. Las partes con cuestionario se superan aprobando (moveOn
 * Passed, con la nota de corte en masteryScore); el resto, completándolas.
 */
function aus(modulo, base, sangria) {
	return modulo.partes
		.map((parte) => {
			const corte = parte.notaMinima ? ` masteryScore="${parte.notaMinima / 100}"` : ''
			const moveOn = parte.notaMinima ? 'Passed' : 'Completed'
			const descripcion = `Parte ${parte.numero} de «${modulo.leccion.titulo}». ${parte.minutos} min aprox.`
			return [
				`${sangria}<au id="${IRI}/${modulo.slug}/${parte.id}" moveOn="${moveOn}"${corte} launchMethod="AnyWindow">`,
				texto('title', `${parte.numero}. ${parte.titulo}`, sangria + '\t'),
				texto('description', descripcion, sangria + '\t'),
				`${sangria}\t<url>${base}/${parte.id}/index.html</url>`,
				`${sangria}</au>`,
			].join('\n')
		})
		.join('\n')
}

const cabecera = (id, titulo, descripcion) => `<?xml version="1.0" encoding="utf-8"?>
<courseStructure xmlns="https://w3id.org/xapi/profiles/cmi5/v1/CourseStructure.xsd">
	<course id="${id}">
${texto('title', titulo, '\t\t')}
${texto('description', descripcion, '\t\t')}
	</course>`

function informar(zip, kb, detalle, salida, paginas) {
	console.log(`Paquete cmi5 generado: ${path.relative(RAIZ, zip)} (${kb} KB)`)
	console.log(`  ${detalle}`)
	avisarAusentes(buscarAusentes(salida, paginas))
}

exigirBuild('cmi5')
const elegidos = elegirModulos(modulos, process.argv.slice(2))

// 1. Un paquete por módulo.
for (const modulo of elegidos) {
	const { leccion, partes, slug } = modulo
	const salida = path.join(SALIDA, slug)
	const zip = path.join(SALIDA, `elr-${slug}-cmi5.zip`)

	prepararCarpeta(salida)
	const paginas = copiarPartes({ plataforma: 'cmi5', modulo, salida, base: 'partes' })

	const xml = `${cabecera(`${IRI}/${slug}`, `${leccion.tramo} — ${leccion.titulo}`, leccion.descripcion)}
${aus(modulo, 'partes', '\t')}
</courseStructure>
`
	fs.writeFileSync(path.join(salida, 'cmi5.xml'), xml)
	informar(zip, comprimir(salida, zip), `${partes.length} AUs, una por parte`, salida, paginas)
}

// 2. El curso entero: un bloque por módulo.
{
	const salida = path.join(SALIDA, 'curso')
	const zip = path.join(SALIDA, 'elr-curso-cmi5.zip')
	prepararCarpeta(salida)

	const paginas = []
	const bloques = elegidos
		.map((modulo) => {
			const base = `${modulo.slug}/partes`
			paginas.push(...copiarPartes({ plataforma: 'cmi5', modulo, salida, base }))
			return [
				`\t<block id="${IRI}/curso/${modulo.slug}">`,
				texto('title', `${modulo.leccion.tramo} — ${modulo.leccion.titulo}`, '\t\t'),
				texto('description', modulo.leccion.descripcion, '\t\t'),
				aus(modulo, base, '\t\t'),
				'\t</block>',
			].join('\n')
		})
		.join('\n')

	const xml = `${cabecera(
		`${IRI}/curso`,
		'elr — Linux desde cero',
		'Curso elr: aprende a usar la terminal de Linux sin miedo a romper nada.',
	)}
${bloques}
</courseStructure>
`
	fs.writeFileSync(path.join(salida, 'cmi5.xml'), xml)
	const total = elegidos.reduce((n, m) => n + m.partes.length, 0)
	informar(zip, comprimir(salida, zip), `${elegidos.length} bloque(s), ${total} AUs`, salida, paginas)
}
