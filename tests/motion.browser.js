async (sharedPage)=>{
 const context=await sharedPage.context().browser().newContext();const page=await context.newPage();
 const assert=(value,message)=>{if(!value)throw new Error(message)};const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://localhost:4321/');await page.waitForFunction(()=>!document.querySelector('#hero-video').paused);
  await page.locator('#hero-motion').click();await page.waitForFunction(()=>document.querySelector('#hero-video').paused);
  await page.locator('#hero-motion').click();await page.waitForFunction(()=>!document.querySelector('#hero-video').paused);
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('#hero-video').paused);
  assert(await page.locator('.tour-magnifier').count()===0,'Experimental card hover returned');
  await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true}));
  await page.emulateMedia({reducedMotion:'no-preference'});await page.reload();await page.waitForTimeout(1700);
  assert(await page.locator('#hero-video').getAttribute('src')===null,'Save-data downloaded video');
  await page.route('http://localhost:4321/',async route=>{const response=await route.fetch();const html=(await response.text()).replace('</main>','<video id="host-video" data-src="/media/gaztelugatxe.mp4?host-test" controls playsinline preload="none" hidden></video><button id="host-play">Play fixture</button></main>');await route.fulfill({response,body:html})});
  const requests=[];page.on('request',request=>{if(request.url().includes('host-test'))requests.push(request.url())});await page.reload();
  assert(requests.length===0,'Host video loaded before click');await page.locator('#host-play').click();await page.waitForFunction(()=>!document.querySelector('#host-video').paused);
  await page.locator('#host-video').evaluate(v=>v.dispatchEvent(new Event('error')));
  assert(await page.locator('#host-play').isVisible(),'No retry');assert(await page.locator('#host-video-error').isVisible(),'No video error feedback');
  assert(errors.length===0,errors.join('\n'));return {result:'PASS',checks:['playback','pause','reduced motion','save-data','host click-to-load','host error recovery']};
 }finally{await context.close()}
}
