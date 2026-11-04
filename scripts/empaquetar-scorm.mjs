/**
 * Convierte el build de Astro en un paquete SCORM 1.2 por módulo.
 *
 * Para cada módulo de src/data/modulos.ts toma las páginas de
 * dist/scorm/<modulo>/<parte>/ y escribe un imsmanifest.xml con un SCO por parte,
 * para que el LMS siga el progreso de cada una por separado.
 *
 *   node scripts/empaquetar-scorm.mjs              # todos los módulos
 *   node scripts/empaquetar-scorm.mjs modulo-2     # solo uno
 *
 * Salida: scorm/elr-<modulo>-scorm.zip (y la carpeta scorm/<modulo>-paquete/).
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
	listarComunes,
	prepararCarpeta,
} from './paquete-comun.mjs'

exigirBuild('scorm')

for (const modulo of elegirModulos(modulos, process.argv.slice(2))) {
	const { leccion, partes, slug } = modulo
	const salida = path.join(RAIZ, 'scorm', `${slug}-paquete`)
	const zip = path.join(RAIZ, 'scorm', `elr-${slug}-scorm.zip`)

	prepararCarpeta(salida)
	const paginas = copiarPartes({ plataforma: 'scorm', modulo, salida, base: 'partes' })
	const comunes = listarComunes(salida)

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

	fs.writeFileSync(path.join(salida, 'imsmanifest.xml'), manifiesto)
	const kb = comprimir(salida, zip)

	console.log(`Paquete SCORM 1.2 generado: ${path.relative(RAIZ, zip)} (${kb} KB)`)
	console.log(`  ${partes.length} SCOs, uno por parte`)
	console.log(`  ${comunes.length} recursos compartidos`)
	avisarAusentes(buscarAusentes(salida, paginas))
}
