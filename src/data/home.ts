import official from './official.json';
import media from './media.json';

// Client-editable Home copy and media. Tour photos/copy live in tours.ts.
// Keep video empty until the actual host film is supplied; never use stock footage as an introduction.
export const home = {
  title: official.title.en,
  hero: {
    poster: media.coast,
    video: media.video,
    claim: official.claim,
    cta: {es: 'Planifica tu experiencia', en: 'Plan Your Experience'},
    pause: {es: 'Pausar vídeo de fondo', en: 'Pause background video'},
  },
  experiences: {
    title: {es: 'Experiencias privadas.', en: 'Private experiences.'},
    note: {es: 'Costa, vino, gastronomía y cultura. A tu ritmo.', en: 'Coast, wine, food and culture. At your pace.'},
    filters: [['all','Todas','All'],['costa','Costa','Coast'],['vino','Vino','Wine'],['gastronomia','Gastronomía','Food'],['cultura','Cultura','Culture']],
    empty: {es: 'No hay experiencias en esta selección.', en: 'No experiences in this selection.'},
  },
  why: {
    title: {es: 'Por qué GOXO.', en: 'Why GOXO.'},
    note: {es: 'Seis razones, sin letra pequeña.', en: 'Six reasons, no small print.'},
  },
  host: {
    title: {es: 'Kaixo. Soy Endika.', en: 'Kaixo. I’m Endika.'},
    paragraphs: [
      {es: 'Bilbaíno, guía local y curioso de toda la vida. Llevo más de once años compartiendo lugares, sabores e historias con viajeros de todo el mundo.', en: 'Born in Bilbao, a local guide and curious for life. I’ve spent more than eleven years sharing places, flavours and stories with travellers from around the world.'},
      {es: 'GOXO nace de una forma muy personal de viajar: conocer a la gente, sentarse a la mesa y dejar que el lugar te sorprenda.', en: 'GOXO comes from a very personal way of travelling: meet the people, sit at the table and let the place surprise you.'},
    ],
    cta: {es: 'Conoce más sobre GOXO ↗', en: 'More about GOXO ↗'},
    poster: media.endika,
    posterAlt: {es: 'Endika, guía local de GOXO Experiences', en: 'Endika, GOXO Experiences local guide'},
    video: '',
    captions: [] as {src: string; lang: string; label: string}[],
    play: {es: 'Ver mi presentación', en: 'Watch my introduction'},
    error: {es: 'No se pudo reproducir el vídeo. Vuelve a intentarlo.', en: 'The video could not play. Please try again.'},
  },
};
