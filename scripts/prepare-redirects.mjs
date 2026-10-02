// Generate a reviewable 301 mapping from Astro's existing legacy redirects.
import fs from 'node:fs';
import path from 'node:path';
const mappings=[];
for(const file of fs.readdirSync('dist',{recursive:true}).filter(f=>String(f).endsWith('.html'))){
 const html=fs.readFileSync(path.join('dist',file),'utf8');
 const destination=html.match(/http-equiv="refresh"[^>]*content="[^"]*url=([^"]+)"/i)?.[1];
 if(!destination)continue;
 mappings.push({from:'/'+String(file).replaceAll('\\','/').replace(/index\.html$/,''),to:destination.replace(/&amp;/g,'&')});
}
fs.mkdirSync('output/seo',{recursive:true});
fs.writeFileSync('output/seo/redirects.csv','source,destination,status,preserve_query\n'+mappings.map(m=>`${m.from},${m.to},301,true`).join('\n')+'\n');
fs.writeFileSync('output/seo/_redirects',mappings.map(m=>`${m.from} ${m.to} 301`).join('\n')+'\n');
console.log(`${mappings.length} legacy HTTP 301 mappings prepared. Apply using the confirmed hosting provider.`);
