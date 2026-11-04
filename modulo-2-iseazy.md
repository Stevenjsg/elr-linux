# Módulo 2 — «Te mueves: rutas y carpetas»

Contenido completo y sistema de color para migrar a isEazy.
Fuente original: `src/pages/modulos/2.astro` → https://sjsilgom.upv.edu.es/modulos/2/

---

## Ficha

| Campo | Valor |
|---|---|
| Título | Te mueves: rutas y carpetas |
| Tramo | 02 — Lección 1 de 4 |
| Duración | 30 min aprox. |
| Público | Jóvenes sin experiencia en Linux que vienen de Windows o Mac |
| Idioma | Español (`es`) |
| Título SEO | Te mueves: rutas y carpetas con pwd, ls y cd \| elr |
| Meta descripción | Lección del tramo 02 del curso elr. Aprende el árbol de directorios de Linux y muévete por él con pwd, ls y cd, con gráfico, audio, vídeo y un simulador de terminal. |

**Tono:** cercano, de tú, frases cortas, sin jerga sin explicar. La frase que gobierna todo el curso es «Abre la terminal. No se rompe nada».

---

## Sistema de color

Cinco colores. La idea de la paleta es que **la terminal no es negra**: fondo lila claro, nada de verde ácido sobre negro.

| Nombre | Hex | Papel |
|---|---|---|
| Tinta | `#1E1046` | Texto principal, bordes, títulos |
| Uva | `#5B2EE5` | Color de marca, acentos, barras de terminal, líneas del gráfico |
| Lila | `#EDE6FF` | Fondo de página |
| Chicle | `#FF3D8B` | Botones de acción, filetes de las cajas «Para saber más» |
| Lima | `#A8E80B` | Marcador de subrayado, resaltados, estados correctos |

**Regla de uso:** lima y chicle **nunca** van como color de texto, solo como fondo o subrayado con tinta encima. Así el contraste siempre cumple.

### Combinaciones verificadas (WCAG AA pide 4,5:1 en texto normal y 3:1 en texto grande)

| Combinación | Contraste | Uso |
|---|---|---|
| Tinta sobre lila | 14,26:1 | Texto general |
| Tinta sobre blanco | 17,24:1 | Texto dentro de cajas y terminal |
| Tinta sobre lima | 11,67:1 | Resaltados y marcador |
| Tinta al 85 % sobre lila | 9,66:1 | Párrafos de cuerpo |
| Tinta al 80 % sobre lila | 8,25:1 | Texto secundario |
| Blanco sobre uva | 7,08:1 | Barra de la terminal, caja de la raíz |
| Tinta al 70 % sobre lila | 5,98:1 | Metadatos, duraciones |
| Uva sobre lila | 5,85:1 | Enlaces, numeración |
| Tinta sobre chicle | 5,17:1 | Texto de los botones |
| Blanco sobre chicle | 3,34:1 | **Solo texto grande.** No usar en cuerpo |

Tinta al 60 % sobre lila da 4,34:1 y **no cumple**. Si isEazy te deja definir opacidades, no bajes del 70 %.

### Tipografía

| Rol | Fuente | Dónde |
|---|---|---|
| Títulos y texto | Bricolage Grotesque (800 titulares, 400 cuerpo) | Todo el contenido |
| Monoespaciada | Azeert Mono (400 y 600) | **Solo** comandos, rutas y salida de terminal |

Las dos están en Google Fonts. Si isEazy no las admite, sustituye Bricolage por una grotesca de palo seco con mucho peso en los titulares, y la monoespaciada por cualquiera de ancho fijo — pero mantén la regla de que **la monoespaciada se reserva para el código**, que es lo que hace legible la lección.

---

## Estructura de la lección

Nueve secciones, en este orden. Cada una puede ser una diapositiva o un bloque de isEazy.

1. Cabecera e índice
2. Resultados de aprendizaje
3. ¿Dónde estoy?
4. Todo cuelga de / → **gráfico + audio**
5. Mirar antes de moverse
6. Moverse → **vídeo**
7. Pruébalo tú → **simulador**
8. Resumen
9. Glosario
10. Actividades (próximamente)

---

## 1. Cabecera

**Enlace de vuelta:** «Volver al temario»

**Metadatos:** Tramo 02 · Lección 1 de 4 · 30 min aprox.

**H1:** Te mueves: rutas y carpetas

**Entradilla:**

> Un sistema de archivos es un mapa, y ahora mismo no sabes leerlo. En media hora sabrás siempre dónde estás, qué hay a tu alrededor y cómo llegar a cualquier sitio. Con tres comandos.

**Índice (En esta lección):**

1. Resultados de aprendizaje
2. ¿Dónde estoy?
3. Todo cuelga de /
4. Mirar antes de moverse
5. Moverse
6. Pruébalo tú
7. Resumen
8. Glosario
9. Actividades

---

## 2. Resultados de aprendizaje

**Al terminar esta lección podrás:**

- **Explicar** qué es el árbol de directorios y qué significa la raíz `/`.
- **Averiguar** en qué carpeta estás con `pwd` e interpretar lo que te dice el prompt.
- **Listar** el contenido de una carpeta con `ls`, `ls -l` y `ls -a`.
- **Moverte** con `cd` usando rutas absolutas y relativas, incluidas `.`, `..`, `~` y `cd -`.

---

## 3. ¿Dónde estoy?

Abres la terminal y lo primero que ves es una línea de texto que no has escrito tú. Se llama **prompt**, y no es decoración: te está diciendo tres cosas.

```
alex@ubuntu:~$
```

**Anatomía del prompt** (lista de definiciones):

| Parte | Qué significa |
|---|---|
| `alex` | Tu nombre de usuario. Quién eres para el sistema. |
| `ubuntu` | El nombre del equipo. Importa cuando te conectas a varios ordenadores a la vez. |
| `~` | La carpeta en la que estás ahora mismo. Esa virgulilla significa «mi carpeta personal». |
| `$` | Está lista y esperando. Puedes escribir. |

El prompt te da la carpeta abreviada. Cuando quieras la dirección completa, pregúntasela con `pwd`, de *print working directory*:

```
alex@ubuntu:~$ pwd
/home/alex
```

Ya tienes la primera respuesta: `~` y `/home/alex` son la misma carpeta escrita de dos maneras.

> ### 🔵 RECUERDA — el símbolo del dólar en el prompt
>
> El `$` no se escribe nunca. Forma parte del prompt, no del comando. Cuando copies una orden de internet y veas `$ sudo apt update`, copia solo lo que va después del dólar.

---

## 4. Todo cuelga de /

Si vienes de Windows, tienes metido en la cabeza que el disco se llama `C:`, que el pendrive es `E:` y que son sitios separados. En Linux eso no existe.

Aquí hay **un solo árbol**. Arriba del todo está la raíz, que se escribe con una barra sola: `/`. De ella cuelga todo lo demás, y cuando conectas un disco nuevo no aparece una letra: aparece una carpeta más dentro del mismo árbol.

### 🖼️ GRÁFICO — árbol de directorios

Archivo fuente: `src/components/ArbolSVG.astro` (SVG en línea, 660 × 486).
Para isEazy hay que exportarlo a PNG o rehacerlo con las formas de la herramienta.

Estructura a representar:

```
/                          ← la raíz: aquí empieza todo
├── /bin                   programas básicos
├── /etc                   configuración
├── /home                  las personas
│   └── /home/alex         ← tu carpeta personal, la misma que llamamos ~   [RESALTADA EN LIMA]
│       ├── Documentos
│       └── Fotos
├── /tmp                   cosas de usar y tirar
└── /usr                   el resto de programas
```

Colores del gráfico: líneas en uva, cajas blancas con borde tinta, la caja `/` en uva con texto blanco, la caja `/home/alex` en lima con texto tinta.

**Texto alternativo** (obligatorio, es lo que lee quien no ve la imagen):

> Diagrama en forma de árbol. En lo más alto está la raíz, que se escribe con una sola barra. De ella cuelgan cinco carpetas: bin, con los programas básicos; etc, con la configuración; home, donde está la gente; tmp, para cosas de usar y tirar; y usr, con el resto de programas. Dentro de home hay una carpeta llamada alex, que es la carpeta personal de esa persona y se abrevia con una virgulilla. Dentro de alex hay dos carpetas más: Documentos y Fotos. No hay ninguna letra de unidad como C o D: absolutamente todo cuelga de la misma raíz.

**Pie de figura:**

> El árbol de directorios de Linux. Todo cuelga de la raíz `/`, incluidos los discos que conectes: no existen `C:` ni `D:`. Tu carpeta personal, resaltada, es `/home/alex`, y se abrevia `~`.

De todas esas carpetas, la que te importa hoy es `/home/alex`: la tuya. Ahí están tus documentos, tus fotos y tus descargas, y es donde la terminal te deja al abrirse.

### 🔊 AUDIO — Por qué en Linux todo cuelga de una sola raíz

Duración: 1 min 30 s aprox. · Archivo: `audio-raiz.mp3`

**Guion / transcripción completa:**

> Si vienes de Windows, llevas años pensando en letras. El disco duro es C, el pendrive es E, el disco externo es F. Cada uno es un mundo aparte, con su propia raíz, y para pasar de uno a otro cambias de unidad.
>
> En Linux eso no existe. No hay letras. Hay un único árbol, y arriba del todo hay una barra sola: la raíz. De esa barra cuelga absolutamente todo lo que tiene el ordenador.
>
> Dentro de la raíz hay carpetas con nombres cortos que al principio parecen crípticos. Barra bin guarda los programas básicos, los que usas constantemente, como el propio ls. Barra etc guarda la configuración del sistema, en archivos de texto que puedes abrir y leer. Barra home es donde vive la gente: dentro hay una carpeta por cada persona que usa el ordenador, y la tuya lleva tu nombre.
>
> ¿Y el pendrive? Cuando lo enchufas no aparece ninguna letra nueva. Aparece una carpeta, normalmente dentro de barra media, y a partir de ese momento se recorre igual que cualquier otra. Esto se llama montar un disco, y es una de las cosas que más desconcierta al principio y que más cómoda resulta después.
>
> La idea que te tienes que llevar es esta: en Linux no cambias de unidad, solo te mueves por un árbol. Y como solo hay un árbol, cualquier cosa del ordenador tiene una única dirección que empieza por barra. Eso es una ruta absoluta, y la vas a usar constantemente.

> ### 🟢 ¿SABÍAS QUÉ…? — las unidades y los pendrives
>
> Un pendrive en Linux no es `E:`. Al enchufarlo aparece como una carpeta, casi siempre dentro de `/media`, y se recorre con `cd` igual que cualquier otra. A eso se le llama **montar** un disco.

---

## 5. Mirar antes de moverse

Ya sabes dónde estás. Ahora, qué tienes alrededor. Eso lo contesta `ls`, de *list*:

```
alex@ubuntu:~$ ls
Documentos  Fotos  notas.txt  proyecto
```

Fíjate en un detalle incómodo: `ls` a secas **no distingue** las carpetas de los archivos. `Documentos` es una carpeta y `notas.txt` es un archivo, pero los escribe igual. Para distinguirlos, pídele la versión larga con `-l`:

```
alex@ubuntu:~$ ls -l
total 16
drwxr-xr-x 2 alex alex 4096 oct 11 10:24 Documentos
drwxr-xr-x 2 alex alex 4096 oct 11 10:24 Fotos
-rw-r--r-- 1 alex alex  318 oct 11 10:24 notas.txt
drwxr-xr-x 2 alex alex 4096 oct 11 10:24 proyecto
```

Ahora sí. La **primera letra** de cada línea lo dice todo: una `d` es un directorio y un guion `-` es un archivo normal. Lo que sigue son los permisos, que verás en el tramo 03; después, quién es el dueño, el tamaño en bytes y la fecha del último cambio.

### Lo que no te está enseñando

Tu carpeta tiene más cosas de las que `ls` enseña. Todo lo que empieza por un punto está oculto, y hace falta pedirlo con `-a`, de *all*:

```
alex@ubuntu:~$ ls -a
.  ..  .bashrc  .config  Documentos  Fotos  notas.txt  proyecto
```

Han aparecido `.bashrc` y `.config`, que guardan tus preferencias, y dos nombres raros: `.` es esta misma carpeta y `..` es la de arriba. No son adorno, son los dos atajos que más vas a usar dentro de un momento.

Las opciones se combinan. `ls -la` es lo mismo que `ls -l -a`: lista larga, incluidos los ocultos.

> ### 🟢 ¿SABÍAS QUÉ…? — mayúsculas y minúsculas en los nombres
>
> `Fotos` y `fotos` son dos carpetas distintas. Linux distingue mayúsculas de minúsculas en todos los nombres, y Windows no. Es la causa del 90 % de los «pero si existe, lo estoy viendo» de la primera semana.

> ### 🔵 RECUERDA — los archivos ocultos
>
> Lo que empieza por punto está oculto. `ls` no lo enseña, `ls -a` sí. No están escondidos por seguridad: es solo para que no te estorben.

---

## 6. Moverse

El comando es `cd`, de *change directory*. Y aquí está la única idea de verdad importante de la lección: hay **dos formas de decir dónde quieres ir**.

Una **ruta absoluta** empieza por `/` y da la dirección completa desde la raíz. Es larga, pero funciona estés donde estés. Una **ruta relativa** no empieza por `/` y cuenta desde la carpeta en la que ya estás. Es corta, pero depende de dónde te encuentres.

Es la diferencia entre dar tu dirección postal completa y decir «la segunda puerta a la derecha».

### Tabla: formas de usar cd

*Con tu carpeta personal como punto de partida.*

| Escribes | Qué hace |
|---|---|
| `cd Fotos` | Entra en Fotos, que está aquí mismo. Es una ruta relativa: cuenta desde donde estás. |
| `cd /home/alex/Fotos` | Entra en la misma carpeta diciendo la dirección completa. Es una ruta absoluta y funciona estés donde estés. |
| `cd ..` | Sube un nivel, a la carpeta que contiene a esta. |
| `cd ../proyecto` | Sube un nivel y entra en proyecto. Las partes se encadenan con barras. |
| `cd .` | Se queda donde está. Un punto es «esta carpeta». Sola sirve de poco; en los scripts, de mucho. |
| `cd ~` | Vuelve a tu carpeta personal desde cualquier sitio. Lo mismo que escribir cd a secas. |
| `cd -` | Vuelve a la carpeta donde estabas antes. Es el botón de atrás del navegador. |

Cuando `cd` funciona no contesta nada. Esto desconcierta al principio, porque esperas una confirmación, pero es la norma de la casa: si el comando ha ido bien, se calla. Para comprobarlo, mira el prompt, que ya habrá cambiado, o pregunta con `pwd`.

### 🎬 VÍDEO — Moverte por las carpetas, paso a paso en una terminal de verdad

Duración: 2 min 30 s aprox. · Archivo: `screencast.mp4` · Póster: `poster.png` · Subtítulos: `screencast.vtt`

**Guion / transcripción completa:**

> Esto es una terminal recién abierta. No da miedo: solo está esperando a que le digas algo. Fíjate en esta línea: alex, arroba, ubuntu, dos puntos, virgulilla, dólar. Alex es mi usuario, ubuntu es el nombre del equipo y la virgulilla es la carpeta donde estoy. El dólar significa que está lista. Ese símbolo no se escribe nunca.
>
> Primera orden: `pwd`, Enter. Me contesta `/home/alex`. Esa es mi carpeta personal, la que la virgulilla abreviaba.
>
> Ahora `ls`, para ver qué hay aquí dentro. Documentos, Fotos, proyecto y un archivo de notas. Lo mismo que vería en el explorador de archivos.
>
> Voy a entrar en Documentos: `cd`, espacio, Documentos. No ha dicho nada. En Linux el silencio es buena señal: significa que ha funcionado. Lo compruebo en el prompt, que ahora pone virgulilla barra Documentos, y con `pwd` lo confirmo.
>
> Para subir un nivel: `cd`, espacio, punto, punto. Dos puntos seguidos siempre significan la carpeta de arriba. Ya estoy otra vez en mi carpeta personal.
>
> Hasta ahora he usado rutas relativas: cuentan desde donde estoy. También puedo dar la dirección completa: `cd /home/alex/Fotos`. Eso es una ruta absoluta. Empieza por barra y funciona desde cualquier sitio.
>
> Para volver a casa desde donde sea: `cd ~`, o `cd` a secas. Y un truco que gusta mucho: `cd -`, que me devuelve a la carpeta anterior. Es como el botón de atrás del navegador: si lo repites, vas y vuelves entre dos carpetas.
>
> Con `pwd`, `ls` y `cd` ya te mueves por todo el sistema. Pruébalo en el simulador de la lección.

> ### 🟢 ¿SABÍAS QUÉ…? — la tecla Tab y el autocompletado
>
> La tecla `Tab` autocompleta. En una terminal de verdad escribes `cd Doc`, pulsas `Tab` y ella termina la palabra por ti. Si hay varias opciones, púlsala dos veces y te las enseña. Vas a escribir menos y a equivocarte mucho menos.
>
> El simulador de esta página no hace autocompletado, así que ahí tendrás que escribir los nombres enteros.

> ### 🔵 RECUERDA — los atajos de cd
>
> - `cd` a secas, sin nada detrás, te lleva siempre a tu carpeta personal.
> - `..` es la carpeta de arriba. Se puede encadenar: `cd ../..` sube dos niveles.
> - Si te pierdes del todo, `cd` y vuelves a empezar.

---

## 7. Pruébalo tú

Esto es una terminal falsa con un sistema de archivos inventado. Funciona de verdad: entiende `pwd`, `ls` y `cd` con todas sus opciones, y te da los mismos errores que te daría Ubuntu. No está conectada a nada, así que puedes escribir lo que quieras.

### Cuatro cosas que probar

1. Pregunta `pwd` y compara la respuesta con lo que pone el prompt. ¿Ves que son la misma carpeta?
2. Haz `ls` y después `ls -a`. ¿Qué cuatro cosas aparecen solo en el segundo?
3. Entra en `Fotos`, mira lo que hay dentro y vuelve con `cd ..`. Luego haz lo mismo con la ruta absoluta `cd /home/alex/Fotos`.
4. Equivócate a propósito: escribe `cd noexiste` y lee el error entero. Después prueba `cd notas.txt`, que falla por un motivo distinto.

### ⚙️ SIMULADOR — especificación

Fuente: `src/components/Consola.astro` (JavaScript propio). **No se puede migrar tal cual** — ver notas de migración al final.

**Usuario y equipo:** `alex@ubuntu`, carpeta de partida `/home/alex`

**Sistema de archivos falso:**

```
/
├── bin/          bash, cd, ls, pwd
├── etc/          hostname, passwd
├── home/
│   └── alex/     ← carpeta de inicio
│       ├── .config/          ajustes.conf
│       ├── Documentos/       apuntes-linux.md, cv.pdf
│       ├── Fotos/            perfil.jpg, vacaciones/ (playa.jpg)
│       ├── proyecto/         deploy.sh, README.md
│       ├── .bashrc
│       └── notas.txt
├── tmp/          (vacía)
└── usr/          bin/, share/
```

**Comandos admitidos:**

| Comando | Comportamiento |
|---|---|
| `pwd` | Escribe la ruta absoluta actual |
| `ls` | Lista nombres, ordenados, sin ocultos |
| `ls -a` | Añade `.`, `..` y todo lo que empieza por punto |
| `ls -l` | Línea por archivo: permisos, enlaces, dueño, tamaño, fecha, nombre. Primera línea `total N` |
| `ls -la` / `ls -l -a` | Las dos cosas |
| `ls <ruta>` | Lista otra carpeta |
| `cd <ruta>` | Entra. Admite absolutas, relativas, `.`, `..`, `~` y `~/...` |
| `cd` | Vuelve a `/home/alex`, sin decir nada |
| `cd -` | Vuelve a la carpeta anterior **y escribe la ruta nueva** |
| `clear` | Limpia la pantalla |
| `help` | Lista los comandos |

**Mensajes de error, literales como los de bash en español:**

```
bash: cd: noexiste: No existe el archivo o el directorio
bash: cd: notas.txt: No es un directorio
ls: no se puede acceder a 'noexiste': No existe el archivo o el directorio
bash: plof: orden no encontrada
```

**Mensaje de bienvenida:**

```
Simulador de terminal. Aquí no se rompe nada.
Escribe help si no sabes por dónde empezar.
```

**Otros detalles:** el prompt se actualiza con la carpeta actual (`alex@ubuntu:~/Fotos$`), hay botón de reiniciar, las flechas ↑ y ↓ recuperan el historial, y hay botones de sugerencia que rellenan el campo: `pwd`, `ls -a`, `cd Fotos`, `cd ..`, `cd ~`, `help`.

**Instrucción que va encima del simulador:**

> Escribe un comando y pulsa Enter. Con las flechas ↑ y ↓ recuperas lo que ya has escrito. No es tu ordenador: aquí no se rompe nada.

> ### 🔴 PARA SABER MÁS — dónde seguir leyendo
>
> Si quieres seguir por tu cuenta, estas cuatro fuentes son buenas y están al día:
>
> - [Tutorial oficial de línea de comandos para principiantes](https://ubuntu.com/tutorials/command-line-for-beginners) (ubuntu.com, en inglés)
> - [Navegación por el sistema de archivos, capítulo de LinuxCommand](https://linuxcommand.org/lc3_lts0020.php) (linuxcommand.org, en inglés)
> - [Manual completo de ls traducido al español](https://manpages.ubuntu.com/manpages/noble/es/man1/ls.1.html) (manpages.ubuntu.com, en español)
> - [Filesystem Hierarchy Standard, la norma que decide qué va en cada carpeta](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html) (refspecs.linuxfoundation.org, en inglés)
>
> Los cuatro devolvían 200 la última vez que se comprobaron. Todos abren en pestaña nueva.

---

## 8. Resumen

- Todo cuelga de la raíz `/`. No hay letras de unidad: los discos y los pendrives aparecen como carpetas dentro del mismo árbol.
- El prompt ya te dice dónde estás. Si quieres la dirección completa, pregunta con `pwd`.
- `ls` enseña lo que hay. Con `-a` aparecen los ocultos y con `-l` ves permisos, tamaño y, sobre todo, la `d` que distingue las carpetas.
- Una ruta absoluta empieza por `/` y vale desde cualquier sitio. Una relativa cuenta desde donde estás.
- `..` es subir un nivel, `~` es tu carpeta personal y `cd -` te devuelve a la anterior.
- Si `cd` no dice nada, ha funcionado. En Linux el silencio es buena señal.

---

## 9. Glosario

| Término | Definición |
|---|---|
| **Terminal** | La ventana donde escribes órdenes en lugar de hacer clic. También la llamarás consola o línea de comandos. |
| **Prompt** | El texto que la terminal escribe sola al principio de cada línea para avisarte de que está lista. En Ubuntu tiene la forma `usuario@equipo:carpeta$`. |
| **Directorio** | Lo mismo que una carpeta. En Linux se usan las dos palabras indistintamente. |
| **Raíz** | La carpeta de la que cuelga absolutamente todo el sistema. Se escribe con una sola barra: `/`. No la confundas con la carpeta del usuario root. |
| **Carpeta personal (home)** | Tu carpeta dentro de `/home`, donde viven tus cosas. La de Alex es `/home/alex`. Se abrevia con la virgulilla `~`. |
| **Ruta absoluta** | La dirección completa de algo, empezando por la raíz. Siempre empieza por `/`. Por ejemplo `/home/alex/Fotos`. |
| **Ruta relativa** | La dirección contada desde la carpeta en la que estás ahora. No empieza por `/`. Por ejemplo `Fotos` o `../proyecto`. |
| **Archivo oculto** | Cualquier archivo o carpeta cuyo nombre empieza por un punto, como `.bashrc`. `ls` no lo enseña a menos que le pidas `ls -a`. |

---

## 10. Actividades

Próximamente. Aquí irán los ejercicios autocorregibles y la entrega de esta lección.

---

## Pie

> Tramo 02 del curso elr, aprende Linux sin romper nada.

Enlace: «Volver al temario»

---

# Notas de migración a isEazy

## Inventario multimedia

| Elemento | Archivo | Estado |
|---|---|---|
| Gráfico del árbol | `src/components/ArbolSVG.astro` | SVG en línea — hay que exportarlo a PNG |
| Audio | `public/media/te-mueves/audio-raiz.mp3` | **Pendiente de grabar** (guion arriba) |
| Vídeo | `public/media/te-mueves/screencast.mp4` | **Pendiente de grabar** (guion arriba) |
| Póster del vídeo | `public/media/te-mueves/poster.png` | Listo, 1280 × 720 |
| Subtítulos | `public/media/te-mueves/screencast.vtt` | Borrador con tiempos estimados |

## El simulador no se puede incrustar por URL

El elemento **Incrustar** de isEazy Author **solo acepta URLs de una lista blanca cerrada** de unos 44 servicios: YouTube, Vimeo, Genially, H5P, Educaplay, LearningApps, Canva, Padlet, Typeform, Google Drive, iVoox, Geogebra, Desmos, ThingLink y similares. Un dominio propio como `sjsilgom.upv.edu.es` da error de servicio no admitido.

Esto significa que **el simulador no entra en isEazy embebido**. Tres salidas, de más a menos fiel:

1. **Enlace externo.** Usar el elemento *Enlace* de isEazy apuntando a la lección publicada en la UPV. El simulador se conserva intacto, pero la persona sale del curso a otra pestaña.
2. **Rehacerlo en un servicio de la lista blanca.** Educaplay o LearningApps permiten montar actividades; no serán una terminal, pero sí ejercicios sobre qué hace cada comando. Se pierde la simulación, se gana que todo vive dentro del curso.
3. **Pedir a isEazy que añada el dominio.** Su documentación dice literalmente «Si echas de menos algún servicio, escríbenos y valoraremos incluirlo». Es una opción real, pero lenta e incierta para una fecha de entrega.

## Avisos del elemento Incrustar

- Lo incrustado **no se aloja en isEazy**: si el proveedor lo borra, desaparece del curso sin avisar.
- En un SCORM dentro de una intranet sin internet, **lo incrustado no se verá**.
- **No se reproduce** ni en el editor ni al abrir el contenido en local; hay que usar la vista previa.
- En **Modo Accesible**, isEazy ofrece una descripción alternativa que hay que rellenar a mano por cada elemento incrustado. Para el gráfico del árbol, usa el texto alternativo que está más arriba.

## Distribución

isEazy Author exporta a SCORM 1.2 y SCORM 2004 para un LMS, a `.zip` autoalojable en un servidor web, y da código de inserción por iframe. Si la asignatura pide una URL que funcione, cualquiera de las tres vale.
