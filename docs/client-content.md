# Integración de la entrega definitiva de GOXO

Rama de trabajo: `feat/client-final-content`. Referencia editorial: las 33 páginas de `Textos web definitivos.pdf`. Fotografía: entrega `GOXO Fotos editadas`; las versiones Markdown y TXT de las dos guías contienen la misma información.

El inglés de las experiencias se extrajo del PDF normalizando únicamente los saltos de línea de maquetación. No se resumieron las descripciones, itinerarios, inclusiones, consejos, opciones o respuestas. Los campos españoles contienen la traducción completa. Las instrucciones para desarrolladores no se publican como contenido comercial.

## Correspondencia con el documento

| Páginas | Contenido | Implementación |
| --- | --- | --- |
| 1 | Home, títulos y descripciones del catálogo | `src/content/site/home.json`, `tours.json`; disposición alternada en escritorio |
| 1–2 | Cuatro razones GOXO Way y presentación breve de Endika | `way.json`, `about.json`; enlaces a `/about/#values` y `/about/#story` |
| 3–4 | Ocho preguntas generales, contacto final y pie | `faq.json`, `home.json` y layout compartido |
| 4 | Travel Journal | Enlace permanente en el pie; tres artículos en Home solo a partir de tres publicados, entre FAQ y contacto |
| 5–9 | Rioja: SEO, introducción, descripción, resumen, horario, inclusiones, opciones, consejos, cinco FAQ y CTA | Tour `rioja`; imagen principal de viñedos y siete fotos de galería |
| 9–13 | Costa vasca: contenido completo y cinco FAQ | Tour `costa-vasca`; mirador incluido, caminata y comida opcionales; cinco fotos de galería |
| 13–16 | Pintxos: contenido completo y seis FAQ | Tour `pintxos`; seis locales, tres horas, degustaciones previstas incluidas; cinco fotos de galería |
| 16–20 | Bilbao arte y ciudad: contenido completo y siete FAQ | Tour `bilbao-cultura`; entrada e interior del Guggenheim incluidos, variante exterior y comida opcionales; siete fotos de galería |
| 21–25 | San Sebastián y Getaria: contenido completo y siete FAQ | Tour `san-sebastian-getaria`; comida incluida según propuesta, Balenciaga opcional; cinco fotos de galería |
| 25–30 | Multi-day: contenido completo, siete intereses, cuatro pasos de planificación y nueve FAQ | Tour `multi-day`; sin itinerario diario fijo; ocho fotos de galería |
| 30–33 | About: cabecera, historia completa, diez valores y fotografías | `about.json`; valores inicialmente cerrados y controles para abrir/cerrar todos |
| 33 | Contacto, retrato, tour e idioma preseleccionados | Retrato de Endika, selección por `?tour=`, inglés/español inicial según la página |

## Imágenes y CMS

El inventario reproducible está en `src/data/client-media.json`: 46 JPG seleccionados, 43 archivos únicos y 19 imágenes de reserva excluidas. Las tres fotografías repetidas comparten una URL. El PDF aporta los ALT de Plaza Nueva y las esculturas interiores del Guggenheim, ausentes en la tabla ALT separada. Las ubicaciones originalmente pendientes se consideran confirmadas por indicación del usuario.

`npm run prepare:client-media` genera WebP reales con tamaños 640, 960, 1600 y hasta 1920 píxeles, sin ampliar originales pequeños ni modificar los JPG. Las variantes se sirven mediante `srcset`; las principales reciben prioridad y las inferiores usan carga diferida. El CMS apunta al directorio de los archivos importados; una prueba comprueba que leer y serializar sus campos no pierde las imágenes.

La principal de cada tour es la que comienza por `1-`. About usa la costa panorámica como cabecera, el retrato junto a la historia y la conversación después de los valores. Contacto utiliza el retrato siguiendo la indicación específica del PDF. La foto breve de Home se conserva. GOXO Way utiliza las cuatro imágenes indicadas en el PDF. La terraza de Mundaka no se identifica como el asador opcional; las vacas se describen como animales de pastoreo.

Los campos nuevos —resumen práctico, títulos, opciones/consejos, FAQ de cada experiencia, CTA, diez valores y fotos de About/Contacto— se editan desde Keystatic. Artículos y reseñas pueden asociarse a tours por sus identificadores existentes. Solo se muestran artículos publicados y reseñas verificadas del tour correspondiente; no se han inventado publicaciones ni reseñas.

## Verificación

- `npm run build`: valida el CMS y genera la salida estática; ejecutar antes de las pruebas que leen `dist`.
- `npm run test:cms`: incluye la referencia editorial extraída en `tests/fixtures/client-copy-en.json`, la comparación de todo el cuerpo de los seis tours en el HTML inglés/español y las imágenes WebP reales.
- `tests/client-content.browser.js`: prueba formulario con respuestas locales simuladas 503/204, conservación de datos, confirmación, idioma/tour, intereses, valores, galería, teclado y anchuras de 320 a 1440 píxeles. No envía correos ni datos a servicios externos.
- Los builds de preview también ejecutan la validación del CMS.

La referencia editorial registra el SHA-256 del PDF. Si el cliente cambia deliberadamente los textos mediante el CMS, los tests de fidelidad avisarán: actualizar la referencia únicamente contra la nueva entrega aprobada, no para ocultar diferencias.

## Revisión de encuadres

Se revisaron visualmente los 43 originales seleccionados y el retrato utilizado en Home. Los marcos con `cover` ocultaban hasta aproximadamente la mitad de algunas fotografías verticales. Las imágenes de contenido conservan ahora su encuadre completo y proporción: catálogo, GOXO Way, retratos, galerías, About y experiencias relacionadas. Contacto muestra también el retrato en móvil.

Por indicación posterior del usuario, las portadas de los tours vuelven a ocupar todo el ancho y alto de su banner con `cover` y el título superpuesto, como antes. Esta es la única excepción entre las fotografías de contenido: galerías y retratos conservan el encuadre completo. Los botones de ampliación quedan debajo de las imágenes. Se retiró la lupa y el zoom de entrada/hover que recortaba u ocultaba sus bordes. La carga diferida conserva espacio con la relación de aspecto de cada archivo.

`tests/photo-framing.browser.js` verifica las 43 imágenes en 390 y 1440 píxeles, además del retrato de Home: 188 apariciones en total. Comprueba el ancho completo de las portadas y que las otras fotografías no se recorten, deformen ni amplíen. El fondo decorativo del vídeo de Home mantiene su tratamiento de fondo y está excluido de esta comprobación de fotografía de contenido. No se alteraron los archivos originales; cualquier detalle que ya falte en el JPG de entrega no puede recuperarse mediante CSS.

## Pendientes de entrega externa

- `walking-leafy-trail.jpg` figura en los documentos, pero no está en la carpeta: se omite sin sustituirla por una fotografía de reserva.
- El nuevo vídeo de Endika no ha sido entregado; no se muestra un reproductor vacío.
- No existe proveedor de correo configurado para esta integración. El formulario conserva el contrato JSON existente, ofrece correo/WhatsApp si falta endpoint y solo confirma después de una respuesta satisfactoria. La activación real requiere un endpoint HTTPS y sus controles de servidor.
- No se ha desplegado ni publicado automáticamente. Los originales, el PDF y los artefactos de trabajo no son necesarios para alojar la web; los WebP generados sí.
