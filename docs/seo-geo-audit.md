# Auditoría SEO y GEO de GOXO — 2 de octubre de 2026

## Alcance y resultado

Revisión del código, HTML generado de todo el sitio, enlaces internos, imágenes locales, títulos, descripciones, H1, canonical, hreflang, JSON-LD, sitemap, robots y navegación por idioma. Se comprobaron por separado builds de producción y revisión. 31 documentos HTML con contenido (además de las redirecciones), 18 URLs comerciales bilingües. El informe reproducible está en `output/seo/audit.json`; la comprobación de producción, en `output/seo/audit-production.json`.

Esto prepara el sitio para el rastreo. No demuestra indexación real ni posiciones en Google: el sitio revisado es localhost, y no se dispone de Search Console, Bing Webmaster Tools, logs del hosting ni métricas de usuarios reales.

## Correcciones aplicadas

- Grafo JSON-LD: organización, sitio y página; Service por experiencia; ItemList en inicio y catálogo; BreadcrumbList en páginas interiores; Person para Endika en About. Solo información ya visible y confirmada. No se inventaron precios, disponibilidad, valoraciones, dirección postal completa ni perfiles sociales.
- Metadatos Open Graph y Twitter con URL absoluta, idioma, título, descripción e imagen. Son metadatos para compartir, no una promesa de ranking.
- Descripciones de catálogo y contacto diferenciadas del inicio usando textos aprobados.
- Sitemap con 18 URLs comerciales, solo tours publicados y alternativas EN/ES/x-default recíprocas. Sin lastmod ficticio.
- Eliminados selectores y hreflang hacia traducciones inexistentes en 404, editor y detalle de borradores.
- Al cambiar idioma sin recarga, se actualizan descripción, canonical, Open Graph, Twitter y JSON-LD. Enlaces a otras experiencias también traducen su texto.
- Producción permite el rastreo para que se pueda leer noindex en páginas excluidas. Editor, borradores, blog vacío, 404 y documentos legales pendientes mantienen noindex. La revisión conserva bloqueo global y noindex.
- Producción permite previsualizaciones grandes de imágenes mediante max-image-preview:large.
- Imágenes de tarjetas con variante de 900 px y decodificación asíncrona. El vídeo del hero conserva carga diferida y póster.
- Script `node scripts/audit-seo.mjs` para comprobar HTML sin ejecutar JavaScript; modo `--production` valida la política de indexación pública.

## Prioridades antes del lanzamiento

| Prioridad | Acción | Dependencia |
|---|---|---|
| Crítica | Confirmar dominio definitivo y PUBLIC_SITE_URL; activar PUBLIC_INDEXABLE=true solo en el despliegue público | Hosting/dominio |
| Crítica | Comprobar 200 en URLs comerciales, 404 real para páginas inexistentes y redirecciones HTTP 301 desde rutas antiguas, conservando parámetros | Configuración del hosting |
| Crítica | Proteger editor y vistas de borrador con autenticación o excluirlos del despliegue público | Hosting; noindex no es seguridad |
| Alta | Revisar robots.txt y cabeceras X-Robots-Tag del despliegue/CDN; retirar bloqueos accidentales de buscadores | Hosting/CDN |
| Alta | Verificar Search Console y Bing Webmaster Tools, enviar sitemap e inspeccionar inicio y cinco tours en ambos idiomas | Acceso a cuentas |
| Alta | Validar schema en Schema.org Validator y Rich Results Test sobre el dominio publicado | URL pública; Service no implica resultado enriquecido |
| Alta | Completar textos alternativos de imágenes según el documento de Endika | Alt oficiales pendientes |
| Alta | Confirmar datos legales, identidad comercial y ficha Google Business Profile; enlazar reseñas verificables | Endika/cuentas |
| Media | Sustituir imagen provisional de San Sebastián y medios externos por fotografías y vídeos propios | Medios oficiales |
| Media | Medir LCP, INP y CLS en móvil con PageSpeed/CrUX al publicar | Datos reales; no se afirma ninguna puntuación Lighthouse |

La página de San Sebastián utiliza una imagen CC0 provisional identificada en los créditos. Las imágenes propias de Bilbao y pintxos están incorporadas. Hay alt vacíos pendientes de aprobación: describir la escena real en el idioma de la página, sin repetir palabras clave ni presentar fotografías de referencia como experiencias reales de GOXO.

## Contenido y GEO

GOXO ya ofrece datos que ayudan a responder preguntas: cinco tours privados, regiones, duración, grupos de 2–8 personas, guía local, forma de consultar, historia personal y FAQ. Todo ello está en el HTML inicial. Mantener los textos oficiales, datos consistentes y respuestas claras es más útil que añadir frases repetitivas sobre keywords.

Ampliaciones que requieren aprobación de Endika: salida y recogida concreta por experiencia; accesibilidad y exigencia física; idiomas realmente ofrecidos por el guía; inclusiones verificadas; política y precios confirmados cuando se publiquen; fechas y procedencia de testimonios. No se necesita alcanzar una longitud arbitraria de palabras. No generar artículos de relleno ni páginas casi idénticas por cada localidad.

Consolidar la entidad GOXO: nombre, dominio, teléfono y correo iguales en web, Google Business Profile, Bing Places y perfiles oficiales. Incorporar sameAs solo cuando se tengan las URLs correctas. Priorizar enlaces y menciones reales de negocios y entidades locales con quienes GOXO ya colabora; no fabricar menciones ni acreditaciones.

Para resultados con IA, Google declara que no hacen falta archivos especiales ni schema específico. El contenido debe estar indexado y ser elegible para mostrar snippets. Por eso no se añadió llms.txt como supuesto requisito, marcado de reseñas inventadas ni FAQ esperando estrellas o resultados enriquecidos. Revisar en el hosting las políticas para bots de búsqueda/recuperación de IA; permiso de búsqueda y permiso de entrenamiento son decisiones distintas. No se modificaron preferencias específicas de entrenamiento.

## Medición después de publicar

1. Inspeccionar cobertura e indexación, canonical elegido por Google y hreflang de las 18 URLs.
2. Revisar a los 30, 60 y 90 días impresiones, clics, consultas, páginas y países en Search Console y Bing.
3. Medir consultas reales de disponibilidad, con consentimiento si se incorpora Analytics; separar clics de contactos efectivamente enviados.
4. Seguir visibilidad/citas en asistentes cuando las herramientas lo permitan; registrar consulta, fecha, URL citada y contexto. Una mención aislada no demuestra posicionamiento estable.
5. Ajustar contenido aprobado según preguntas y búsquedas reales. IndexNow puede evaluarse para Bing al elegir hosting; no sustituye sitemap ni garantiza indexación en Google.

## Referencias oficiales

- [Google: funciones de IA y sitios web](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: versiones localizadas y hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: noindex y rastreo](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Google: datos estructurados](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Bing: directrices para webmasters](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)
- [Bing: sitemaps](https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed)

## Ajustes finales aplicados

El dominio permanece configurable por PUBLIC_SITE_URL, según la decisión del usuario. npm run build:release lee las variables PUBLIC_ de .env y .env.production, exige un origen HTTPS explícito, genera la versión indexable y ejecuta la auditoría. Los builds públicos excluyen físicamente los HTML del editor y del detalle de borradores, y el JavaScript público ignora preview=true y el almacenamiento de borradores.

Se añadieron descripciones alternativas factuales EN/ES de las imágenes disponibles en src/data/image-alts.json, aplicadas a tours, motivos GOXO, presentación y galerías, también al cambiar idioma. Son descripciones preparadas a partir de las fotos y sus créditos; no se presentan como un documento oficial nuevo de Endika. Las imágenes decorativas conservan alt vacío.

Se prepararon 13 redirecciones HTTP 301 en output/seo/redirects.csv y un ejemplo _redirects para hosts compatibles. No se han aplicado a un proveedor todavía; mantener parámetros de consulta al configurar el hosting. También se preparó PUBLIC_BING_SITE_VERIFICATION. Los tokens de Google/Bing siguen vacíos hasta disponer de ellos.

Validación final: 31 documentos en revisión y 29 en producción, 18 URLs comerciales en ambos modos, cero errores en auditoría. Diez pruebas de estado aprobadas; navegador verificó alt de portada y galería, schema traducido y catálogo accesible sin JavaScript. Sin publicación ni conexiones externas. Continúan pendientes los datos legales, cuentas externas, nuevos medios oficiales y medidas reales de rendimiento/indexación.

