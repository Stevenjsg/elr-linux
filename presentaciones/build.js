// Presentación «Permisos en Linux» con el sistema visual del curso elr.
const pptxgen = require("pptxgenjs");
const JSZip = require("jszip");
const fs = require("fs");
const { applyTheme } = require("/home/sjsilgom/.claude/skills/synced/10e1dc5c-85e0-4f41-b7d5-f6e735f93821_acdb451d-d8b2-4999-b0c2-aca7210eb949/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "permisos-linux.pptx";

// Paleta elr: «la terminal no es negra»
const HEX = { tinta: "1E1046", uva: "5B2EE5", lila: "EDE6FF", chicle: "FF3D8B", lima: "A8E80B", blanco: "FFFFFF" };
const THEME = {
  name: "elr",
  headFontFace: "Bricolage Grotesque",
  bodyFontFace: "Arial",
  colors: {
    dk1: HEX.tinta, lt1: HEX.blanco, dk2: HEX.uva, lt2: HEX.lila,
    accent1: HEX.uva, accent2: HEX.chicle, accent3: HEX.lima, accent4: HEX.tinta,
    accent5: "7A5CF0", accent6: "FFB3D1", hlink: HEX.uva, folHlink: HEX.tinta,
  },
};
const MONO = "Courier New";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Permisos en Linux";
pres.author = "elr";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const tinta = C.text1, uva = C.text2, blanco = C.background1, lila = C.background2, chicle = C.accent2, lima = C.accent3;

const W = 13.333;
const sombra = (color = HEX.uva, off = 5) => ({ type: "outer", color, blur: 0, offset: off, angle: 45, opacity: 1 });
const borde = (color = tinta) => ({ color, width: 2.25 });

// ---------- Layouts ----------
const pie = (color) => [
  { text: { text: "elr · Permisos en Linux", options: { x: 0.6, y: 6.95, w: 6, h: 0.3, fontSize: 11, color, margin: 0 } } },
];
pres.defineSlideMaster({
  title: "PORTADA",
  background: { color: HEX.tinta },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 2.0, w: 6.6, h: 1.9, fontSize: 50, bold: true, color: lila, align: "left", valign: "top", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.6, y: 4.15, w: 6.4, h: 0.9, fontSize: 20, color: lila, align: "left", valign: "top", margin: 0 }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENIDO",
  background: { color: HEX.lila },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.4, w: 12.1, h: 0.8, fontSize: 36, bold: true, color: tinta, align: "left", valign: "middle", margin: 0 }, text: "" } },
    ...pie(tinta),
  ],
  slideNumber: { x: 12.2, y: 6.95, w: 0.5, h: 0.3, fontSize: 11, color: tinta, align: "right" },
});
pres.defineSlideMaster({
  title: "CIERRE",
  background: { color: HEX.tinta },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.4, w: 12.1, h: 0.8, fontSize: 36, bold: true, color: lila, align: "left", valign: "middle", margin: 0 }, text: "" } },
    ...pie(lila),
  ],
  slideNumber: { x: 12.2, y: 6.95, w: 0.5, h: 0.3, fontSize: 11, color: lila, align: "right" },
});

// ---------- Piezas reutilizables ----------
// Ventana de terminal: tarjeta blanca, borde tinta, sombra dura uva, barra uva con tres puntos.
function terminal(slide, x, y, w, h, lineas, nombre, fs = 14) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.1, fill: { color: blanco }, line: borde(), shadow: sombra(), objectName: `${nombre}-fondo` });
  slide.addShape(pres.shapes.RECTANGLE, { x: x + 0.04, y: y + 0.04, w: w - 0.08, h: 0.48, fill: { color: uva }, line: { type: "none" }, objectName: `${nombre}-barra` });
  slide.addShape(pres.shapes.LINE, { x, y: y + 0.52, w, h: 0, line: borde(), objectName: `${nombre}-linea` });
  [HEX.chicle, HEX.lima, HEX.blanco].forEach((c, i) =>
    slide.addShape(pres.shapes.OVAL, { x: x + 0.22 + i * 0.3, y: y + 0.17, w: 0.18, h: 0.18, fill: { color: c }, line: { color: tinta, width: 1 }, objectName: `${nombre}-punto${i + 1}` })
  );
  slide.addText("bash", { x: x + 1.2, y: y + 0.04, w: w - 2.4, h: 0.48, fontFace: MONO, fontSize: 12, bold: true, color: blanco, align: "center", valign: "middle", margin: 0, isTextBox: true });
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.1, fill: { type: "none" }, line: borde(), objectName: `${nombre}-borde` });
  slide.addText(lineas, { x: x + 0.3, y: y + 0.75, w: w - 0.6, h: h - 0.95, fontFace: MONO, fontSize: fs, color: tinta, valign: "top", margin: 0, paraSpaceAfter: 4, isTextBox: true, objectName: `${nombre}-texto` });
}
const L = (text, opts = {}) => ({ text, options: { breakLine: true, ...opts } });

// Tarjeta blanca con borde y sombra dura
function tarjeta(slide, x, y, w, h, nombre, fill = blanco, shadowColor = HEX.uva) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: borde(), shadow: sombra(shadowColor), objectName: nombre });
}

// ---------- Enlaces internos ----------
// Números de diapositiva tras añadir el índice
const DIAPO = { portada: 1, indice: 2, leer: 3, numeros: 4, chmod: 5 };
// Capa invisible clicable encima de una zona: todo el rectángulo salta a la diapositiva
function enlace(slide, x, y, w, h, destino, tooltip, nombre) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color: blanco, transparency: 100 }, line: { type: "none" },
    hyperlink: { slide: destino, tooltip }, objectName: nombre,
  });
}
// Botón «← Índice» arriba a la derecha de cada diapositiva de contenido
function botonIndice(slide) {
  const x = 11.15, y = 0.55, w = 1.55, h = 0.48;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.24, fill: { color: lima }, line: borde(), objectName: "boton-indice" });
  slide.addText("← Índice", { x, y, w, h, fontSize: 14, bold: true, color: tinta, align: "center", valign: "middle", margin: 0, isTextBox: true });
  enlace(slide, x, y, w, h, DIAPO.indice, "Volver al índice", "enlace-indice");
}

// ---------- 1 · Portada ----------
pres.addSection({ title: "Introducción" });
{
  const s = pres.addSlide({ masterName: "PORTADA", sectionTitle: "Introducción" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 0.6, w: 3.7, h: 0.5, rectRadius: 0.25, fill: { color: chicle }, line: borde(tinta), objectName: "etiqueta-tramo" });
  s.addText("Tramo 03 · Lección 1 · 20 min", { x: 0.6, y: 0.6, w: 3.7, h: 0.5, fontSize: 14, bold: true, color: tinta, align: "center", valign: "middle", margin: 0, isTextBox: true });

  s.addText([
    { text: "¿Quién puede " },
    { text: "tocar", options: { highlight: HEX.lima, color: tinta } },
    { text: " este archivo?" },
  ], { placeholder: "title" });
  s.addText("Permisos en Linux: leer, escribir y ejecutar, sin miedo.", { placeholder: "body" });
  s.addText("Abre la terminal. No se rompe nada.", { x: 0.6, y: 5.4, w: 6.4, h: 0.4, fontSize: 16, italic: true, color: lila, margin: 0, isTextBox: true });

  terminal(s, 7.7, 2.0, 5.0, 3.8, [
    L("$ ls -l notas.txt", { bold: true }),
    L("-rw-r--r-- ana alumnos notas.txt"),
    L(" "),
    L("$ ./saludo.sh", { bold: true }),
    { text: "bash: ./saludo.sh: ", options: {} },
    { text: "Permiso denegado", options: { highlight: HEX.chicle, breakLine: true } },
    L(" "),
    { text: "$ █", options: { bold: true } },
  ], "terminal-portada");

  s.addNotes(
`OBJETIVO DE LA DIAPOSITIVA
Despertar la curiosidad: que el alumnado vea un «Permiso denegado» como una pista que hay que leer, no como un error que asusta.

QUÉ DECIR (guion orientativo, 2 min)
«Alguna vez habréis visto este mensaje: Permiso denegado. No es que Linux esté roto ni que hayáis hecho algo mal. Es Linux protegiendo un archivo. Hoy vamos a aprender a leer quién puede hacer qué con cada archivo, y a cambiarlo cuando haga falta.»

PREGUNTA PARA ABRIR
«¿En Windows o en el móvil habéis visto algo parecido? ¿Una app que pide permiso para usar la cámara?» → Sirve de puente: los permisos son lo mismo, pero para archivos.

SUGERENCIA DIDÁCTICA
Si tienes proyector y terminal, ejecuta en directo ./saludo.sh y deja que falle. Ver el error real engancha más que verlo en la diapositiva.

RESULTADOS DE APRENDIZAJE (al terminar la lección, el alumno podrá…)
1. Leer la cadena de permisos que muestra ls -l.
2. Convertir permisos de letras a números (y al revés).
3. Cambiar permisos con chmod de forma segura.`);
}

// ---------- 2 · Índice con enlaces ----------
pres.addSection({ title: "Índice" });
{
  const s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Índice" });
  s.addText("Elige por dónde empezar", { placeholder: "title" });
  s.addText("Haz clic en una tarjeta para ir a esa parte. El botón «← Índice» te trae de vuelta aquí.",
    { x: 0.6, y: 1.25, w: 12.1, h: 0.45, fontSize: 18, color: tinta, margin: 0, isTextBox: true });

  const temas = [
    { n: "01", tit: "Leer permisos", desc: "Qué significa cada letra de la cadena que muestra ls -l.", muestra: "-rwxr-xr--", destino: DIAPO.leer, fill: lima },
    { n: "02", tit: "Pasar a números", desc: "Por qué r vale 4, w vale 2 y x vale 1, y cómo sumarlos.", muestra: "754", destino: DIAPO.numeros, fill: blanco },
    { n: "03", tit: "Cambiar con chmod", desc: "Dar y quitar permisos con letras o con números. Incluye reto.", muestra: "chmod u+x", destino: DIAPO.chmod, fill: chicle },
  ];
  const cw = 3.8, gap = 0.35, cy = 2.05, ch = 3.75;
  temas.forEach((t, i) => {
    const x = 0.6 + i * (cw + gap);
    tarjeta(s, x, cy, cw, ch, `tarjeta-${t.n}`);
    // número
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: cy + 0.3, w: 0.8, h: 0.8, fill: { color: uva }, line: borde(), objectName: `numero-${t.n}` });
    s.addText(t.n, { x: x + 0.3, y: cy + 0.3, w: 0.8, h: 0.8, fontFace: MONO, fontSize: 20, bold: true, color: blanco, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(t.tit, { x: x + 0.3, y: cy + 1.3, w: cw - 0.6, h: 0.45, fontSize: 22, bold: true, color: tinta, margin: 0, isTextBox: true });
    s.addText(t.desc, { x: x + 0.3, y: cy + 1.8, w: cw - 0.6, h: 0.75, fontSize: 14, color: tinta, valign: "top", margin: 0, isTextBox: true });
    // muestra de código
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.3, y: cy + 2.7, w: cw - 0.6, h: 0.7, rectRadius: 0.1, fill: { color: t.fill }, line: { color: tinta, width: 1.5 }, objectName: `muestra-${t.n}` });
    s.addText([
      { text: t.muestra, options: { fontFace: MONO, bold: true } },
      { text: "   Ir →", options: { fontSize: 14, bold: true } },
    ], { x: x + 0.3, y: cy + 2.7, w: cw - 0.6, h: 0.7, fontSize: 18, color: tinta, align: "center", valign: "middle", margin: 0, isTextBox: true });
    // toda la tarjeta es el enlace
    enlace(s, x, cy, cw, ch, t.destino, `Ir a «${t.tit}»`, `enlace-${t.n}`);
  });

  // consejo de uso
  s.addShape(pres.shapes.RECTANGLE, { x: 0.68, y: 6.24, w: 0.2, h: 0.2, rotate: 45, fill: { color: lima }, line: { color: tinta, width: 1.5 }, objectName: "rombo-consejo" });
  s.addText([
    { text: "Consejo: ", options: { bold: true } },
    { text: "los enlaces funcionan con un clic en modo presentación (F5). Mientras editas, usa Ctrl + clic." },
  ], { x: 1.05, y: 6.15, w: 11.6, h: 0.4, fontSize: 14, color: tinta, valign: "middle", margin: 0, isTextBox: true });

  s.addNotes(
`OBJETIVO
Dar un mapa de la lección y permitir un recorrido no lineal: se puede saltar a cualquier parte y volver.

CÓMO USARLA
· En clase: presenta las tres partes en 30 segundos y sigue en orden (pulsa la tarjeta 01 o avanza normal).
· En repaso o tutoría: pregunta «¿Qué parte os costó más?» y salta directamente con la tarjeta.
· Para autoestudio: el alumnado puede abrir el archivo y navegar solo con las tarjetas y el botón «← Índice».

QUÉ DECIR (1 min)
«Hoy tenemos tres pasos: primero aprendemos a leer los permisos, luego a traducirlos a números, y por último a cambiarlos. Si en algún momento os perdéis, este índice es vuestro punto de partida.»

DETALLES TÉCNICOS
· Cada tarjeta entera es clicable (lleva una capa transparente con el enlace encima).
· En PowerPoint, al pasar el ratón por encima aparece una pista con el destino.
· En la vista de edición, los enlaces se activan con Ctrl + clic; en presentación, con un clic normal.

SUGERENCIA
Si exportas a PDF, los enlaces internos se mantienen en la mayoría de los casos: útil para enviarlo como material de repaso.`);
}

// ---------- 3 · Leer la cadena ----------
pres.addSection({ title: "Leer permisos" });
{
  const s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Leer permisos" });
  botonIndice(s);
  s.addText("Diez letras que lo cuentan todo", { placeholder: "title" });
  s.addText([
    { text: "Escribe " },
    { text: "ls -l", options: { fontFace: MONO, bold: true } },
    { text: " y cada archivo empieza así. Léelo por bloques, de izquierda a derecha:" },
  ], { x: 0.6, y: 1.25, w: 12.1, h: 0.45, fontSize: 18, color: tinta, margin: 0, isTextBox: true });

  const bloques = [
    { txt: "-", w: 1.9, fill: blanco, tit: "Tipo", desc: "- archivo, d carpeta" },
    { txt: "rwx", w: 3.1, fill: lima, tit: "Dueño (u)", desc: "Quien creó el archivo: tú" },
    { txt: "r-x", w: 3.1, fill: blanco, tit: "Grupo (g)", desc: "Tu equipo, p. ej. «alumnos»" },
    { txt: "r--", w: 3.1, fill: chicle, tit: "Otros (o)", desc: "Todos los demás usuarios" },
  ];
  let x = 0.6;
  bloques.forEach((b, i) => {
    tarjeta(s, x, 2.0, b.w, 1.8, `bloque-${b.tit}`, b.fill);
    s.addText(b.txt, { x, y: 2.0, w: b.w, h: 1.8, fontFace: MONO, fontSize: 66, bold: true, color: tinta, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText([
      { text: b.tit, options: { bold: true, fontSize: 20, breakLine: true } },
      { text: b.desc, options: { fontSize: 14 } },
    ], { x, y: 4.0, w: b.w, h: 0.85, color: tinta, align: "center", valign: "top", margin: 0, isTextBox: true });
    x += b.w + 0.3;
  });

  const leyenda = [
    { l: "r", t: "leer", d: "Ver lo que hay dentro" },
    { l: "w", t: "escribir", d: "Cambiar su contenido" },
    { l: "x", t: "ejecutar", d: "Lanzarlo como programa o, si es carpeta, entrar con cd" },
    { l: "-", t: "no", d: "Ese permiso falta" },
  ];
  leyenda.forEach((it, i) => {
    const lx = 0.6 + i * 3.1;
    s.addShape(pres.shapes.OVAL, { x: lx, y: 5.3, w: 0.75, h: 0.75, fill: { color: it.l === "-" ? blanco : uva }, line: borde(), objectName: `leyenda-${it.t}` });
    s.addText(it.l, { x: lx, y: 5.3, w: 0.75, h: 0.75, fontFace: MONO, fontSize: 26, bold: true, color: it.l === "-" ? tinta : blanco, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText([
      { text: it.t, options: { bold: true, fontSize: 16, breakLine: true } },
      { text: it.d, options: { fontSize: 14 } },
    ], { x: lx + 0.9, y: 5.25, w: 2.0, h: 1.4, color: tinta, valign: "top", margin: 0, isTextBox: true });
  });

  s.addNotes(
`OBJETIVO
Que el alumnado sepa leer una cadena como -rwxr-xr-- sin ayuda.

QUÉ DECIR (4 min)
«Esta tira de diez caracteres parece un jeroglífico, pero se lee siempre igual. El primer carácter dice qué es: un guion es un archivo normal, una d es una carpeta. Después vienen tres bloques de tres letras: lo que puede hacer el dueño, lo que puede hacer su grupo y lo que pueden hacer todos los demás.»
Señala cada bloque al nombrarlo. El color ayuda: lima para el dueño (tú), chicle para «los demás».

TRUCO PARA RECORDARLO
El orden siempre es r-w-x («Read, Write, eXecute») y siempre «yo, mi grupo, el resto»: de lo más cercano a lo más lejano.

ACTIVIDAD RÁPIDA (1 min)
Escribe en la pizarra drwxr-x--- y pregunta: «¿Es archivo o carpeta? ¿Puede entrar alguien que no sea del grupo?» (Respuesta: es una carpeta; los «otros» no tienen x, así que no pueden entrar.)

ERROR FRECUENTE
Pensar que el guion inicial es un permiso más. No lo es: es el tipo. Por eso decimos «diez letras, pero nueve permisos».

ACCESIBILIDAD
El color nunca va solo: cada bloque lleva su nombre escrito debajo. Si alguien no distingue colores, la información sigue ahí.`);
}

// ---------- 3 · Números ----------
pres.addSection({ title: "Permisos en números" });
{
  const s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Permisos en números" });
  botonIndice(s);
  s.addText("Cada letra vale un número", { placeholder: "title" });

  [["r", "4"], ["w", "2"], ["x", "1"]].forEach(([l, n], i) => {
    const cx = 0.6 + i * 1.95;
    s.addShape(pres.shapes.OVAL, { x: cx, y: 1.55, w: 1.55, h: 1.55, fill: { color: blanco }, line: borde(), shadow: sombra(), objectName: `valor-${l}` });
    s.addText(n, { x: cx, y: 1.55, w: 1.55, h: 1.55, fontSize: 60, bold: true, color: uva, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(`${l} = ${n}`, { x: cx, y: 3.25, w: 1.55, h: 0.4, fontFace: MONO, fontSize: 18, bold: true, color: tinta, align: "center", margin: 0, isTextBox: true });
  });
  s.addText("Suma cada bloque. Lo que falta vale 0.", { x: 0.6, y: 3.85, w: 5.6, h: 0.4, fontSize: 18, bold: true, color: tinta, margin: 0, isTextBox: true });

  // Caja «¿Sabías qué…?»
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 4.55, w: 5.6, h: 1.75, rectRadius: 0.12, fill: { color: blanco, transparency: 30 }, line: { color: tinta, width: 1 }, objectName: "caja-sabias" });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.88, y: 4.84, w: 0.2, h: 0.2, rotate: 45, fill: { color: lima }, line: { color: tinta, width: 1.5 }, objectName: "rombo-sabias" });
  s.addText("¿Sabías qué…?", { x: 1.25, y: 4.75, w: 4.6, h: 0.38, fontSize: 16, bold: true, color: tinta, margin: 0, isTextBox: true });
  s.addText([
    { text: "755", options: { fontFace: MONO, bold: true } }, { text: " es lo típico en programas y carpetas; " },
    { text: "644", options: { fontFace: MONO, bold: true } }, { text: " en documentos. Si ves " },
    { text: "777", options: { fontFace: MONO, bold: true } }, { text: ", desconfía: todo el mundo puede hacerlo todo." },
  ], { x: 0.9, y: 5.2, w: 5.05, h: 1.25, fontSize: 15, color: tinta, valign: "top", margin: 0, isTextBox: true });

  // Ejemplo resuelto
  const ex = 6.8, ew = 5.9;
  tarjeta(s, ex, 1.55, ew, 5.05, "ejemplo-resuelto");
  s.addText([
    { text: "Ejemplo resuelto: " },
    { text: "-rwxr-xr--", options: { fontFace: MONO } },
  ], { x: ex + 0.35, y: 1.75, w: ew - 0.7, h: 0.45, fontSize: 18, bold: true, color: tinta, margin: 0, isTextBox: true });
  const filas = [["Dueño", "rwx", "4 + 2 + 1", "7"], ["Grupo", "r-x", "4 + 0 + 1", "5"], ["Otros", "r--", "4 + 0 + 0", "4"]];
  filas.forEach(([q, l, suma, r], i) => {
    const fy = 2.45 + i * 0.85;
    s.addText(q, { x: ex + 0.35, y: fy, w: 1.0, h: 0.6, fontSize: 14, color: tinta, valign: "middle", margin: 0, isTextBox: true });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ex + 1.35, y: fy, w: 1.2, h: 0.6, rectRadius: 0.1, fill: { color: lila }, line: { color: tinta, width: 1.5 }, objectName: `fila-${q}` });
    s.addText(l, { x: ex + 1.35, y: fy, w: 1.2, h: 0.6, fontFace: MONO, fontSize: 22, bold: true, color: tinta, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(suma, { x: ex + 2.75, y: fy, w: 1.9, h: 0.6, fontSize: 20, color: tinta, valign: "middle", margin: 0, isTextBox: true });
    s.addText(`= ${r}`, { x: ex + 4.6, y: fy, w: 1.0, h: 0.6, fontSize: 30, bold: true, color: uva, align: "right", valign: "middle", margin: 0, isTextBox: true });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ex + 0.35, y: 5.15, w: ew - 0.7, h: 1.0, rectRadius: 0.15, fill: { color: lima }, line: borde(), objectName: "resultado" });
  s.addText([
    { text: "Resultado: ", options: { fontSize: 18, bold: true } },
    { text: "754", options: { fontFace: MONO, fontSize: 32, bold: true } },
  ], { x: ex + 0.35, y: 5.15, w: ew - 0.7, h: 1.0, color: tinta, align: "center", valign: "middle", margin: 0, isTextBox: true });

  s.addNotes(
`OBJETIVO
Pasar de letras a números. Es lo que más se usa con chmod y lo que más aparece en tutoriales de internet.

QUÉ DECIR (4 min)
«Cada letra tiene un valor fijo: r vale 4, w vale 2 y x vale 1. Para cada bloque, sumas las letras que estén. Si hay guion, ese hueco vale cero.» Resuelve el ejemplo de la derecha en voz alta, fila a fila, antes de enseñar el resultado.

POR QUÉ 4, 2 Y 1 (para quien pregunte)
Son potencias de 2. Con ellas, cualquier combinación da una suma distinta del 0 al 7, así que el número nunca es ambiguo: un 6 solo puede ser rw-, un 5 solo puede ser r-x.

PRÁCTICA GUIADA (2 min)
Pide que conviertan en parejas:
 · rw-r--r--  → 644
 · rwxr-xr-x  → 755
 · rw-------  → 600
Que comprueben con el compañero antes de decirlo en alto.

ERROR FRECUENTE
Sumar las nueve letras de golpe (7+5+4 = 16). Insiste: un número por bloque, tres números en total.

SUGERENCIA
Deja la tabla r=4 / w=2 / x=1 escrita en una esquina de la pizarra durante el resto de la sesión.`);
}

// ---------- 4 · chmod + reto ----------
pres.addSection({ title: "Cambiar permisos" });
{
  const s = pres.addSlide({ masterName: "CIERRE", sectionTitle: "Cambiar permisos" });
  botonIndice(s);
  s.addText("Cámbialos con chmod", { placeholder: "title" });

  const com = (t) => L(t, { color: uva });
  terminal(s, 0.6, 1.5, 6.6, 3.85, [
    com("# Dale permiso de ejecución al dueño"),
    L("$ chmod u+x saludo.sh", { bold: true }),
    L("$ ./saludo.sh", { bold: true }),
    L("¡Hola!"),
    L(" "),
    com("# O con números: rw-r--r--"),
    { text: "$ chmod 644 notas.txt", options: { bold: true } },
  ], "terminal-chmod", 16);

  s.addText([
    { text: "Quién: ", options: { bold: true } },
    { text: "u", options: { fontFace: MONO, bold: true } }, { text: " dueño · " },
    { text: "g", options: { fontFace: MONO, bold: true } }, { text: " grupo · " },
    { text: "o", options: { fontFace: MONO, bold: true } }, { text: " otros · " },
    { text: "a", options: { fontFace: MONO, bold: true } }, { text: " todos", options: { breakLine: true } },
    { text: "Qué: ", options: { bold: true } },
    { text: "+", options: { fontFace: MONO, bold: true } }, { text: " añade · " },
    { text: "-", options: { fontFace: MONO, bold: true } }, { text: " quita · " },
    { text: "=", options: { fontFace: MONO, bold: true } }, { text: " deja exactamente" },
  ], { x: 0.6, y: 5.65, w: 6.6, h: 0.9, fontSize: 16, color: lila, valign: "top", margin: 0, paraSpaceAfter: 6, isTextBox: true });

  // Reto
  tarjeta(s, 7.75, 1.5, 4.95, 2.1, "reto", chicle, HEX.lila);
  s.addText("Reto", { x: 8.05, y: 1.68, w: 4.4, h: 0.4, fontSize: 18, bold: true, color: tinta, margin: 0, isTextBox: true });
  s.addText([
    { text: "¿Qué número es ", options: { fontSize: 18 } },
    { text: "rw-r-----", options: { fontFace: MONO, bold: true, fontSize: 20 } },
    { text: "?", options: { fontSize: 18 } },
  ], { x: 8.05, y: 2.15, w: 4.4, h: 0.5, color: tinta, margin: 0, isTextBox: true });
  s.addText("Pista: suma por bloques de tres.", { x: 8.05, y: 2.7, w: 4.4, h: 0.35, fontSize: 14, italic: true, color: tinta, margin: 0, isTextBox: true });
  s.addText("¿Atascado? Repasa los números →", { x: 8.05, y: 3.1, w: 4.4, h: 0.35, fontSize: 14, bold: true, underline: { style: "sng" }, color: tinta, margin: 0, isTextBox: true });
  enlace(s, 8.05, 3.1, 4.4, 0.35, DIAPO.numeros, "Volver a «Cada letra vale un número»", "enlace-repaso-numeros");

  // Ojo con…
  tarjeta(s, 7.75, 3.95, 4.95, 2.6, "ojo-con", blanco, HEX.lila);
  s.addText("Ojo con…", { x: 8.05, y: 4.12, w: 4.4, h: 0.4, fontSize: 18, bold: true, color: tinta, margin: 0, isTextBox: true });
  const avisos = [
    [{ text: "chmod 777", options: { fontFace: MONO, bold: true } }, { text: " «por si acaso»: abres la puerta a todo el mundo." }],
    [{ text: "Una carpeta sin " }, { text: "x", options: { fontFace: MONO, bold: true } }, { text: " no te deja entrar con " }, { text: "cd", options: { fontFace: MONO, bold: true } }, { text: ", aunque tenga " }, { text: "r", options: { fontFace: MONO, bold: true } }, { text: "." }],
  ];
  avisos.forEach((runs, i) => {
    const ay = 4.7 + i * 0.85;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.05, y: ay + 0.07, w: 0.2, h: 0.2, rectRadius: 0.03, fill: { color: chicle }, line: { color: tinta, width: 1.5 }, objectName: `aviso-${i + 1}` });
    s.addText(runs, { x: 8.45, y: ay, w: 4.0, h: 0.8, fontSize: 14, color: tinta, valign: "top", margin: 0, isTextBox: true });
  });

  s.addNotes(
`OBJETIVO
Cambiar permisos con chmod de las dos formas (letras y números) y saber qué NO hacer.

QUÉ DECIR (5 min)
«chmod significa change mode, cambiar el modo. Hay dos maneras de usarlo. Con letras, dices a quién (u, g, o, a), qué haces (+, -, =) y qué permiso (r, w, x): chmod u+x es "al dueño, añádele ejecutar". Con números, pones los tres dígitos que acabamos de calcular: chmod 644.»
Haz la demo en directo: primero ./saludo.sh falla, luego chmod u+x saludo.sh, y vuelve a lanzarlo. Cerrar el círculo con el error de la portada da mucha satisfacción.

¿LETRAS O NÚMEROS?
· Letras: para cambios pequeños («añade solo esto»). No tocan el resto.
· Números: para dejar todos los permisos exactamente como quieres de una vez.

RESPUESTA DEL RETO
rw-r----- → rw- = 4+2+0 = 6 · r-- = 4 · --- = 0 → 640.
Deja 30 segundos de silencio antes de pedir respuestas. Pregunta también: «¿Quién puede leerlo?» (el dueño y su grupo; los demás, nada).

ERRORES FRECUENTES (la caja «Ojo con…»)
· chmod 777 parece que «arregla» cualquier Permiso denegado, pero deja el archivo abierto a cualquiera. Regla del curso: da el mínimo permiso que haga falta.
· En carpetas, x significa «poder entrar». Una carpeta con r pero sin x deja ver los nombres con ls, pero no entrar con cd.

PARA SABER MÁS / SIGUIENTE LECCIÓN
Quién es el dueño y cómo se cambia: chown y chgrp. Y por qué a veces hace falta sudo.

CIERRE (1 min)
Pide a cada persona que diga en voz alta una cosa que ha aprendido hoy. Recuerda el lema: «Abre la terminal. No se rompe nada».`);
}

// ---------- Escribir, tema y transiciones ----------
const TRANSICIONES = [
  '<p:transition spd="slow"><p:fade/></p:transition>',
  '<p:transition spd="med"><p:cover dir="l"/></p:transition>',
  '<p:transition spd="med"><p:push dir="u"/></p:transition>',
  '<p:transition spd="med"><p:wipe dir="r"/></p:transition>',
  '<p:transition spd="slow"><p:split orient="vert" dir="out"/></p:transition>',
];

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  const zip = await JSZip.loadAsync(fs.readFileSync(OUT));
  for (let i = 1; i <= TRANSICIONES.length; i++) {
    const p = `ppt/slides/slide${i}.xml`;
    let xml = await zip.file(p).async("string");
    if (xml.includes("<p:transition")) continue;
    // Va después de <p:clrMapOvr> y antes de <p:timing>, según el esquema
    if (xml.includes("</p:clrMapOvr>")) xml = xml.replace("</p:clrMapOvr>", "</p:clrMapOvr>" + TRANSICIONES[i - 1]);
    else xml = xml.replace("</p:cSld>", "</p:cSld>" + TRANSICIONES[i - 1]);
    zip.file(p, xml);
  }
  fs.writeFileSync(OUT, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
  console.log("OK", OUT);
})();
