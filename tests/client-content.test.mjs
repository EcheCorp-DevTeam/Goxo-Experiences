import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {readCMS,validateCMS} from '../scripts/validate-cms.mjs';

const json=path=>JSON.parse(readFileSync(new URL(`../${path}`,import.meta.url),'utf8'));
// This fixture is extracted from the client PDF, independently of the CMS data.
const approved=json('tests/fixtures/client-copy-en.json').content;
const content=readCMS();
const normalize=value=>value.replace(/\s+/g,' ').trim();
const htmlText=html=>normalize(html.replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/<style\b[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&'));

for(const tour of content.tours.tours){
 test(`${tour.id}: complete approved English copy and complete Spanish translation`,()=>{
  const source=approved[tour.id];
  for(const key of ['seoTitle','seoDescription','name','catalogDescription','story','itineraryTitle','sectionsTitle','faqsTitle']){
   assert.equal(tour[key].en,source[key],key);
   assert.ok(tour[key].es.trim(),`${key}: Spanish`);
   assert.equal(tour[key].en.split(/\n\s*\n/).length,tour[key].es.split(/\n\s*\n/).length,`${key}: paragraph count`);
  }
  assert.deepEqual(tour.glance.map(fact=>`${fact.label.en} ${fact.value.en}`),source.glance.map(fact=>fact.value));
  assert.deepEqual(tour.includes.map(item=>item.en),source.includes);
  assert.deepEqual(tour.sections.map(item=>item.text.en),source.sections);
  assert.deepEqual(tour.faqs.map(item=>({question:item.question.en,answer:item.answer.en})),source.faqs);
  assert.deepEqual([tour.finalCta.title.en,tour.finalCta.body.en],source.finalCta);
  const itinerary=tour.stops.flatMap((stop,i)=>[stop.en,...tour.stopCopy[i].en.split(/\n\s*\n/)]);
  if(tour.scheduleNote.en)itinerary.push(tour.scheduleNote.en);
  assert.deepEqual(itinerary,source.itinerary);
  const translated=[...tour.includes,...tour.sections.map(item=>item.text),...tour.faqs.flatMap(item=>[item.question,item.answer]),...tour.glance.flatMap(item=>[item.label,item.value]),...tour.stops,...tour.stopCopy,tour.finalCta.title,tour.finalCta.body];
  assert.ok(translated.every(item=>item.en.trim()&&item.es.trim()));
 });
 test(`${tour.id}: every approved body paragraph appears in the built page in both languages`,()=>{
  for(const language of ['en','es']){
   const path=`dist/${language==='es'?'es/':''}experiences/${tour.slug}/index.html`;
   const rendered=htmlText(readFileSync(new URL(`../${path}`,import.meta.url),'utf8'));
   const copy=[tour.name,tour.catalogDescription,tour.story,...tour.stops,...tour.stopCopy,tour.scheduleNote,...tour.includes,...tour.sections.map(item=>item.text),...tour.faqs.flatMap(item=>[item.question,item.answer]),tour.finalCta.title,tour.finalCta.body];
   for(const item of copy)for(const paragraph of item[language].split(/\n\s*\n/))if(paragraph)assert.ok(rendered.includes(normalize(paragraph)),`${path}: missing ${paragraph.slice(0,90)}`);
  }
 });
}

test('Home, About and general FAQs preserve the full client copy',()=>{
 const about=content.about,source=approved.site,way=json('src/content/site/way.json'),faq=json('src/content/site/faq.json');
 assert.deepEqual(about.aboutIntro.map(p=>p.en),source.aboutIntro);
 assert.deepEqual(about.aboutCompany.map(p=>p.en),source.aboutCompany);
 assert.deepEqual(about.hostStory.map(p=>p.en),source.hostStory);
 assert.equal(about.values.length,10);
 assert.deepEqual(about.values.map(v=>({title:v.title.en,body:v.body.en})),source.values);
 assert.deepEqual(faq.faqs.map(f=>({question:f.question.en,answer:f.answer.en})),source.faqs);
 assert.deepEqual(way.reasons.map(r=>({title:r.title.en,body:r.body.en})),source.reasons);
 const page=htmlText(readFileSync(new URL('../dist/about/index.html',import.meta.url),'utf8'));
 for(const value of [...about.aboutIntro,...about.aboutCompany,...about.values.flatMap(v=>[v.title,v.body])])assert.ok(page.includes(normalize(value.en)),value.en.slice(0,80));
});

test('all selected unique photographs have bilingual alt text and real WebP variants',()=>{
 const photos=json('src/data/client-media.json');
 assert.equal(photos.length,43);
 assert.equal(new Set(photos.map(p=>p.file)).size,43);
 for(const photo of photos){
  assert.ok(photo.alt.en&&photo.alt.es);
  assert.ok(!photo.source.includes('/reserva/'));
  for(const prefix of ['', '640/', '960/', '1600/']){
   const file=new URL(`../public/media/client/${prefix}${photo.file}`,import.meta.url);
   assert.ok(existsSync(file));
   const bytes=readFileSync(file);
   assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
  }
 }
 assert.ok(!photos.some(p=>p.file==='walking-leafy-trail.webp'));
});

test('incomplete content and unknown related tours cannot be published',()=>{
 const missing=structuredClone(content);delete missing.tours.tours[0].faqs[0].answer.es;assert.throws(()=>validateCMS(missing),/questions/);
 const gallery=structuredClone(content);gallery.tours.tours[0].galleryAlts.pop();assert.throws(()=>validateCMS(gallery),/gallery/);
 const related=structuredClone(content);related.verifiedReviews.reviews=[{tourIds:['missing-tour']}];assert.throws(()=>validateCMS(related),/review experience/);
});

test('journal is permanently linked, empty selection is hidden and contact defaults match locale',()=>{
 for(const language of ['en','es']){
  const prefix=`dist/${language==='es'?'es/':''}`;
  const home=readFileSync(new URL(`../${prefix}index.html`,import.meta.url),'utf8');
  assert.ok(home.includes(`href="/${language==='es'?'es/':''}journal/"`));
  assert.ok(!home.includes('journal-selection'));
  assert.ok(!home.includes('class="footer-nav"'));
  assert.ok(home.includes(`/media/flags/${language==='en'?'es':'en'}.svg`));
  const contact=readFileSync(new URL(`../${prefix}contact/index.html`,import.meta.url),'utf8');
  assert.match(contact,new RegExp(`<option[^>]*value="${language}"[^>]*selected`));
 }
});
