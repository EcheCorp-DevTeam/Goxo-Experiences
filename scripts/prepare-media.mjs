import sharp from 'sharp';
import fs from 'node:fs/promises';
const src='/workspace/scratch/e19ca4bde686/goxo-media-candidates';
await fs.mkdir('public/media',{recursive:true}); await fs.mkdir('src/data',{recursive:true});
const names={coast:'gaztelugatxe',bilbao:'bilbao',pintxos:'pintxos',rioja:'rioja'};
const media={};
for(const [key,name] of Object.entries(names)){
 await sharp(`${src}/${name}.jpg`).rotate().resize({width:1920,withoutEnlargement:true}).webp({quality:84}).toFile(`public/media/${name}.webp`);
 await sharp(`${src}/${name}.jpg`).rotate().resize({width:900,withoutEnlargement:true}).webp({quality:82}).toFile(`public/media/${name}-small.webp`);
 media[key]=`/media/${name}.webp`;
}
const manifests=JSON.parse(await fs.readFile(`${src}/manifest.json`,'utf8'));
media.panoramas=[];
for(const [i,name] of ['pano-white-cliff','pano-golden-gate','pano-pool'].entries()){
 await sharp(`${src}/${name}.jpg`).resize(4096,2048).jpeg({quality:85}).toFile(`public/media/${name}.jpg`);
 await sharp(`${src}/${name}.jpg`).resize(1000,500).webp({quality:75}).toFile(`public/media/${name}-preview.webp`);
 const m=manifests.assets.find(a=>a.file===`${name}.jpg`);
 media.panoramas.push({id:name,url:`/media/${name}.jpg`,preview:`/media/${name}-preview.webp`,title:m.title,author:m.author,source:m.source,label:{es:['El horizonte','La montaña','El jardín'][i],en:['The horizon','The mountain','The garden'][i]}});
}
await fs.copyFile(`${src}/gaztelugatxe-video.mp4`,'public/media/gaztelugatxe.mp4');
await fs.copyFile('/workspace/scratch/e19ca4bde686/upload/Logo peque.png','public/media/logo-peque.png');
await fs.copyFile('/workspace/scratch/e19ca4bde686/upload/Logo definitivo.png','public/media/logo.png');
media.video='/media/gaztelugatxe.mp4';
media.credits=manifests.assets.map(({title,author,license,licenseUrl,source,notes,file})=>({title,author,license,licenseUrl,source,notes,file}));
await fs.writeFile('src/data/media.json',JSON.stringify(media,null,2));
await fs.copyFile(`${src}/manifest.json`,'public/media/sources.json');
console.log('Prepared photographs, three panoramas, video and branding.');
