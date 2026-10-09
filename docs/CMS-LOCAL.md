# GOXO · Keystatic local

Panel: http://127.0.0.1:4321/keystatic/
Web: http://127.0.0.1:4321/

El servidor está limitado a este equipo. El modo local no requiere login: no se debe exponer a Internet ni a la red local. La integración y las rutas API de Keystatic se excluyen del build de producción. La autenticación GitHub se configurará en una fase posterior, antes de publicar el administrador.

## Uso

1. Abrir el panel y elegir una sección.
2. Editar los campos Español / English o elegir una imagen/vídeo.
3. Pulsar **Save** y abrir la web local para comprobarlo.

Los cambios se guardan en `src/content/site/*.json`. Los medios gestionados por el panel se guardan en `public/media/cms/<sección>/`; los archivos originales permanecen en `public/media/`. La portada permite ordenar y ocultar secciones desde **Identidad, contacto y SEO**. Los tours se pueden añadir, ordenar, editar y despublicar en **Experiencias y tours**. Conservar los identificadores internos y las URLs de los tours existentes; cambiar una URL requiere preparar una redirección.

Los textos comerciales originales siguen archivados en `src/data/official.json` para comparar la migración. La web lee los archivos del CMS; los borradores del antiguo editor del navegador no son el contenido del CMS.

### GOXO Studio

`/admin/` y `/keystatic/` abren la vista general: tabla de tours, búsqueda, filtro de publicación y accesos al resto del contenido. **Editar catálogo** abre la lista de experiencias de Keystatic; seleccionar un tour para modificarlo. **Ver tour** abre la página pública local. El estado «Publicado» corresponde a la web local, no a un despliegue en Vercel.

Los formularios conservan el guardado y los controles de Keystatic, con navegación agrupada y estilo GOXO. **Volver al panel GOXO** regresa a la vista general; guardar los cambios antes de salir. No se han modificado archivos de las dependencias para personalizar la interfaz.

## Editor del blog y previsualizaciones

El blog se gestiona como una colección: **Blog · Artículos**. Cada artículo tiene su propia pantalla y se guarda en `src/content/articles/<slug>.json`; el antiguo `src/content/site/articles.json` queda como archivo de la migración inicial, sin artículos publicados.

El contenido Español / English usa un editor visual Markdoc: títulos H2–H4, negrita, cursiva, listas, citas, enlaces, tablas, separadores e imágenes. El H1 se reserva para el título público. Las imágenes de portada se guardan en `public/media/cms/articles/covers/` y las del texto en `public/media/cms/articles/inline/`. Añadir sus descripciones accesibles.

Guardar el artículo antes de abrir **Previsualizar blog** o el icono de previsualización de Keystatic. La vista muestra la última versión **guardada**, incluidos borradores: selector de artículo, español/inglés, escritorio/tablet/móvil, tiempo de lectura, subtítulos y simulación de título y descripción en buscadores. Después de guardar nuevos cambios, pulsar **Actualizar desde el CMS**. Los campos SEO opcionales utilizan el título público y la entradilla como alternativa.

Las rutas `/cms/blog-preview` y `/cms/article-preview` solo existen en desarrollo, llevan `noindex` y no forman parte del sitemap ni del build de producción. Los borradores se excluyen de las páginas públicas. La vista previa y la web publicada comparten el mismo renderizador y los estilos del artículo.

## Vídeos

En **Vídeos y presentación**, elegir un archivo local MP4/WebM o indicar una URL HTTPS directa. La URL externa tiene prioridad. Se pueden añadir subtítulos VTT para Endika. YouTube/Vimeo necesitan una integración de reproductor para utilizar enlaces de sus páginas; esos enlaces no son archivos de vídeo directos. En esta fase los archivos se guardan localmente; evitar subir vídeos grandes a Git cuando se prepare la publicación.

## Contenido pendiente

Los textos legales conservan su estado de borrador y los datos pendientes. El blog comienza vacío y solo aparece con artículos publicados. Las reseñas deben ser reales y tener un enlace verificable; no hay sincronización automática con Google. El vídeo de presentación de Endika sigue pendiente.

## Desarrollo y validación

```powershell
npx astro dev --background --host 127.0.0.1
npx astro dev status
npx astro dev logs
npx astro dev stop
npm run validate:cms
npm run test:cms
npm run build
```

No se han conectado servicios externos, subido commits ni desplegado esta migración. Para habilitar el panel en producción harán falta GitHub App, permisos de colaboradores, secretos de servidor y el adaptador de Vercel; el modo local no debe publicarse.

Los editores comparten la apariencia de GOXO Studio: navegación oliva, formularios sobre paneles claros, botones y diálogos coherentes y campos bilingües en columnas en escritorio. En móvil se apilan; el guardado nativo de Keystatic se conserva. La barra superior permite volver al panel y abrir el sitio o la previsualización del blog.

