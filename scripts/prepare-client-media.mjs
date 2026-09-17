// Converts the client's own photographs from contexto/Imagenes into the web
// assets under public/media, then rewrites the credits and labels they replace.
// Run from the project root: node scripts/prepare-client-media.mjs
import sharp from 'sharp';
import fs from 'node:fs/promises';

const SRC = 'contexto/Imagenes';
const OUT = 'public/media';

// target file -> { from, small?, label }
const photos = {
  'bilbao.webp': { from: 'Bilbo (21 de 77).jpg', small: true, label: 'La ría de Bilbao desde Artxanda' },
  'pintxos.webp': { from: 'Pintxos-tour-Bilbao.jpg', small: true, label: 'Barra de pintxos en el Casco Viejo' },
  'endika.webp': { from: 'Bilbo (24 de 77).jpg', small: true, label: 'Endika, guía local de GOXO Experiences' },
  'grupo.webp': { from: '20240802-DSC03148.jpg', small: true, label: 'Endika con un grupo privado en Bilbao' },
  'gallery-casco-viejo.webp': { from: 'Bilbo (19 de 77).jpg', label: 'Las Siete Calles, Casco Viejo de Bilbao' },
  'gallery-bar-bilbao.webp': { from: 'Basque-country-wine-experience.jpg', label: 'Sobremesa en una terraza de Bilbao' },
  'gallery-zubizuri.webp': { from: 'Bilbo (68 de 77).jpg', label: 'La ría a su paso por el Casco Viejo' },
  'gallery-arriaga.webp': { from: 'Bilbo (73 de 77).jpg', label: 'Teatro Arriaga, Bilbao' },
  'gallery-ribera.webp': { from: 'Verano Europa (362 de 562).jpg', label: 'Mercado de la Ribera, Bilbao' },
  'gallery-siete-calles.webp': { from: 'Verano Europa (359 de 562).jpg', label: 'Calles del Casco Viejo de Bilbao' },
};

for (const [file, { from, small }] of Object.entries(photos)) {
  const image = sharp(`${SRC}/${from}`).rotate();
  await image.clone().resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 84 }).toFile(`${OUT}/${file}`);
  if (small) {
    await image.clone().resize({ width: 900, withoutEnlargement: true }).webp({ quality: 82 })
      .toFile(`${OUT}/${file.replace('.webp', '-small.webp')}`);
  }
  console.log('wrote', file);
}

const media = JSON.parse(await fs.readFile('src/data/media.json', 'utf8'));
media.endika = '/media/endika.webp';
media.grupo = '/media/grupo.webp';
media.galleries['bilbao-cultura'] = ['/media/gallery-arriaga.webp', '/media/gallery-ribera.webp'];
media.galleries.pintxos = ['/media/gallery-casco-viejo.webp', '/media/gallery-bar-bilbao.webp', '/media/gallery-siete-calles.webp'];

// Third-party credits for files now replaced by the client's own photography.
const replaced = new Set(['bilbao.jpg', 'pintxos.jpg', 'gallery-casco-viejo.webp', 'gallery-bar-bilbao.webp', 'gallery-zubizuri.webp']);
media.credits = media.credits.filter(c => !replaced.has(c.file) && !(c.file in photos));
for (const [file, { label }] of Object.entries(photos)) {
  media.credits.push({
    title: label,
    author: 'GOXO Experiences',
    license: 'Todos los derechos reservados',
    licenseUrl: '',
    source: '',
    notes: 'Fotografía propia del cliente.',
    file,
  });
  if (file.startsWith('gallery-')) media.labels[`/media/${file}`] = label;
}

await fs.writeFile('src/data/media.json', JSON.stringify(media, null, 1) + '\n');
console.log('media.json updated');
