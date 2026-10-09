import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderBlog,blogStats} from '../src/data/blog-render.mjs';
import {readCMS,validateCMS} from '../scripts/validate-cms.mjs';
test('article formatting renders semantic HTML for publishing and preview',()=>{
 const html=renderBlog('## Basque coast\n\nA **private** experience with *Endika*.\n\n- Coast\n- Food\n\n> A local perspective\n\n[Read more](/experiences/)');
 for(const expected of ['<h2>','<strong>private</strong>','<em>Endika</em>','<ul>','<blockquote>','href="/experiences/"'])assert.ok(html.includes(expected),expected);
});
test('article renderer does not execute HTML or unsafe links and images',()=>{
 const html=renderBlog('<script>alert(1)</script>\n\n[Unsafe](javascript:alert)\n\n![unsafe](javascript:alert)\n\n![svg](/media/unsafe.svg)');
 assert.ok(!html.includes('<script>'));assert.ok(!html.includes('href="javascript:'));assert.ok(!html.includes('src="javascript:'));assert.ok(!html.includes('src="/media/unsafe.svg"'));
});
test('headings stay below the page H1 and reading statistics ignore formatting',()=>{
 assert.ok(renderBlog('# Nested title').includes('<h2>'));
 assert.deepEqual(blogStats('## Heading\n\nTwo **more** words.'),{words:4,minutes:1,headings:['Heading']});
});
test('drafts are editable while published articles require both languages',()=>{
 const content=readCMS();content.articles.posts.push({slug:'draft',published:false,title:{es:'',en:''},intro:{es:'',en:''},category:{es:'',en:''},body:{es:'',en:''}});
 assert.doesNotThrow(()=>validateCMS(content));content.articles.posts.at(-1).published=true;assert.throws(()=>validateCMS(content));
});
