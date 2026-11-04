/**
 * Piezas comunes a los empaquetadores de SCORM y cmi5.
 *
 * Los dos parten del build de Astro (dist/<plataforma>/<modulo>/<parte>/index.html),
 * copian los recursos compartidos a la raíz del paquete, reescriben las rutas
 * absolutas a relativas (un paquete se sirve desde una carpeta cualquiera, no
 * desde la raíz de un dominio) y comprimen el resultado.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

export const RAIZ = path.resolve(import.meta.dirname, '..')
export const DIST = path.join(RAIZ, 'dist')

/** Recursos que comparten todas las partes: CSS, JS y multimedia. */
const CARPETAS_COMUNES = ['_astro', 'media']

export const escapar = (s) =>
	String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Corta con un mensaje claro si falta el build de Astro. */
export function exigirBuild(subcarpeta) {
	if (!fs.existsSync(path.join(DIST, subcarpeta))) {
		console.error(`No encuentro dist/${subcarpeta}. Ejecuta antes: npm run build`)
		process.exit(1)
	}
}

/** Vacía la carpeta del paquete y copia en su raíz los recursos compartidos. */
export function prepararCarpeta(salida) {
	fs.rmSync(salida, { recursive: true, force: true })
	fs.mkdirSync(salida, { recursive: true })
	for (const carpeta of CARPETAS_COMUNES) {
		const origen = path.join(DIST, carpeta)
		if (fs.existsSync(origen)) fs.cpSync(origen, path.join(salida, carpeta), { recursive: true })
	}
	fs.copyFileSync(path.join(DIST, 'favicon.svg'), path.join(salida, 'favicon.svg'))
}

/**
 * Copia las páginas de un módulo a <salida>/<base>/<parte>/index.html con las
 * rutas absolutas pasadas a relativas. Devuelve las rutas de las páginas.
 */
export function copiarPartes({ plataforma, modulo, salida, base }) {
	// De <base>/<parte>/index.html a la raíz del paquete hay un nivel por cada
	// segmento de <base>, más el de la propia parte.
	const prefijo = '../'.repeat(base.split('/').length + 1)
	return modulo.partes.map((parte) => {
		const origen = path.join(DIST, plataforma, modulo.slug, parte.id, 'index.html')
		const html = fs.readFileSync(origen, 'utf8').replace(/(href|src)="\/(?!\/)/g, `$1="${prefijo}`)
		const relativo = `${base}/${parte.id}/index.html`
		fs.mkdirSync(path.join(salida, base, parte.id), { recursive: true })
		fs.writeFileSync(path.join(salida, relativo), html)
		return relativo
	})
}

/** Lista los recursos compartidos que hay en el paquete (para el manifiesto SCORM). */
export function listarComunes(salida) {
	const recorrer = (dir, base = '') =>
		fs.readdirSync(path.join(salida, dir, base), { withFileTypes: true }).flatMap((e) =>
			e.isDirectory()
				? recorrer(dir, path.join(base, e.name))
				: [path.posix.join(dir, base.split(path.sep).join('/'), e.name)],
		)
	return CARPETAS_COMUNES.filter((d) => fs.existsSync(path.join(salida, d)))
		.flatMap((d) => recorrer(d))
		.concat('favicon.svg')
}

/** Comprime el paquete con su manifiesto en la raíz, que es lo que exigen ambas normas. */
export function comprimir(salida, zip) {
	fs.mkdirSync(path.dirname(zip), { recursive: true })
	fs.rmSync(zip, { force: true })
	execFileSync('zip', ['-r', '-q', zip, '.', '-x', '.*'], { cwd: salida })
	return (fs.statSync(zip).size / 1024).toFixed(1)
}

/** Recursos que las páginas enlazan pero no están en el paquete. */
export function buscarAusentes(salida, paginas) {
	const ausentes = new Set()
	for (const relativo of paginas) {
		const html = fs.readFileSync(path.join(salida, relativo), 'utf8')
		const base = path.posix.dirname(relativo)
		for (const [, ref] of html.matchAll(/(?:href|src)="(\.\.\/[^"]+)"/g)) {
			const destino = path.posix.normalize(path.posix.join(base, ref.split('?')[0]))
			if (!fs.existsSync(path.join(salida, destino))) ausentes.add(destino)
		}
	}
	return [...ausentes].sort()
}

export function avisarAusentes(ausentes) {
	if (!ausentes.length) return
	console.warn(`  AVISO: ${ausentes.length} recurso(s) que las páginas enlazan pero no existen todavía:`)
	for (const f of ausentes) console.warn(`    ${f}`)
	console.warn('  El paquete es válido, pero esos reproductores saldrán vacíos hasta que los añadas.')
}

/** Módulos a empaquetar: todos, o solo los que se pasen por argumento (modulo-2 …). */
export function elegirModulos(modulos, argumentos) {
	if (!argumentos.length) return modulos
	const elegidos = modulos.filter((m) => argumentos.includes(m.slug))
	const desconocidos = argumentos.filter((a) => !modulos.some((m) => m.slug === a))
	if (desconocidos.length) {
		console.error(`Módulo(s) no registrados en src/data/modulos.ts: ${desconocidos.join(', ')}`)
		process.exit(1)
	}
	return elegidos
}
