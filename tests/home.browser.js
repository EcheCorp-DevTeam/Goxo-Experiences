// Run with browser_run_code_unsafe(filename: 'tests/home.browser.js').
async (sharedPage) => {
 const browser=sharedPage.context().browser();
 const context=await browser.newContext(); const page=await context.newPage();
 const assert=(value,message)=>{if(!value)throw new Error(message)};
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const base='http://localhost:4321';
 try {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base+'/');await page.waitForTimeout(1700);
  assert(await page.locator('html').getAttribute('lang')==='en','Default locale');
  assert(await page.locator('main h1').count()===1,'Single H1');
  assert(await page.locator('#home-claim').innerText()==='Private tours in Bilbao and the Basque Country — led by a local.','Official H1');
  assert(await page.locator('#hero-video').getAttribute('src')===null,'Reduced motion fetched video');
  assert(await page.locator('[data-tour-card]').count()===5,'Five experiences');
  assert(await page.locator('.reason-card img').count()===5,'Five illustrated reasons');
  assert(await page.locator('#preguntas-frecuentes details').count()===9,'Nine FAQs');
  assert(await page.locator('[data-open-360],.review-stars,.story-card').count()===0,'Unapproved content');
  const ids=await page.locator('main>section').evaluateAll(nodes=>nodes.map(n=>n.id));
  assert(ids.join(',')==='hero,experiencias,por-que,endika,opiniones,preguntas-frecuentes,plan','Section order');
  const nav=await page.locator('.desktop-nav a').allTextContents();assert(nav.join(',')==='Experiences,About,Reviews,Contact','Navigation');
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow ${width}`);
   assert(await page.locator('.header-contact').isVisible(),`CTA hidden ${width}`);
  }
  await page.setViewportSize({width:1440,height:960});
  await page.locator('main img[loading="lazy"]').evaluateAll(imgs=>imgs.forEach(img=>img.loading='eager'));
  await page.waitForFunction(()=>[...document.querySelectorAll('main img')].every(i=>i.complete));
  await page.screenshot({path:'output/playwright/goxo-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'output/playwright/goxo-mobile.png',fullPage:true});
  await page.locator('.menu-toggle').click();assert(await page.locator('#mobile-nav').isVisible(),'Menu');
  await page.keyboard.press('Escape');
  await page.goto(base+'/');
  await page.locator('[data-tour-card="bilbao-cultura"] .button').click();
  await page.waitForFunction(()=>document.querySelector('#contact-tour').value==='bilbao-cultura');
  await page.locator('#language-toggle').click();
  assert(page.url().includes('/es/contact/?tour=bilbao-cultura'),'Locale lost selection');
  assert(await page.locator('html').getAttribute('lang')==='es','Spanish route');
  await page.locator('input[name="name"]').fill('María');await page.locator('input[name="email"]').fill('maria@example.com');
  await page.locator('input[name="guests"]').fill('2');await page.locator('#contact-form button[type="submit"]').click();
  assert(await page.locator('#contact-result').isVisible(),'Contact preview');
  assert((await page.locator('#contact-whatsapp').getAttribute('href')).includes('wa.me/34644714642'),'WhatsApp destination');
  await page.goto(base+'/experiences/private-bilbao-city-tour-guggenheim/');
  const title=await page.title();await page.waitForTimeout(300);assert(await page.title()===title,'SEO title overwritten');
  assert((await page.locator('.detail-facts').innerText()).includes('4 hours'),'Bilbao duration');
  await page.locator('.gallery-tile').first().click();assert(await page.locator('#media-dialog').isVisible(),'Gallery');await page.keyboard.press('Escape');
  const seed=await page.locator('#goxo-data').textContent();
  await page.evaluate(seed=>{const data=JSON.parse(seed);data.tours[0].short.en='STALE DRAFT';localStorage.setItem('goxo:content:v1',JSON.stringify({version:1,tours:data.tours,sceneOrder:data.media.panoramas.map(p=>p.id)}))},seed);
  await page.goto(base+'/');assert(!(await page.locator('main').innerText()).includes('STALE DRAFT'),'Draft leaked');
  await page.goto(base+'/?preview=true');await page.waitForFunction(()=>document.querySelector('main').textContent.includes('STALE DRAFT'));
  await page.goto(base+'/');await page.locator('#hero-video').evaluate(v=>v.dispatchEvent(new Event('error')));assert(await page.locator('.home-backdrop img').isVisible(),'Poster fallback');
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'200% font overflow');
  await page.goto(base+'/experiencias/pintxos/');assert(page.url().includes('/experiences/private-bilbao-pintxos-tour/'),'Legacy redirect');
  assert(errors.length===0,errors.join('\n'));
  const nojs=await browser.newContext({javaScriptEnabled:false});const staticPage=await nojs.newPage();
  await staticPage.goto(base+'/es/');assert(await staticPage.locator('html').getAttribute('lang')==='es','Static locale');assert(await staticPage.locator('[data-tour-card]').count()===5,'Static tours');await nojs.close();
  return {result:'PASS',checks:['official content','five tours','nine FAQs','320–1440px','visible mobile CTA','contact selection and WhatsApp','locale URLs','draft isolation','gallery','SEO titles','poster fallback','200% text','legacy redirect','without JavaScript'],errors};
 }finally{await context.close()}
}

