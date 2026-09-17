// Generates the subtle background grain used across the site. A tiny tile of
// independent per-pixel noise tiles seamlessly (no large-scale structure means
// no visible seam), so a raw pixel buffer is simpler and more predictable than
// an SVG feTurbulence filter. Mid-gray with a low alpha ceiling reads as a
// faint paper grain on both the cream and navy backgrounds.
// Run from the project root: node scripts/prepare-texture.mjs
import sharp from 'sharp';

const SIZE = 96;
const GRAY = 122;
const MAX_ALPHA = 16; // out of 255, ~6% at its most visible pixel

const buf = Buffer.alloc(SIZE * SIZE * 4);
for (let i = 0; i < buf.length; i += 4) {
  buf[i] = buf[i + 1] = buf[i + 2] = GRAY;
  buf[i + 3] = Math.floor(Math.random() * MAX_ALPHA);
}

await sharp(buf, { raw: { width: SIZE, height: SIZE, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile('public/media/grain.png');

console.log('public/media/grain.png written', `${SIZE}x${SIZE}`);
