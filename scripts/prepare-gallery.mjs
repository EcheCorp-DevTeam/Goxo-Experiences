import sharp from 'sharp';
import fs from 'node:fs/promises';
const src='/workspace/scratch/e19ca4bde686/goxo-media-candidates';
const manifest=JSON.parse(await fs.readFile(`${src}/gallery-manifest.json`,'utf8'));
const media=JSON.parse(await fs.readFile('src/data/media.json','utf8'));
media.galleries={};media.labels={};
const ids={costa:'costa-vasca',rioja:'rioja',pintxos:'pintxos',cultura:'bilbao-cultura'};
for(const asset of manifest.assets){
 const file=asset.file.replace('.jpg','.webp');
 await sharp(asset.path).rotate().resize({width:1600,withoutEnlargement:true}).webp({quality:83}).toFile(`public/media/${file}`);
 const url=`/media/${file}`;media.labels[url]=asset.label;
 for(const id of asset.tourIds){(media.galleries[ids[id]]??=[]).push(url)}
 media.credits.push({title:asset.label,author:asset.author,license:asset.license,licenseUrl:asset.licenseUrl,source:asset.source,file});
}
await fs.writeFile('src/data/media.json',JSON.stringify(media,null,2));
console.log('Added seven gallery photographs with credits.');
