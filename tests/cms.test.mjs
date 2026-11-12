import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readCMS,validateCMS} from '../scripts/validate-cms.mjs';
import {itemLabel} from '../keystatic.config.ts';
import config from '../keystatic.config.ts';
import {readFileSync,existsSync} from 'node:fs';

test('CMS array labels render strings for uploaded images and nested fields',()=>{
  const image={data:new Uint8Array(),filename:'coast.webp',extension:'webp'};
  assert.equal(itemLabel({value:image}),'coast.webp');
  assert.equal(itemLabel({fields:{image:{value:image}}}),'coast.webp');
  assert.equal(itemLabel({fields:{short:{fields:{en:{value:'Basque Coast'}}}}}),'Basque Coast');
  assert.equal(itemLabel({value:{}}),'Elemento');
  assert.equal(itemLabel({value:'/media/coast.webp'}),'/media/coast.webp');
});
test('migrated CMS content is valid',()=>assert.doesNotThrow(()=>validateCMS(readCMS())));

test('CMS asset schemas resolve every imported image without losing it on save',()=>{
 const visit=(schema,value)=>{
  if(schema.kind==='array'){for(const item of value||[])visit(schema.element,item)}
  else if(schema.kind==='object'){for(const [key,field] of Object.entries(schema.fields))visit(field,value?.[key])}
  else if(schema.formKind==='asset'&&typeof value==='string'&&value.startsWith('/media/client/')){
   const filename=schema.filename(value,{slug:undefined});
   const path=`${schema.directory}/${filename}`;
   assert.ok(existsSync(path),`Missing editable image: ${path}`);
   const parsed=schema.parse(value,{asset:new Uint8Array(readFileSync(path)),slug:undefined});
   assert.equal(schema.serialize(parsed,{slug:undefined}).value,value);
  }
 };
 for(const name of ['tours','way','about','media']){
  const data=JSON.parse(readFileSync(`src/content/site/${name}.json`,'utf8'));
  for(const [key,schema] of Object.entries(config.singletons[name].schema))visit(schema,data[key]);
 }
});
test('duplicate tour URLs cannot be published',()=>{const content=readCMS();content.tours.tours.push(structuredClone(content.tours.tours[0]));assert.throws(()=>validateCMS(content))});
test('unsafe video URLs and external navigation are rejected',()=>{const content=readCMS();content.presentation.hero.videoUrl='javascript:alert(1)';assert.throws(()=>validateCMS(content));content.presentation.hero.videoUrl='';content.settings.navigation[0].href='//example.com';assert.throws(()=>validateCMS(content))});
test('missing translations and incomplete itineraries fail validation',()=>{const content=readCMS();delete content.tours.tours[0].seoTitle.en;assert.throws(()=>validateCMS(content));const next=readCMS();next.tours.tours[0].stopCopy=[];assert.throws(()=>validateCMS(next))});
