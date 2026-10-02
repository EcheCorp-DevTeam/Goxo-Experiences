# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Contenidos de la Home

- `src/data/home.ts`: claim y CTA, títulos, presentación, pósteres y vídeos (ES/EN).
- `src/data/home-copy.json`: textos de opiniones, historias y preguntas frecuentes.
- `src/data/tours.ts`: fotos y textos de cada tour, diferenciadores y reseñas; las tarjetas reciben el objeto `tour` por props.
- `src/data/media.json`: rutas de los medios compartidos.

Para activar la presentación, añadir el vídeo real a `public/media/` y completar `home.host.video` con su ruta pública, por ejemplo `/media/endika-presentacion.mp4`. Ajustar `home.host.poster` y añadir subtítulos WebVTT en `home.host.captions` (`src`, `lang`, `label`). Hasta recibir el archivo se muestra solo el retrato, sin botón inactivo ni peticiones a un vídeo inexistente. Se conserva el nombre Endika del contenido original.

El Hero usa el MP4 existente (1,5 MB) y un póster prioritario. La URL del vídeo se asigna después de `load`, dos frames de render y un turno libre del navegador; se omite con movimiento reducido, ahorro de datos o conexión 2G. Se pausa fuera de pantalla y cuando la pestaña está oculta. La presentación se descarga únicamente al pulsar, con controles nativos y opción de reintento. Verificar el LCP en móvil con los medios definitivos: el tamaño y la codificación de los archivos del cliente siguen siendo determinantes.

Validación: `npm run build`, `node --test --test-isolation=none tests/state.test.mjs` y los escenarios Playwright de `tests/home.browser.js` y `tests/motion.browser.js` (ejecutables mediante `browser_run_code_unsafe`, parámetro `filename`). Para desarrollo: `npx astro dev --background`.
