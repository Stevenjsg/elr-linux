/**
 * Convierte el build de Astro en un paquete SCORM 1.2 del módulo 2.
 *
 * Toma las páginas que Astro genera en dist/scorm/modulo-2/<id>/, las reorganiza,
 * reescribe las rutas absolutas de los recursos a relativas (un paquete SCORM se
 * sirve desde una carpeta cualquiera, no desde la raíz de un dominio) y escribe
 * un imsmanifest.xml con un SCO por parte, para que el LMS siga el progreso de
 * cada una por separado.
 *
 *   node scripts/empaquetar-scorm.mjs
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { partes, leccion } from '../src/data/modulo-2.ts'

const RAIZ = path.resolve(import.meta.dirname, '..')
const DIST = path.join(RAIZ, 'dist')
const SALIDA = path.join(RAIZ, 'scorm', 'modulo-2-paquete')
const ZIP = path.join(RAIZ, 'scorm', 'elr-modulo-2-scorm.zip')

const escapar = (s) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

if (!fs.existsSync(path.join(DIST, 'scorm', 'modulo-2'))) {
	console.error('No encuentro dist/scorm/modulo-2. Ejecuta antes: npm run build')
	process.exit(1)
}

fs.rmSync(SALIDA, { recursive: true, force: true })
fs.mkdirSync(SALIDA, { recursive: true })

// 1. Recursos compartidos: CSS, JS y multimedia, en la raíz del paquete.
for (const carpeta of ['_astro', 'media']) {
	const origen = path.join(DIST, carpeta)
	if (fs.existsSync(origen)) {
		fs.cpSync(origen, path.join(SALIDA, carpeta), { recursive: true })
	}
}
fs.copyFileSync(path.join(DIST, 'favicon.svg'), path.join(SALIDA, 'favicon.svg'))

// 2. Una carpeta por parte, con las rutas absolutas pasadas a relativas.
//    De partes/<id>/index.html a la raíz del paquete hay dos niveles.
const PREFIJO = '../../'
const ficheros = []

for (const parte of partes) {
	const origen = path.join(DIST, 'scorm', 'modulo-2', parte.id, 'index.html')
	let html = fs.readFileSync(origen, 'utf8')

	html = html.replace(/(href|src)="\/(?!\/)/g, `$1="${PREFIJO}`)

	const destino = path.join(SALIDA, 'partes', parte.id)
	fs.mkdirSync(destino, { recursive: true })
	fs.writeFileSync(path.join(destino, 'index.html'), html)
	ficheros.push(`partes/${parte.id}/index.html`)
}

// 3. Listado de recursos compartidos para el manifiesto.
const recorrer = (dir, base = '') =>
	fs.readdirSync(path.join(SALIDA, dir, base), { withFileTypes: true }).flatMap((e) =>
		e.isDirectory()
			? recorrer(dir, path.join(base, e.name))
			: [path.posix.join(dir, base.split(path.sep).join('/'), e.name)],
	)

const comunes = ['_astro', 'media']
	.filter((d) => fs.existsSync(path.join(SALIDA, d)))
	.flatMap((d) => recorrer(d))
	.concat('favicon.svg')

// 4. imsmanifest.xml: un SCO por parte, más un recurso de assets compartidos.
const items = partes
	.map((parte) => {
		// Las partes con cuestionario declaran nota mínima: el LMS marca passed/failed.
		const maestria = parte.notaMinima
			? `\n				<adlcp:masteryscore>${parte.notaMinima}</adlcp:masteryscore>`
			: ''
		return `			<item identifier="item-${parte.id}" identifierref="sco-${parte.id}">
				<title>${escapar(`${parte.numero}. ${parte.titulo}`)}</title>${maestria}
			</item>`
	})
	.join('\n')

const recursosSco = partes
	.map(
		(parte) => `		<resource identifier="sco-${parte.id}" type="webcontent" adlcp:scormtype="sco" href="partes/${parte.id}/index.html">
			<file href="partes/${parte.id}/index.html"/>
			<dependency identifierref="recursos-comunes"/>
		</resource>`,
	)
	.join('\n')

const manifiesto = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="elr-modulo-0${leccion.modulo}" version="1.0"
	xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
	xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
	                    http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd
	                    http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd">

	<metadata>
		<schema>ADL SCORM</schema>
		<schemaversion>1.2</schemaversion>
	</metadata>

	<organizations default="elr-org">
		<organization identifier="elr-org">
			<title>${escapar(`${leccion.tramo} — ${leccion.titulo}`)}</title>
${items}
		</organization>
	</organizations>

	<resources>
${recursosSco}
		<resource identifier="recursos-comunes" type="webcontent" adlcp:scormtype="asset">
${comunes.map((f) => `			<file href="${escapar(f)}"/>`).join('\n')}
		</resource>
	</resources>
</manifest>
`

fs.writeFileSync(path.join(SALIDA, 'imsmanifest.xml'), manifiesto)

// 5. Comprimir con el manifiesto en la raíz, que es lo que exige la norma.
fs.rmSync(ZIP, { force: true })
execFileSync('zip', ['-r', '-q', ZIP, '.', '-x', '.*'], { cwd: SALIDA })

// 6. Avisar de lo que las páginas referencian pero no está en el paquete.
const ausentes = new Set()
for (const relativo of ficheros) {
	const html = fs.readFileSync(path.join(SALIDA, relativo), 'utf8')
	const base = path.posix.dirname(relativo)
	for (const [, ref] of html.matchAll(/(?:href|src)="(\.\.\/[^"]+)"/g)) {
		const destino = path.posix.normalize(path.posix.join(base, ref.split('?')[0]))
		if (!fs.existsSync(path.join(SALIDA, destino))) ausentes.add(destino)
	}
}

const kb = (fs.statSync(ZIP).size / 1024).toFixed(1)
console.log(`Paquete SCORM 1.2 generado: scorm/elr-modulo-2-scorm.zip (${kb} KB)`)
console.log(`  ${partes.length} SCOs, uno por parte`)
console.log(`  ${comunes.length} recursos compartidos`)

if (ausentes.size) {
	console.warn(`\n  AVISO: ${ausentes.size} recurso(s) que las páginas enlazan pero no existen todavía:`)
	for (const f of [...ausentes].sort()) console.warn(`    ${f}`)
	console.warn('  El paquete es válido, pero esos reproductores saldrán vacíos hasta que los añadas.')
}
