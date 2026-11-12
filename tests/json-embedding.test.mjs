import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

for(const file of ['src/components/Seo.astro','src/layouts/Base.astro']){
 test(`${file} escapes script delimiters in embedded JSON`,()=>{
  const source=readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
  assert.ok(source.includes(String.raw`.replace(/</g,'\\u003c')`));
  const value={text:'</script><script>alert(1)</script>',literal:'\\u003c'};
  const embedded=JSON.stringify(value).replace(/</g,'\\u003c');
  assert.ok(!embedded.includes('<'));
  assert.deepEqual(JSON.parse(embedded),value);
 });
}
