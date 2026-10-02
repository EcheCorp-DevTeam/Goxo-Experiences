// Audit the generated HTML, including pages crawled without JavaScript.
// Run after astro build: node scripts/audit-seo.mjs [--production]
import fs from 'node:fs';
import path from 'node:path';
const production=process.argv.includes('--production');
const files=fs.readdirSync('dist',{recursive:true}).filter(f=>String(f).endsWith('.html'));
const rows=[],errors=[];
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
const attr=(tag,key)=>decode(tag?.match(new RegExp(`\\b${key}="([^"]*)"`))?.[1]||'');
for(const file of files){
 const html=fs.readFileSync(path.join('dist',file),'utf8');
 if(/http-equiv="refresh"/i.test(html))continue;
 const url='/'+String(file).replaceAll('\\','/').replace(/index\.html$/,'');
 const tags=html.match(/<(?:meta|link)\b[^>]*>/g)||[];
 const meta=name=>attr(tags.find(t=>attr(t,'name')===name),'content');
 const canonical=attr(tags.find(t=>attr(t,'rel')==='canonical'),'href');
 const title=decode(html.match(/<title>(.*?)<\/title>/s)?.[1]||'');
 const h1=(html.match(/<h1\b/g)||[]).length;
 const schemas=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(m=>{try{return JSON.parse(m[1])}catch{errors.push(url+': invalid JSON-LD');return null}});
 const commercial=/^\/(?:es\/)?(?:$|about\/|contact\/|experiences\/)/.test(url);
 if(!title||!meta('description')||!canonical||h1!==1)errors.push(url+': missing title, description, canonical or single H1');
 if(commercial){
  if(!schemas.some(s=>s?.['@graph']?.some(n=>n['@type']==='WebSite')))errors.push(url+': missing entity graph');
  for(const lang of ['en','es','x-default'])if(!tags.some(t=>attr(t,'hreflang')===lang))errors.push(url+': missing hreflang '+lang);
  if(production&&meta('robots').includes('noindex'))errors.push(url+': production commercial page is noindex');
 }
 if(!production&&!meta('robots').includes('noindex'))errors.push(url+': review page is indexable');
 for(const tag of html.match(/<a\b[^>]*>/g)||[]){
  const href=attr(tag,'href');if(!href.startsWith('/')||href.startsWith('//'))continue;
  const pathname=decodeURIComponent(href.split(/[?#]/)[0]);
  const target=path.join('dist',pathname.endsWith('/')?pathname+'index.html':pathname);
  if(!fs.existsSync(target))errors.push(url+': broken internal link '+href);
 }
 for(const tag of html.match(/<img\b[^>]*>/g)||[]){const src=attr(tag,'src');if(src.startsWith('/')&&!fs.existsSync(path.join('dist',src)))errors.push(url+': missing image '+src)}
 rows.push({url,title,titleLength:title.length,descriptionLength:meta('description').length,h1,robots:meta('robots'),canonical,commercial});
}
const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');
if((sitemap.match(/<loc>/g)||[]).length!==18)errors.push('Sitemap must contain 18 commercial URLs');
if(!sitemap.includes('xmlns:xhtml='))errors.push('Sitemap lacks language alternatives');
const robots=fs.readFileSync('dist/robots.txt','utf8');
if(production)for(const file of ['dist/admin/index.html','dist/experiencias/detalle/index.html'])if(fs.existsSync(file))errors.push('Public release includes editor/draft page: '+file);
if(production?robots.includes('Disallow: /\n'):!robots.includes('Disallow: /\n'))errors.push('robots environment policy mismatch');
fs.mkdirSync('output/seo',{recursive:true});
fs.writeFileSync('output/seo/audit.json',JSON.stringify({mode:production?'production':'review',pages:rows,errors},null,2)+'\n');
console.log(`${rows.length} HTML pages checked; ${rows.filter(r=>r.commercial).length} commercial pages; ${errors.length} errors.`);
for(const error of errors)console.error(error);
if(errors.length)process.exitCode=1;
