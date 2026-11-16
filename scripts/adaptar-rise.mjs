/**
 * Adapta la exportación xAPI (Tin Can) de Articulate Rise 360 al curso elr y la
 * vuelve a comprimir, lista para subirla a lrs.io.
 *
 *   node scripts/adaptar-rise.mjs [ruta-del-zip-de-rise]
 *
 * Sin argumento busca el zip de Rise en la raíz del proyecto o en articulate/original/.
 *
 * Qué cambia (solo tincan.xml y tc-config.js; el contenido de Rise queda intacto):
 *   - El IRI del curso pasa del ID aleatorio de Rise a la raíz de IRIs del proyecto.
 *     Las lecciones y preguntas cuelgan de él, así que cambian con él.
 *   - Idioma «en» → «es-ES»: el curso está en español.
 *   - Quita los sufijos «/blocks» y «/quiz» que Rise añade a los nombres de las lecciones.
 *
 * No mete credenciales: el paquete se lanza desde lrs.io, que pasa endpoint, auth
 * y actor en la URL de lanzamiento (scormdriver/driverOptions.js queda vacío).
 *
 * Salida:
 *   articulate/rise-permisos/              carpeta del paquete adaptado
 *   articulate/elr-rise-permisos-xapi.zip  zip para subir a lrs.io
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { RAIZ, comprimir } from './paquete-comun.mjs'

/** No cambiarlo una vez publicado: el LRS lo trataría como un curso nuevo. */
const IRI = 'https://sjsilgom.upv.edu.es/xapi/elr/rise/permisos-linux'
const IDIOMA = 'es-ES'

const CARPETA = path.join(RAIZ, 'articulate')
const ORIGINALES = path.join(CARPETA, 'original')
const SALIDA = path.join(CARPETA, 'rise-permisos')
const ZIP = path.join(CARPETA, 'elr-rise-permisos-xapi.zip')

const esRise = (f) => /-xapi-.*\.zip$/.test(f)

function buscarZip() {
	const arg = process.argv[2]
	if (arg) return path.resolve(arg)
	for (const dir of [RAIZ, ORIGINALES]) {
		if (!fs.existsSync(dir)) continue
		const zip = fs.readdirSync(dir).find(esRise)
		if (zip) return path.join(dir, zip)
	}
	console.error('No encuentro el zip xAPI de Rise. Pásalo como argumento o déjalo en la raíz del proyecto.')
	process.exit(1)
}

// 1. Guardar el original en articulate/original/ (sin tocarlo) y descomprimirlo.
let original = buscarZip()
if (path.dirname(original) === RAIZ) {
	fs.mkdirSync(ORIGINALES, { recursive: true })
	const destino = path.join(ORIGINALES, path.basename(original))
	fs.renameSync(original, destino)
	original = destino
}
fs.rmSync(SALIDA, { recursive: true, force: true })
fs.mkdirSync(SALIDA, { recursive: true })
execFileSync('unzip', ['-q', original, '-d', SALIDA])

const tcConfig = path.join(SALIDA, 'tc-config.js')
const tincan = path.join(SALIDA, 'tincan.xml')

// 2. El ID que Rise puso al curso, sacado de tc-config.js.
const config = fs.readFileSync(tcConfig, 'utf8')
const idRise = config.match(/TC_COURSE_ID\s*=\s*"([^"]+)"/)?.[1]
if (!idRise) {
	console.error('tc-config.js no tiene TC_COURSE_ID: ¿es una exportación xAPI de Rise?')
	process.exit(1)
}
const cambiarId = (s) => s.split(idRise).join(IRI)

fs.writeFileSync(tcConfig, cambiarId(config).replace(/\{"en":/g, `{"${IDIOMA}":`))

const xml = cambiarId(fs.readFileSync(tincan, 'utf8'))
	.replace(/lang="en"/g, `lang="${IDIOMA}"`)
	.replace(/\/(?:blocks|quiz)<\/name>/g, '</name>')
	.replace('>Quiz</name>', '>Cuestionario</name>')
fs.writeFileSync(tincan, xml)

// 3. Comprobaciones: no queda el ID viejo en ningún archivo de texto y el XML está bien formado.
const restos = fs
	.readdirSync(SALIDA, { recursive: true })
	.filter((f) => /\.(js|xml|html)$/.test(f))
	.filter((f) => fs.readFileSync(path.join(SALIDA, f), 'utf8').includes(idRise))
if (restos.length) {
	console.error(`Queda el ID de Rise (${idRise}) en: ${restos.join(', ')}`)
	process.exit(1)
}
try {
	execFileSync('xmllint', ['--noout', tincan], { stdio: 'pipe' })
} catch (e) {
	console.error(`tincan.xml no es XML válido:\n${e.stderr}`)
	process.exit(1)
}

// 4. Comprimir con tincan.xml en la raíz.
const kb = comprimir(SALIDA, ZIP)
const actividades = (xml.match(/<activity\b/g) || []).length
console.log(`Paquete xAPI de Rise generado: ${path.relative(RAIZ, ZIP)} (${kb} KB)`)
console.log(`  Curso: ${IRI}`)
console.log(`  ${actividades} actividades en tincan.xml, idioma ${IDIOMA}`)
console.log(`  Original guardado en ${path.relative(RAIZ, original)}`)
