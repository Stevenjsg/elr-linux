/**
 * Saca de lrs.io los últimos statements de un paquete, una línea por statement,
 * listos para pegar en la caja de texto de la tarea.
 *
 *   pnpm statements rise           # curso de Rise (Articulate)
 *   pnpm statements tutorial       # tutorial web con xAPI Launch (módulo 2)
 *   pnpm statements <IRI> [n]      # cualquier actividad; n = cuántos (20 por defecto)
 *
 * Credenciales en .env (ya está en .gitignore). En lrs.io: tu LRS → Access Keys →
 * crea una clave de solo lectura.
 *
 *   LRS_ENDPOINT=https://<tu-lrs>.lrs.io/xapi/
 *   LRS_KEY=…
 *   LRS_SECRET=…
 */
const ACTIVIDADES = {
	rise: 'https://sjsilgom.upv.edu.es/xapi/elr/rise/permisos-linux',
	tutorial: 'https://sjsilgom.upv.edu.es/xapi/elr/xapi/modulo-2',
}

const { LRS_ENDPOINT, LRS_KEY, LRS_SECRET } = process.env
if (!LRS_ENDPOINT || !LRS_KEY || !LRS_SECRET) {
	console.error('Faltan LRS_ENDPOINT, LRS_KEY o LRS_SECRET en .env')
	process.exit(1)
}

const [cual = 'tutorial', n = '20'] = process.argv.slice(2)
const actividad = ACTIVIDADES[cual] || cual
const endpoint = LRS_ENDPOINT.endsWith('/') ? LRS_ENDPOINT : LRS_ENDPOINT + '/'
const params = new URLSearchParams({ activity: actividad, related_activities: 'true', limit: n })

const r = await fetch(`${endpoint}statements?${params}`, {
	headers: {
		Authorization: 'Basic ' + Buffer.from(`${LRS_KEY}:${LRS_SECRET}`).toString('base64'),
		'X-Experience-API-Version': '1.0.3',
	},
})
if (!r.ok) {
	console.error(`El LRS responde ${r.status}: ${await r.text()}`)
	process.exit(1)
}
const { statements } = await r.json()

const display = (m) => (m && (m['es-ES'] || m['es'] || m['en-US'] || m['und'] || Object.values(m)[0])) || ''
const quien = (a) => a.name || a.mbox?.replace('mailto:', '') || a.account?.name || '¿?'
// Quita etiquetas HTML (Rise mete <code> en los enunciados) y acorta lo muy largo.
const corto = (s, max = 90) => {
	let t = String(s).replace(/<[^>]+>/g, '')
	// Rise escapa las comillas dos veces (&amp;quot;): se deshace hasta que no quede nada.
	for (let antes = ''; antes !== t; ) {
		antes = t
		t = t.replace(/&(amp|quot|#39|apos|lt|gt);/g, (_, e) => ({ amp: '&', quot: '"', '#39': "'", apos: "'", lt: '<', gt: '>' })[e])
	}
	t = t.replace(/\s+/g, ' ').trim()
	return t.length > max ? t.slice(0, max - 1) + '…' : t
}
const que = (o) => corto(display(o.definition?.name) || o.id.split('/').pop())

/** Rise manda la respuesta como id de opción: se traduce al texto de esa opción. */
function respuesta(res, objeto) {
	const opciones = objeto.definition?.choices || []
	return res
		.split('[,]')
		.map((id) => {
			const o = opciones.find((c) => c.id === id)
			return o ? corto(display(o.description), 60) : id
		})
		.join(' + ')
}

function resultado(res, objeto) {
	if (!res) return ''
	const partes = []
	if (res.score?.raw !== undefined) partes.push(`nota ${res.score.raw}/${res.score.max ?? 100}`)
	else if (res.score?.scaled !== undefined) partes.push(`nota ${Math.round(res.score.scaled * 100)} %`)
	if (res.success !== undefined) partes.push(res.success ? 'correcto' : 'incorrecto')
	if (res.response) partes.push(`respuesta «${respuesta(res.response, objeto)}»`)
	return partes.length ? ` (${partes.join(', ')})` : ''
}

// El LRS los da del más nuevo al más antiguo: se listan en orden cronológico.
for (const s of statements.reverse()) {
	const hora = new Date(s.timestamp).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'medium' })
	const verbo = display(s.verb.display) || s.verb.id.split('/').pop()
	console.log(`${hora} · ${quien(s.actor)} · ${verbo} · ${que(s.object)}${resultado(s.result, s.object)}`)
}
if (!statements.length) console.log(`No hay statements de ${actividad} todavía.`)
