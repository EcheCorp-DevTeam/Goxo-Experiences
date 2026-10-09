import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readCMS,validateCMS} from '../scripts/validate-cms.mjs';
import {itemLabel} from '../keystatic.config.ts';

test('CMS array labels render strings for uploaded images and nested fields',()=>{
  const image={data:new Uint8Array(),filename:'coast.webp',extension:'webp'};
  assert.equal(itemLabel({value:image}),'coast.webp');
  assert.equal(itemLabel({fields:{image:{value:image}}}),'coast.webp');
  assert.equal(itemLabel({fields:{short:{fields:{en:{value:'Basque Coast'}}}}}),'Basque Coast');
  assert.equal(itemLabel({value:{}}),'Elemento');
  assert.equal(itemLabel({value:'/media/coast.webp'}),'/media/coast.webp');
});
test('migrated CMS content is valid',()=>assert.doesNotThrow(()=>validateCMS(readCMS())));
test('duplicate tour URLs cannot be published',()=>{const content=readCMS();content.tours.tours.push(structuredClone(content.tours.tours[0]));assert.throws(()=>validateCMS(content))});
test('unsafe video URLs and external navigation are rejected',()=>{const content=readCMS();content.presentation.hero.videoUrl='javascript:alert(1)';assert.throws(()=>validateCMS(content));content.presentation.hero.videoUrl='';content.settings.navigation[0].href='//example.com';assert.throws(()=>validateCMS(content))});
test('missing translations and incomplete itineraries fail validation',()=>{const content=readCMS();delete content.tours.tours[0].seoTitle.en;assert.throws(()=>validateCMS(content));const next=readCMS();next.tours.tours[0].stopCopy=[];assert.throws(()=>validateCMS(next))});
