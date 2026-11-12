import sharp from 'sharp';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,sep} from 'node:path';
import assert from 'node:assert/strict';
const manifest=JSON.parse(await readFile('src/data/client-media.json','utf8'));
const root=resolve('GOXO Fotos editadas');
assert.equal(new Set(manifest.map(item=>item.file)).size,manifest.length);
for(const item of manifest){
 const source=resolve(root,item.source);
 assert.ok(source.startsWith(root+sep)&&!item.source.split('/').includes('reserva'));
 assert.match(item.file,/^[a-z0-9-]+\.webp$/);
 assert.ok(item.alt.en&&item.alt.es);
 for(const width of [640,960,1600,1920]){
  const directory=width===1920?'public/media/client':`public/media/client/${width}`;
  await mkdir(directory,{recursive:true});
  await sharp(source).rotate().resize({width,withoutEnlargement:true}).webp({quality:80,effort:5,smartSubsample:true}).toFile(`${directory}/${item.file}`);
 }
}
console.log(`Prepared ${manifest.length} photographs in four responsive sizes; originals unchanged.`);
