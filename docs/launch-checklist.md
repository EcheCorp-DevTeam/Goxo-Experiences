# GOXO — entrega para revisión

## Aplicado

El inglés aprobado procede de `GOXO_Web_Text_and_SEO_Brief_FINAL_v2.odt`; las notas para desarrollo no se muestran como contenido comercial. La home usa las descripciones de su apartado específico; el catálogo y las páginas individuales usan las descripciones ampliadas de sus apartados. Bilbao queda en 4 horas y todas las experiencias en 2–8 personas, decisiones confirmadas durante la planificación.

La web pública ignora los borradores locales. El editor sigue disponible en `/admin/`; sus enlaces de vista previa llevan `?preview=true`. Los borradores se conservan en el navegador y no se publican al guardar.

## Material pendiente

- Vídeo real de GOXO para el hero. Sigue el vídeo provisional de Gaztelugatxe, con licencia y crédito conservados.
- Presentación real de Endika (45–60 segundos), póster y subtítulos EN/ES. Configuración en `src/data/home.ts`; la transcripción completa ya está en HTML.
- Foto identificada de San Sebastián/Getaria: espacio reservado sin mostrar otra ubicación.
- Fotografías definitivas de Rioja y Costa Vasca para sustituir las referencias actuales; completar galerías de 4–8 fotos por experiencia.
- Alt oficiales de Endika: los campos bilingües están preparados y vacíos; no se han rellenado con fórmulas SEO ni escenas supuestas. Revisar también la galería antes de publicar.
- Texto adicional aprobado para llegar a 500–800 palabras por experiencia. Se conserva la descripción ampliada suministrada, sin rellenar con promesas inventadas.
- Confirmación detallada de inclusiones/opciones, itinerarios y puntos de salida. Por ahora se muestran el esquema respaldado por los textos y la confirmación en propuesta personal.
- URL real de Google Business Profile y 3–4 reseñas verificadas (autor, puntuación, fecha, texto y enlace a Google). No hay testimonios de muestra ni valoración agregada ficticia.
- Artículos aprobados: el bloque y el enlace del blog aparecen solo cuando `posts` tiene contenido aprobado.
- Completar y validar los borradores legales existentes antes del lanzamiento.

## Lanzamiento y medición

Copiar `.env.example` a la configuración del entorno de publicación. Confirmar `PUBLIC_SITE_URL` y poner `PUBLIC_INDEXABLE=true` únicamente en el lanzamiento público. Las versiones de revisión mantienen `noindex, nofollow` y robots bloqueado. `/admin/` y la vista de borradores no se indexan.

Introducir `PUBLIC_GOOGLE_REVIEWS_URL` solo cuando la ficha real esté lista. Introducir `PUBLIC_GOOGLE_SITE_VERIFICATION` con el token de la propiedad Search Console y enviar `/sitemap.xml`. Analytics queda pendiente de ID, acceso y configuración de consentimiento; no hay rastreadores activos.

Cada mes: revisar impresiones, clics y posición de “private tours Bilbao”, “private Bilbao food tour”, “private Bilbao city tour” y “Rioja wine tour from Bilbao”. A los 90 días ajustar los contenidos según consultas reales.

Astro está configurado como sitio estático. Las rutas anteriores generan páginas de redirección; configurar redirecciones HTTP 301 en el hosting definitivo y conservar query strings, especialmente `?tour=`, al publicar.

## Comprobaciones

- `npm run build`
- `node --experimental-strip-types --test --test-isolation=none tests/state.test.mjs`
- Playwright: `tests/home.browser.js`, `tests/motion.browser.js`, `tests/viewer.browser.js` contra `http://localhost:4321/`.
- Servidor: `npx astro dev --background`; gestión con `npx astro dev status`, `stop` y `logs`.
- Capturas: `output/playwright/goxo-desktop.png` y `goxo-mobile.png`.

## Fotografías oficiales compartidas el 2 de octubre

Carpeta: https://drive.google.com/drive/folders/1UanfbQ7Q6h7wbITm2-1TsQYpZHG1aP6k (Fotos Bilbao). Incorporada Bilbao Old Town tour.jpg como portada y primera foto de la experiencia Bilbao Art, Culture & Guggenheim, en ambos idiomas. Copia descargada de la vista previa conservada en contexto/Imagenes; versiones WebP de 1281 y 900 px sin ampliar. La descarga masiva de Drive falló; se recuperó individualmente esta fotografía. Las fotografías propias existentes del teatro, mercado, panorámica de Bilbao y terraza siguen disponibles. La comparación exacta de los otros originales de esta carpeta y las carpetas de Rioja, costa y San Sebastián/Getaria queda pendiente. Los alt oficiales siguen pendientes del documento de Endika.



Actualización: incorporados los seis archivos locales de Fotos Bilbao. Portada de Bilbao: Bilbao Old Town tour.jpg (sustituye la copia de Drive por el JPG descargado). Galería de Bilbao: guía local, panorámica, Teatro Arriaga, Mercado de la Ribera y comercio del Casco Viejo. Galería de pintxos: experiencia de terraza y comercio local, junto a las fotos propias anteriores. Teatro Arriaga utiliza la vista previa JPEG embebida de 1616 × 1080 del RAW sin extensión; el original permanece intacto en Fotos Bilbao. Queda resuelta la comparación de esta carpeta; siguen pendientes las de otros destinos y los alt oficiales.


## Build público y variables

Mantener PUBLIC_INDEXABLE=false para revisión. Definir PUBLIC_SITE_URL en .env.production con el dominio HTTPS confirmado y ejecutar npm run build:release. Este comando verifica SEO, excluye editor/borradores y prepara redirecciones. No publica el sitio. Aplicar output/seo/redirects.csv en el hosting conservando parámetros. PUBLIC_GOOGLE_SITE_VERIFICATION y PUBLIC_BING_SITE_VERIFICATION permiten incluir tokens reales cuando estén disponibles.

