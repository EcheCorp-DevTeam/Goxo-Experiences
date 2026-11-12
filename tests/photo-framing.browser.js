// Run with browser_run_code_unsafe(filename: 'tests/photo-framing.browser.js').
async(sharedPage)=>{
 const context=await sharedPage.context().browser().newContext();
 const page=await context.newPage();
 const assert=(condition,message)=>{if(!condition)throw new Error(message)};
 const failures=[],checks=[],errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.emulateMedia({reducedMotion:'reduce'});
 const base='http://127.0.0.1:4321';
 try{
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  const tours=await page.locator('#goxo-data').evaluate(node=>JSON.parse(node.textContent).tours);
  const paths=['/','/experiences/','/about/','/contact/',...tours.map(t=>`/experiences/${t.slug}/`)];
  const coverage={};
  for(const width of [1440,390]){
   const seen=new Set();
   await page.setViewportSize({width,height:900});
   for(const path of paths){
    await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:15000});
    const images=page.locator('main img');
    await images.evaluateAll(async nodes=>{
     nodes.forEach(image=>image.loading='eager');
     await Promise.all(nodes.map(image=>image.decode().catch(()=>{})));
    });
    for(const image of await images.all()){
     const info=await image.evaluate(img=>{
      if(img.closest('.home-backdrop'))return null; // Decorative video poster, not content photography.
      const box=img.getBoundingClientRect(),css=getComputedStyle(img);
      const ratio=img.naturalWidth/img.naturalHeight,frame=box.width/box.height;
      const cover=img.parentElement.classList.contains('detail-hero');
      if(cover&&Math.abs(box.width-img.parentElement.clientWidth)>1)throw new Error('Tour cover must fill banner width');
      const cropped=!cover&&css.objectFit==='cover'&&Math.abs(ratio-frame)>.02;
      const distorted=css.objectFit==='fill'&&Math.abs(ratio-frame)>.02;
      const matrix=new DOMMatrix(css.transform);
      return {file:new URL(img.src).pathname,fit:css.objectFit,cover,cropped,distorted,loaded:img.naturalWidth>0,width:box.width,height:box.height,zoomed:matrix.a>1.001||matrix.d>1.001};
     });
     if(!info)continue;
     checks.push({viewport:width,path,...info});
     if(!info.loaded||info.cropped||info.distorted||info.zoomed)failures.push({viewport:width,path,...info});
     seen.add(info.file);
    }
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow: ${path} at ${width}`);
   }
   const delivered=[...seen].filter(file=>file.startsWith('/media/client/'));
   assert(delivered.length===43,`Each delivered photograph must be checked: ${delivered.length}/43 at ${width}`);
   coverage[width]={uniqueClientPhotos:delivered.length,includesHomePortrait:seen.has('/media/cms/presentation/host-poster.webp')};
  }
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  await page.locator('.tour-card-photo').first().hover();
  assert(await page.locator('.tour-magnifier').count()===0,'Hover must not obscure the full photograph');
  const transform=await page.locator('.tour-card-photo img').first().evaluate(img=>{const matrix=new DOMMatrix(getComputedStyle(img).transform);return {x:matrix.a,y:matrix.d}});
  assert(transform.x<=1.001&&transform.y<=1.001,'Hover zoom crops the image');
  assert(failures.length===0,JSON.stringify(failures));
  assert(errors.length===0,errors.join('\n'));
  return {result:'PASS',placementsChecked:checks.length,coverage,failures,errors};
 }finally{await context.close()}
}
