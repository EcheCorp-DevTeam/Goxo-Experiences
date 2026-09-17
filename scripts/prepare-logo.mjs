// Builds the header logo and the favicon set from the client's original PNGs.
// Both originals ship with the cream background baked in. Measuring the sources
// shows a clean valley: background and its antialiasing sit within ~10 of the
// corner colour, the ink sits beyond ~50. So the background is keyed by colour
// with a feathered alpha ramp across that valley, which also clears the counters
// inside the letters — a flood fill from the edges cannot reach those.
// Run from the project root: node scripts/prepare-logo.mjs
import sharp from 'sharp';
import fs from 'node:fs/promises';

const OUT = 'public/media';
const SOLID = 26; // fully opaque at or beyond this distance from the background
const CLEAR = 10; // fully transparent at or below it

async function cutBackground(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const [br, bg, bb] = [data[0], data[1], data[2]];
  for (let i = 0; i < data.length; i += channels) {
    const d = Math.max(Math.abs(data[i] - br), Math.abs(data[i + 1] - bg), Math.abs(data[i + 2] - bb));
    data[i + 3] = d <= CLEAR ? 0 : d >= SOLID ? 255 : Math.round(((d - CLEAR) / (SOLID - CLEAR)) * 255);
  }
  return { data, width, height, channels };
}

// Flat cream knockout for the dark header: olive on navy is only ~1.6:1.
function knockout({ data, width, height, channels }, [r, g, b]) {
  const copy = Buffer.from(data);
  for (let i = 0; i < copy.length; i += channels) {
    if (copy[i + 3] === 0) continue;
    copy[i] = r; copy[i + 1] = g; copy[i + 2] = b;
  }
  return sharp(copy, { raw: { width, height, channels } });
}

const raw = (o) => sharp(o.data, { raw: { width: o.width, height: o.height, channels: o.channels } });
const trim = async (s) => sharp(await s.png().toBuffer()).trim({ threshold: 1 });

const full = await cutBackground('contexto/Logo definitivo.png');
const mark = await cutBackground('contexto/Logo peque.png');

// Header wordmark, one file per theme.
await (await trim(raw(full))).resize({ height: 220, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(`${OUT}/logo-goxo.png`);
await (await trim(knockout(full, [245, 240, 232]))).resize({ height: 220, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(`${OUT}/logo-goxo-light.png`);

// Favicon set from the circular mark, which stays readable at 16px.
const square = await (await trim(raw(mark))).png().toBuffer();
const contain = { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } };
for (const size of [32, 512]) {
  await sharp(square).resize(size, size, contain).png({ compressionLevel: 9 }).toFile(`${OUT}/favicon-${size}.png`);
}
// Apple touch icons draw their own opaque square, so bake the cream in. sharp
// applies flatten before extend inside one pipeline, which would leave a black
// frame, so the padding is composited in a second pass.
const padded = await sharp(square).resize(160, 160, contain).png().toBuffer();
await sharp({ create: { width: 180, height: 180, channels: 3, background: '#f5f0e8' } })
  .composite([{ input: padded, left: 10, top: 10 }])
  .png({ compressionLevel: 9 }).toFile(`${OUT}/apple-touch-icon.png`);

for (const f of ['logo-goxo.png', 'logo-goxo-light.png', 'favicon-32.png', 'favicon-512.png', 'apple-touch-icon.png']) {
  const { size } = await fs.stat(`${OUT}/${f}`);
  const { width, height } = await sharp(`${OUT}/${f}`).metadata();
  console.log(f, `${width}x${height}`, (size / 1024).toFixed(1) + 'KB');
}
