import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {renderBlog,normalizeBlog} from '../src/data/blog-render.mjs';
import {pathToFileURL} from 'node:url';
export function validateCMS({tours,settings,presentation,articles}){
 const ids=new Set(),slugs=new Set();
 const bilingual=value=>value&&typeof value.es==='string'&&typeof value.en==='string';
 for(const tour of tours.tours){
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tour.id)||ids.has(tour.id))throw new Error('Tour ID missing, invalid or duplicated');
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tour.slug)||slugs.has(tour.slug))throw new Error('Tour slug missing, invalid or duplicated');
  ids.add(tour.id);slugs.add(tour.slug);
  for(const key of ['name','short','description','catalogDescription','story','location','duration','guests','seoTitle','seoDescription','imageAlt'])if(!bilingual(tour[key]))throw new Error(`Missing bilingual field: ${tour.id}.${key}`);
  if(tour.stops.length!==tour.stopCopy.length)throw new Error(`Each stop needs a description: ${tour.id}`);
 }
 const sectionIds=new Set();
 for(const section of settings.homeSections){if(sectionIds.has(section.id))throw new Error('Duplicate home section');sectionIds.add(section.id)}
 if(!/^\d{8,15}$/.test(settings.whatsapp))throw new Error('Invalid WhatsApp number');
 for(const item of settings.navigation)if(!/^\/(?!\/)/.test(item.href))throw new Error('Navigation must use internal paths');
 for(const section of [presentation.hero,presentation.host]){
  if(section.videoUrl&&!/^https:\/\//.test(section.videoUrl))throw new Error('External video must use HTTPS');
  if(section.video&&!/^\/media\/.+\.(mp4|webm|mov)$/i.test(section.video))throw new Error('Invalid local video');
 }
 const articleSlugs=new Set();
 for(const post of articles.posts){
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)||articleSlugs.has(post.slug))throw new Error('Invalid or duplicated article URL');articleSlugs.add(post.slug);
  for(const key of ['title','intro','category','body'])if(!bilingual(post[key]))throw new Error(`Missing bilingual article field: ${post.slug}.${key}`);
  for(const lang of ['es','en']){
   if(post.published&&(!post.title[lang].trim()||!post.body[lang].trim()))throw new Error(`Published article needs translated title and content: ${post.slug}.${lang}`);
   renderBlog(post.body[lang]);
  }
 }
}
export function readCMS(){
 const content=Object.fromEntries(['tours','settings','presentation'].map(name=>[name,JSON.parse(readFileSync(`src/content/site/${name}.json`,'utf8'))]));
 content.articles={posts:readdirSync('src/content/articles').filter(file=>file.endsWith('.json')).map(file=>normalizeBlog({...JSON.parse(readFileSync(`src/content/articles/${file}`,'utf8')),slug:file.slice(0,-5)}))};
 return content;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 validateCMS(readCMS());
 const check=value=>{if(Array.isArray(value))value.forEach(check);else if(value&&typeof value==='object')Object.values(value).forEach(check);else if(typeof value==='string'&&value.startsWith('/media/')&&!existsSync('public'+value))throw new Error(`Missing CMS media: ${value}`)};
 for(const name of ['tours','presentation','settings','way','media'])check(JSON.parse(readFileSync(`src/content/site/${name}.json`,'utf8')));
 check(readCMS().articles);
 console.log('CMS content, URLs, translations and media validated.');
}
