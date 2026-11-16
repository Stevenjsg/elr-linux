# elr — Linux desde cero

Sitio web del curso **elr**, que enseña a usar la terminal de Linux a gente que viene de Windows o Mac. Lema: *«Abre la terminal. No se rompe nada»*.

El mismo contenido se publica de tres formas:

| Salida | Para qué sirve | Comando |
|---|---|---|
| **Web** | El curso en abierto, en <https://sjsilgom.upv.edu.es> | `pnpm build` |
| **Paquete SCORM 1.2** | Subirlo a un LMS clásico (Moodle, etc.) | `pnpm scorm` |
| **Paquete cmi5 (xAPI)** | Subirlo a **lrs.io** u otra plataforma cmi5, con seguimiento por xAPI | `pnpm cmi5` |
| **Paquete xAPI** | Subirlo a **lrs.io**, con la librería de Veracity (`xapiwrapper` + `ADL.launch`) | `pnpm xapi` |

Todo se genera desde una sola fuente: si cambias el texto de una parte, cambia en la web y en los dos paquetes.

---

## Índice

1. [Requisitos](#1-requisitos)
2. [Puesta en marcha](#2-puesta-en-marcha)
3. [Estructura del proyecto](#3-estructura-del-proyecto)
4. [Cómo está organizado el contenido](#4-cómo-está-organizado-el-contenido)
5. [Editar un módulo existente](#5-editar-un-módulo-existente)
6. [Añadir un módulo nuevo (por ejemplo, el 3)](#6-añadir-un-módulo-nuevo-por-ejemplo-el-3)
7. [Generar los paquetes SCORM y cmi5](#7-generar-los-paquetes-scorm-y-cmi5)
8. [Subir el curso a lrs.io](#8-subir-el-curso-a-lrsio)
9. [Cómo funciona el seguimiento](#9-cómo-funciona-el-seguimiento)
10. [Probar antes de publicar](#10-probar-antes-de-publicar)
11. [Integrar contenido de Storyline](#11-integrar-contenido-de-storyline)
12. [Presentaciones](#12-presentaciones)
13. [Guía de estilo](#13-guía-de-estilo)
14. [Problemas frecuentes](#14-problemas-frecuentes)

---

## 1. Requisitos

- **Node.js 22.18 o posterior.** Los scripts de empaquetado importan archivos `.ts` directamente, y Node solo lo permite sin opciones extra a partir de esa versión. Compruébalo con `node --version`.
- **pnpm** (el proyecto tiene `pnpm-lock.yaml`). `npm` también funciona para ejecutar los scripts.
- **`zip`** en la línea de comandos, para comprimir los paquetes. Viene en casi todas las distribuciones de Linux. Si no, instálalo con el gestor de paquetes (`sudo pacman -S zip`, `sudo apt install zip`).

## 2. Puesta en marcha

```sh
pnpm install
```

### Servidor de desarrollo

Arranca en segundo plano para que no bloquee la terminal:

```sh
pnpm astro dev --background   # arranca en http://localhost:4321
pnpm astro dev status         # ¿está en marcha?
pnpm astro dev logs           # ver lo que va diciendo
pnpm astro dev stop           # pararlo
```

Los cambios en los archivos se ven al momento en el navegador.

### Todos los comandos

| Comando | Qué hace |
|---|---|
| `pnpm install` | Instala las dependencias |
| `pnpm dev` | Servidor de desarrollo en primer plano |
| `pnpm build` | Genera la web en `dist/` |
| `pnpm preview` | Sirve `dist/` en local para revisarla antes de publicar |
| `pnpm scorm` | Genera la web y los paquetes SCORM 1.2 (`scorm/`) |
| `pnpm cmi5` | Genera la web y los paquetes cmi5 (`cmi5/`) |
| `pnpm xapi` | Genera la web y el paquete xAPI de una página (`xapi/`) |
| `pnpm rise` | Adapta la exportación xAPI de Rise 360 (`articulate/`) |
| `pnpm statements rise\|tutorial` | Lista los últimos statements de lrs.io (necesita `.env`) |
| `pnpm paquetes` | Genera la web y los paquetes SCORM, cmi5 y xAPI Launch de una vez |

## 3. Estructura del proyecto

```text
/
├── public/                      Archivos que se copian tal cual (favicon, media/)
│   └── media/<lección>/         Audio, vídeo, pósters y subtítulos de cada lección
├── src/
│   ├── data/
│   │   ├── tipos.ts             Tipos compartidos: Leccion y Parte
│   │   ├── modulo-2.ts          Datos del módulo 2: título, descripción y lista de partes
│   │   └── modulos.ts           REGISTRO de módulos que se empaquetan
│   ├── components/
│   │   ├── modulo-2/            Una .astro por parte + Partes.astro (su registro)
│   │   ├── PartesModulo.astro   Elige el registro de partes de cada módulo
│   │   └── …                    Componentes comunes (Terminal, Consola, ArbolSVG…)
│   ├── layouts/
│   │   ├── Layouts.astro        Layout de la web
│   │   └── ParteSuelta.astro    Layout de una parte dentro de un paquete (SCORM o cmi5)
│   ├── plataforma/
│   │   ├── scorm12.js           Conexión con un LMS SCORM 1.2
│   │   └── cmi5.js              Conexión con una plataforma cmi5 / LRS xAPI
│   ├── pages/
│   │   ├── index.astro          Portada
│   │   ├── modulos/N.astro      Lección completa de la web
│   │   ├── scorm/[modulo]/[parte].astro   Una página por parte, para SCORM
│   │   └── cmi5/[modulo]/[parte].astro    Una página por parte, para cmi5
│   └── styles/                  global.css (paleta, tipografía) y leccion.css
├── scripts/
│   ├── paquete-comun.mjs        Funciones compartidas por los dos empaquetadores
│   ├── empaquetar-scorm.mjs     dist/ → scorm/elr-<modulo>-scorm.zip
│   └── empaquetar-cmi5.mjs      dist/ → cmi5/elr-<modulo>-cmi5.zip y cmi5/elr-curso-cmi5.zip
├── presentaciones/              Presentaciones de apoyo (.pptx) y su script generador
├── scorm/modulo-2/              Paquete SCORM antiguo hecho a mano (de referencia; no lo generan los scripts)
└── modulo-2-iseazy.md           Contenido y sistema de color del módulo 2, preparado para isEazy
```

Los scripts generan estas carpetas y **no se suben a git**: `dist/`, `scorm/*-paquete/`, `scorm/elr-*-scorm.zip` y `cmi5/`.

## 4. Cómo está organizado el contenido

Un **módulo** es una lección (por ejemplo, «Te mueves: rutas y carpetas»), dividida en **partes** («¿Dónde estoy?», «Moverse», «Actividades»…). Cada parte se escribe una sola vez y se usa en tres sitios:

```
src/data/modulo-2.ts            QUÉ partes hay y en qué orden (id, número, título, minutos…)
        │
src/components/modulo-2/<id>.astro   El CONTENIDO de cada parte
        │
        ├── src/pages/modulos/2.astro               Web: todas las partes seguidas
        ├── src/pages/scorm/[modulo]/[parte].astro  SCORM: una página (un SCO) por parte
        └── src/pages/cmi5/[modulo]/[parte].astro   cmi5: una página (una AU) por parte
```

En los paquetes cada parte va por separado para que la plataforma registre el progreso **parte a parte** y no la lección entera como un solo bloque.

### Los datos de una parte

Cada parte de `src/data/modulo-N.ts` tiene este aspecto. El tipo `Parte` está en `src/data/tipos.ts`:

```ts
{
  id: 'actividades',        // estable: es la URL y el ID del SCO/AU. NO lo cambies tras publicar.
  numero: '09',             // lo que se ve en el índice
  titulo: 'Actividades',
  minutos: 5,               // duración estimada
  medios: ['cuestionario'], // opcional: grafico, audio, video, simulador, cuestionario
  completaSola: true,       // opcional: la parte informa ella misma (cuestionarios)
  notaMinima: 70,           // opcional: nota sobre 100 para aprobar
}
```

- **Sin `completaSola`**, la página del paquete muestra un botón **«He terminado esta parte»** que marca la parte como completada.
- **Con `completaSola` y `notaMinima`**, la parte no tiene botón: se da por superada cuando el alumno aprueba el cuestionario. En SCORM se convierte en `masteryscore` y en cmi5 en `moveOn="Passed"` con `masteryScore`.

## 5. Editar un módulo existente

### Cambiar el texto de una parte

Edita `src/components/modulo-2/<id>.astro`. Cada parte es una `<section>` con su `id` y un `<h2 class="titulo-seccion">`. Al guardar, el cambio aparece en la web y en los paquetes la próxima vez que los generes.

### Cambiar el título, la duración o el orden

Edita `src/data/modulo-2.ts`. El orden de la lista `partes` es el orden en la web, en el índice y en los paquetes. La duración total se calcula sola.

### Añadir una parte

1. Añade la entrada a `partes` en `src/data/modulo-2.ts` con un `id` nuevo.
2. Crea `src/components/modulo-2/<id>.astro`. Copia una parte parecida para mantener la estructura.
3. Impórtala y añádela a `REGISTRO` en `src/components/modulo-2/Partes.astro`.

Si olvidas el paso 3, el build falla con «Partes sin componente en Partes.astro: …». Es a propósito: así no se cuela una parte vacía.

### Cuestionarios

Los cuestionarios usan `src/components/modulo-2/Quiz.astro`. Cada pregunta tiene esta forma:

```ts
{
  enunciado: '¿Cuál de estas órdenes te enseña los archivos ocultos?',
  opciones: ['<code>ls</code>', '<code>ls -l</code>', '<code>ls -a</code>', '<code>pwd</code>'],
  correcta: 2,                       // índice de la opción buena (empieza en 0)
  porque: 'La <code>-a</code> viene de <em lang="en">all</em>…',  // se muestra al corregir
}
```

Al corregir, cada cuestionario lanza el evento `quiz:corregido`. `actividades.astro` junta los resultados de **sus dos** cuestionarios, calcula el porcentaje y, dentro de un paquete, lo envía a la plataforma con `window.PLATAFORMA.puntuar(nota, aprobado)`. Si añades o quitas cuestionarios en esa parte, actualiza la constante `CUESTIONARIOS`.

### Audio, vídeo y otros medios

Ponlos en `public/media/<lección>/` y enlázalos con ruta absoluta (`/media/te-mueves/screencast.mp4`). Los empaquetadores pasan esas rutas a relativas. Si una página enlaza un archivo que no existe, el empaquetado **avisa** pero no se detiene:

```
AVISO: 2 recurso(s) que las páginas enlazan pero no existen todavía:
  media/te-mueves/audio-raiz.mp3
  media/te-mueves/screencast.mp4
```

## 6. Añadir un módulo nuevo (por ejemplo, el 3)

Hay que hacer cinco cosas. Las tres primeras crean el contenido; las dos últimas lo registran para los paquetes.

**1. Los datos**: crea `src/data/modulo-3.ts` copiando `modulo-2.ts` y cambia los valores:

```ts
import type { Leccion, Parte } from './tipos.ts'

export type { Medio, Parte } from './tipos.ts'

export const leccion = {
  modulo: 3,
  tramo: 'Tramo 02',
  posicion: 'Lección 2 de 4',
  titulo: '…',
  tituloSeo: '… | elr',
  descripcion: '…',
  entradilla: '…',
  pie: 'Tramo 02 del curso elr, aprende Linux sin romper nada.',
} as const satisfies Leccion

export const partes: Parte[] = [
  { id: 'resultados', numero: '01', titulo: 'Resultados de aprendizaje', minutos: 2 },
  // …
]
```

**2. Las partes**: crea `src/components/modulo-3/` con un `.astro` por parte y un `Partes.astro` que las registre, igual que en `modulo-2/`. En `Partes.astro`, cambia el import de datos a `../../data/modulo-3`.

**3. La página web**: crea `src/pages/modulos/3.astro` copiando `modulos/2.astro` y cambiando los imports de `modulo-2` a `modulo-3`. Añade el enlace en la navegación o la portada si toca.

**4. Registrarlo para los paquetes** en `src/data/modulos.ts`:

```ts
import * as modulo2 from './modulo-2.ts'
import * as modulo3 from './modulo-3.ts'          // ← nuevo (con .ts, lo leen también los scripts)

export const modulos: Modulo[] = [
  { slug: 'modulo-2', leccion: modulo2.leccion, partes: modulo2.partes },
  { slug: 'modulo-3', leccion: modulo3.leccion, partes: modulo3.partes },   // ← nuevo
]
```

**5. Registrar sus componentes** en `src/components/PartesModulo.astro`:

```ts
import PartesModulo2 from './modulo-2/Partes.astro'
import PartesModulo3 from './modulo-3/Partes.astro'   // ← nuevo

const REGISTRO: Record<string, any> = {
  'modulo-2': PartesModulo2,
  'modulo-3': PartesModulo3,                          // ← nuevo
}
```

Después ejecuta `pnpm paquetes`. Aparecerán `scorm/elr-modulo-3-scorm.zip` y `cmi5/elr-modulo-3-cmi5.zip`, y el módulo 3 entrará como un **bloque nuevo** en `cmi5/elr-curso-cmi5.zip`.

> Si el módulo 3 tiene una parte de cuestionario, copia la lógica de `modulo-2/actividades.astro`: el evento `quiz:corregido` y la llamada a `window.PLATAFORMA.puntuar`.

## 7. Generar los paquetes SCORM y cmi5

```sh
pnpm scorm       # solo SCORM
pnpm cmi5        # solo cmi5
pnpm paquetes    # los dos
```

Para empaquetar un solo módulo sin repetir el build:

```sh
pnpm build
node scripts/empaquetar-scorm.mjs modulo-2
node scripts/empaquetar-cmi5.mjs modulo-3
```

### Qué se genera

| Archivo | Formato | Contenido |
|---|---|---|
| `scorm/elr-modulo-N-scorm.zip` | SCORM 1.2 | Un SCO por parte + `imsmanifest.xml` |
| `cmi5/elr-modulo-N-cmi5.zip` | cmi5 | Un curso con una AU por parte + `cmi5.xml` |
| `cmi5/elr-curso-cmi5.zip` | cmi5 | **El curso entero**: un bloque por módulo, con una AU por parte |

Al lado de cada `.zip` queda la carpeta sin comprimir (`scorm/modulo-N-paquete/`, `cmi5/modulo-N/`, `cmi5/curso/`), útil para revisar qué lleva el paquete.

### ¿SCORM o cmi5?

| | SCORM 1.2 | cmi5 |
|---|---|---|
| Dónde funciona | Casi cualquier LMS | Plataformas cmi5 (lrs.io, LMS modernos) |
| Qué registra | Estado (completado/aprobado) y nota | Statements xAPI detallados en un LRS |
| Credenciales | Ninguna: habla con el LMS que la contiene | Token de un solo uso al abrir la página; ninguna clave en el código |
| Fuera de la plataforma | Se lee, no registra nada | Se lee, no registra nada |

### ¿Un módulo o el curso entero?

- **`elr-curso-cmi5.zip`** si quieres un único curso en lrs.io que vaya creciendo con cada módulo. Es lo recomendable.
- **`elr-modulo-N-cmi5.zip`** si cada módulo se matricula o se asigna por separado.

Los identificadores de las AU son los mismos en los dos tipos de paquete, así que los datos de una parte se pueden comparar suba el que suba.

## 8. Subir el curso a lrs.io

lrs.io es el LRS en la nube de Veracity. Los nombres exactos de los menús pueden cambiar; la idea es esta:

1. Genera los paquetes: `pnpm cmi5`.
2. En lrs.io, entra en tu LRS y busca la sección de **contenido / cursos** (*Content*, *Courses* o *Launch*).
3. **Sube `cmi5/elr-curso-cmi5.zip`** (o el de un módulo). La plataforma lee el `cmi5.xml` y crea el curso con sus partes.
4. Abre una parte desde lrs.io. Debajo del contenido debe aparecer **«Conectado a la plataforma…»**.
5. Pulsa «He terminado esta parte» y comprueba en el visor de statements que aparecen `initialized`, `completed` y, al salir, `terminated`.

**Para actualizar el curso**, vuelve a generar el paquete y súbelo como **nueva versión del mismo curso**, no como curso nuevo. Mientras no cambies los IRI (sección 9), lrs.io lo reconoce como el mismo y el progreso del alumnado se conserva.

### Paquete xAPI Launch (librería de Veracity)

Variante del tutorial hecha con la librería de [veracity-tech/lrs-launch-example](https://github.com/veracity-tech/lrs-launch-example): `public/vendor/xapiwrapper.min.js` (ADL xAPIWrapper 1.10.0, Apache 2.0) y `ADL.launch`. El envoltorio es `src/plataforma/xapi-launch.js` y expone el mismo `window.PLATAFORMA` que SCORM y cmi5.

1. `pnpm xapi` → `xapi/elr-modulo-2-xapi.zip`: **el módulo entero en una sola página** (`leccion/index.html`), porque lrs.io registra un único punto de entrada por zip. El manifiesto es un `tincan.xml`, que lrs.io reconoce como *Tincan/xAPI*.
2. Súbelo en **Learner Portal → Content → Upload Content** y lánzalo desde **Visit the Portal**. La página acepta los dos lanzamientos de lrs.io: Tin Can (`?endpoint=…&auth=…&actor=…`, que la librería lee sola) y xAPI Launch (`?xAPILaunchKey=…&xAPILaunchService=…`, con `ADL.launch`). En ninguno hay credenciales en el código.
3. Statements que envía: `initialized`, `experienced` por cada sección que se ve, `played`/`experienced` en vídeo y audio, `completed`, `answered` por pregunta al corregir, `passed`/`failed` con la nota y `terminated` al salir.

Sus IRIs van bajo `https://sjsilgom.upv.edu.es/xapi/elr/xapi/…` para no mezclarse con las AUs del paquete cmi5.

### Curso de Rise 360 (Articulate)

La exportación xAPI de Rise (*Publish → LMS → xAPI*) se adapta con `pnpm rise`. Deja el zip de Rise en la raíz del proyecto (o pásalo como argumento). El script:

- lo guarda tal cual en `articulate/original/`;
- cambia el IRI aleatorio de Rise por `https://sjsilgom.upv.edu.es/xapi/elr/rise/permisos-linux`, pone el idioma en `es-ES` y limpia los nombres de las lecciones (`tincan.xml` y `tc-config.js`);
- genera `articulate/elr-rise-permisos-xapi.zip`, que se sube a lrs.io igual que los demás. No lleva credenciales: lrs.io las pasa al lanzarlo.

### Sacar los statements para un informe

Crea en lrs.io una clave de solo lectura y ponla en `.env`:

```
LRS_ENDPOINT=https://<tu-lrs>.lrs.io/xapi/
LRS_KEY=…
LRS_SECRET=…
```

`pnpm statements rise` o `pnpm statements tutorial` imprimen los 20 últimos, una línea por statement (fecha · alumno · verbo · actividad · resultado).

## 9. Cómo funciona el seguimiento

### Una interfaz para las dos plataformas

`ParteSuelta.astro` incrusta en cada página `src/plataforma/scorm12.js` o `src/plataforma/cmi5.js`, según el paquete. Los dos exponen la misma interfaz, así que las partes y los cuestionarios **no saben qué plataforma los ha lanzado**:

```js
window.PLATAFORMA = {
  nombre,                     // 'SCORM 1.2' | 'cmi5'
  iniciar(),                  // → Promise<boolean>  conecta con la plataforma
  estado(),                   // 'conectado' | 'revision' | 'sin-plataforma' | 'sesion-cerrada' | 'error'
  yaCompletada(),             // → boolean  la parte ya estaba completada
  completar(),                // → Promise<boolean>  marca la parte como completada
  puntuar(nota, aprobado),    // → Promise<boolean>  nota sobre 100 (cuestionarios)
  urlRetorno(),               // → string | null  adónde volver al salir (solo cmi5)
  salir(),                    // cierra la sesión y vuelve a la plataforma
  cerrar(),                   // se llama sola al cerrar la pestaña
}
```

Si añades una interacción que deba registrar algo, usa siempre `window.PLATAFORMA` y comprueba que existe: en la web normal no está.

```js
window.PLATAFORMA?.completar()
```

### Qué pasa al abrir una parte desde lrs.io (cmi5)

```
lrs.io                                   Página de la parte
──────                                   ──────────────────
Abre la URL con:  endpoint, fetch,  ──▶  1. POST a «fetch» → token de un solo uso
actor, registration, activityId          2. Lee LMS.LaunchData (modo, nota de corte, URL de retorno)
                                         3. Lee su progreso guardado de otras sesiones
                                         4. Envía  initialized
El alumno pulsa «He terminado»      ──▶  5. Envía  completed
El alumno corrige el cuestionario   ──▶  5. Envía  completed + passed / failed (con la nota)
Sale o cierra la pestaña            ──▶  6. Envía  terminated  (y vuelve a lrs.io si hay URL de retorno)
```

### Reglas de cmi5 que cumple

- `initialized` es siempre el primer statement de la sesión y `terminated` el último. Después de `terminated` no se envía nada más.
- `completed` y `passed` se envían **una sola vez por matrícula**, aunque el alumno vuelva otro día. Para saberlo, la página guarda su progreso en un documento de estado del LRS (`…/xapi/elr/estado/progreso`).
- `failed` no se envía después de `passed` ni más de una vez por matrícula. Si el alumno suspende y luego aprueba, se registran los dos.
- **La nota de corte la decide lrs.io** si la envía. Si no, se usa la `notaMinima` del módulo.
- En los modos **Browse** y **Review** (repaso) solo se envían `initialized` y `terminated`, y el botón aparece desactivado.
- Todos los statements llevan la plantilla de contexto de la plataforma, la matrícula (`registration`) y la categoría cmi5.

### Lo que ve el alumno

Debajo de cada parte hay un recuadro con el estado:

| Estado | Mensaje |
|---|---|
| `conectado` | «Conectado a la plataforma. Tu progreso se guardará al marcar esta parte.» |
| `revision` | «Abierto en modo repaso: puedes leer la parte, pero no se registra progreso.» |
| `sin-plataforma` | «Abierto fuera de una plataforma: puedes leer la parte, pero el progreso no se guarda.» |
| `sesion-cerrada` | «Esta sesión ya se cerró. Vuelve a abrir la parte desde la plataforma…» |
| `error` | «No se ha podido conectar con la plataforma…» |

### Identificadores (IRI): no cambiarlos nunca

El curso, los bloques y las AU se identifican así:

```
https://sjsilgom.upv.edu.es/xapi/elr/curso                 curso entero
https://sjsilgom.upv.edu.es/xapi/elr/curso/modulo-2        bloque del módulo 2
https://sjsilgom.upv.edu.es/xapi/elr/modulo-2              curso de solo el módulo 2
https://sjsilgom.upv.edu.es/xapi/elr/modulo-2/<id-parte>   AU de cada parte
```

Son identificadores, no páginas que tengan que existir. **Si cambias el slug de un módulo o el `id` de una parte después de publicar, el LRS lo tratará como una actividad nueva** y el progreso anterior quedará aparte. La raíz está en la constante `IRI` de `scripts/empaquetar-cmi5.mjs`.

## 10. Probar antes de publicar

### Sin plataforma

Tras `pnpm cmi5`, abre en el navegador cualquier página de `cmi5/modulo-2/partes/<id>/index.html`, o de `dist/cmi5/…` con `pnpm preview`. Debe verse la parte completa con el mensaje «Abierto fuera de una plataforma». Sirve para revisar contenido y estilos, no el seguimiento.

### Validar el `cmi5.xml`

Si tienes `xmllint`, valida contra el esquema oficial:

```sh
curl -fsSLo /tmp/CourseStructure.xsd \
  https://raw.githubusercontent.com/AICC/CMI-5_Spec_Current/quartz/v1/CourseStructure.xsd
xmllint --noout --schema /tmp/CourseStructure.xsd cmi5/curso/cmi5.xml
```

### Con plataforma

- **cmi5**: súbelo a lrs.io (sección 8), abre las partes y revisa los statements en el visor del LRS. Conviene usar un usuario de prueba, porque los statements no se pueden borrar.
- **SCORM**: súbelo a tu LMS o a [SCORM Cloud](https://cloud.scorm.com) (tiene cuenta gratuita) y revisa el estado y la nota de cada SCO.

### Qué comprobar

- [ ] Las partes normales muestran el botón y, al pulsarlo, quedan como completadas.
- [ ] Al volver a abrir una parte completada, el botón sale como «Parte completada».
- [ ] El cuestionario envía la nota y aprueba o suspende según la nota de corte.
- [ ] «Volver a la plataforma» (solo cmi5) cierra la sesión y vuelve a lrs.io.
- [ ] Los medios cargan. El empaquetado avisa de los que faltan.

## 11. Integrar contenido de Storyline

Articulate Storyline 360 **solo funciona en Windows**. En este equipo se usa la máquina virtual de Omarchy:

```sh
omarchy-windows-vm install   # una vez (8 GB de RAM y 4 núcleos van bien)
omarchy-windows-vm launch    # abrir Windows
```

La carpeta `~/Windows` de Linux se ve dentro de la máquina virtual: úsala para pasar archivos en los dos sentidos.

**Publicar desde Storyline:** *Publish → LMS* y en *Output Options* elige **cmi5**. Así lrs.io lo gestiona igual que las partes web: mismo alumno, misma matrícula si va en el mismo curso.

**Dos formas de usarlo:**

1. **Por separado**: sube el `.zip` de Storyline a lrs.io como un curso más. Es lo más sencillo.
2. **Dentro del curso elr**: copia la salida de Storyline a una subcarpeta del paquete (por ejemplo, `cmi5/curso/storyline/permisos/`) y añade una `<au>` en `cmi5/curso/cmi5.xml` que apunte a su página de inicio. Usa la `url` y la configuración de la AU que trae el `cmi5.xml` de Storyline. Hoy hay que hacerlo **a mano después de cada `pnpm cmi5`**, porque el script regenera la carpeta. Si se vuelve habitual, conviene automatizarlo en `empaquetar-cmi5.mjs`.

**Sin Windows:** Articulate **Rise 360** funciona en el navegador y también publica en cmi5, aunque permite menos interacciones a medida.

## 12. Presentaciones

`presentaciones/permisos-linux.pptx` es una presentación de 5 diapositivas sobre permisos en Linux, con la paleta del curso, transiciones, enlaces internos (índice y botones «← Índice») y notas del orador para el profesor.

`presentaciones/build.js` es el script que la genera, con `pptxgenjs`. Depende de un módulo auxiliar externo (`apply_theme.js`) con una ruta absoluta. Para regenerarla en otro equipo hay que ajustar esa ruta o quitar el paso del tema.

## 13. Guía de estilo

- **Tono**: cercano, de tú, frases cortas. Ningún término técnico sin explicar.
- **Paleta** (definida en `src/styles/global.css`):

  | Nombre | Hex | Uso |
  |---|---|---|
  | Tinta | `#1E1046` | Texto, bordes, títulos |
  | Uva | `#5B2EE5` | Marca, acentos, barras de terminal |
  | Lila | `#EDE6FF` | Fondo de página |
  | Chicle | `#FF3D8B` | Botones, cajas «Para saber más» |
  | Lima | `#A8E80B` | Resaltados, estados correctos |

  **Lima y chicle nunca como color de texto**, solo como fondo con tinta encima: así el contraste siempre cumple WCAG AA. La tinta con opacidad no debe bajar del 70 %.
- **Tipografía**: Bricolage Grotesque para todo el texto; Azeret Mono **solo** para comandos, rutas y salida de terminal.
- **Accesibilidad**: el color nunca es la única forma de transmitir información; jerarquía de encabezados sin saltos; enlace «Saltar al contenido»; animaciones desactivadas con `prefers-reduced-motion`.

`modulo-2-iseazy.md` recoge las combinaciones de color verificadas y el contenido del módulo 2 listo para migrarlo a isEazy.

## 14. Problemas frecuentes

**`No encuentro dist/scorm` (o `dist/cmi5`). Ejecuta antes: npm run build**
Has lanzado el script de empaquetado sin build. Usa `pnpm scorm` o `pnpm cmi5`, que hacen las dos cosas.

**`SyntaxError` o `ERR_UNKNOWN_FILE_EXTENSION` con `.ts` al empaquetar**
Tu Node es anterior a la 22.18. Actualízalo (`mise use node@22` o la versión LTS más reciente).

**`Módulo(s) no registrados en src/data/modulos.ts: …`**
El nombre que has pasado al script no coincide con ningún `slug`. Revisa `modulos.ts`.

**`PartesModulo: «modulo-N» no está registrado…`**
Has añadido el módulo a `modulos.ts` pero no a `src/components/PartesModulo.astro` (sección 6, paso 5).

**`Partes sin componente en Partes.astro: …`**
Hay una parte en los datos sin su `.astro` registrado en `Partes.astro` (sección 5).

**En lrs.io sale «No se ha podido conectar con la plataforma»**
Abre la consola del navegador (F12): los errores aparecen con el prefijo `[cmi5]`. Lo habitual es abrir la página directamente en vez de desde lrs.io (faltan parámetros), o que lrs.io no haya lanzado la parte como cmi5.

**Un 404 en `…/activities/state?stateId=…/estado/progreso` en la consola**
Es normal la primera vez que un alumno abre una parte: todavía no hay progreso guardado y el LRS responde 404.

**«Esta sesión ya se cerró» al recargar la página**
Es lo esperado en cmi5: al recargar se cierra la sesión y el token no se puede reutilizar. Hay que volver a abrir la parte desde lrs.io.

**El cuestionario no envía la nota**
Hay que corregir **los dos** cuestionarios de la parte. La nota se envía cuando están los dos (constante `CUESTIONARIOS` en `actividades.astro`).
