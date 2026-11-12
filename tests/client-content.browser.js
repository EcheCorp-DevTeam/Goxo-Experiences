// Run with browser_run_code_unsafe(filename: 'tests/client-content.browser.js').
async (sharedPage)=>{
 const context=await sharedPage.context().browser().newContext();
 const page=await context.newPage();
 const assert=(condition,message)=>{if(!condition)throw new Error(message)};
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 let responseStatus=503;const submissions=[];
 await context.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(url.origin!=='http://127.0.0.1:4321')return route.abort();
  if(url.pathname==='/__fixture/contact'){
   submissions.push(request.postDataJSON());
   return route.fulfill({status:responseStatus,contentType:'application/json',body:responseStatus===204?'':'{}'});
  }
  if(request.method()==='POST')return route.abort();
  if(url.pathname==='/src/scripts/app.ts'){
   const response=await route.fetch();const source=await response.text();
   const body=source.replace(/const endpoint = [^;]+;/,'const endpoint = "/__fixture/contact";');
   assert(body.includes('const endpoint = "/__fixture/contact";'),'Contact fixture must replace configuration only');
   return route.fulfill({response,body});
  }
  return route.continue();
 });
 try{
  await page.goto('http://127.0.0.1:4321/contact/?tour=multi-day',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#contact-tour')?.value==='multi-day');
  assert(await page.locator('[name=tourLang]').inputValue()==='en','English default');
  assert((await page.locator('#language-toggle img').getAttribute('src')).endsWith('/es.svg'),'Spanish flag identifies language option');
  assert(await page.locator('#journey-interests').isVisible(),'Multi-day interests');
  await page.locator('[name=name]').fill('Persona de prueba');
  await page.locator('[name=email]').fill('fixture@example.invalid');
  await page.locator('[name=message]').fill('Consulta ficticia; no enviar correo.');
  await page.locator('[name=interests][value=hiking]').check();
  await page.locator('#contact-form button[type=submit]').click();
  await page.waitForFunction(()=>!document.querySelector('#toast').hidden);
  assert(await page.locator('#contact-form').isVisible(),'Failed request preserves form');
  assert(await page.locator('[name=name]').inputValue()==='Persona de prueba','Failed request preserves input');
  assert(await page.locator('#contact-result').isHidden(),'No false confirmation');
  responseStatus=204;
  await page.locator('#contact-form button[type=submit]').click();
  await page.locator('#contact-result').waitFor({state:'visible'});
  assert(await page.locator('#contact-form').isHidden(),'Successful fixture confirms submission');
  assert(submissions.length===2,'Exactly two local dummy submissions');
  assert(submissions[1].tour==='Tailor-Made Multi-Day Experience','Selected experience submitted');
  assert(submissions[1].interests.includes('hiking'),'Interests submitted');
  await page.goto('http://127.0.0.1:4321/es/contact/?tour=rioja',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#contact-tour')?.value==='rioja');
  assert(await page.locator('[name=tourLang]').inputValue()==='es','Spanish default');
  await page.locator('[name=tourLang]').selectOption('en');
  await page.locator('#language-toggle').click();
  await page.waitForURL('**/contact/?tour=rioja');
  assert((await page.locator('#language-toggle img').getAttribute('src')).endsWith('/es.svg'),'Language flag updates after switching');
  assert(await page.locator('[name=tourLang]').inputValue()==='en','Explicit preference preserved');
  await page.goto('http://127.0.0.1:4321/about/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Expand all',exact:true}).click();
  assert(await page.locator('#values-list details[open]').count()===10,'Expand ten complete values');
  await page.getByRole('button',{name:'Collapse all',exact:true}).click();
  assert(await page.locator('#values-list details[open]').count()===0,'Collapse values');
  await page.goto('http://127.0.0.1:4321/experiences/rioja-wine-tour-from-bilbao/',{waitUntil:'domcontentloaded'});
  await page.locator('#detail-gallery button').first().click();
  await page.locator('#media-dialog').waitFor({state:'visible'});
  assert((await page.locator('#lightbox-image').getAttribute('alt')).includes('Wine barrels'),'Gallery descriptive alt');
  await page.keyboard.press('Escape');
  assert(await page.locator('#media-dialog').isHidden(),'Keyboard closes gallery');
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}`);
  }
  assert(errors.length===0,errors.join('\n'));
  return {result:'PASS',checks:['local mock submission failure and success','input preservation','tour and interests payload','locale defaults','explicit language choice','ten values','gallery and Escape','320–1440px'],submissions:submissions.length,externalMessagesSent:0,errors};
 }finally{await context.close()}
}
