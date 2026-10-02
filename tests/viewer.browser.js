// The public 360 demo has been retired. Keep a regression check for its entry points.
async (page)=>{
 await page.goto('http://localhost:4321/');
 if(await page.locator('[data-open-360],#immersive-dialog').count())throw new Error('360 demo remains public');
 await page.goto('http://localhost:4321/experiences/gaztelugatxe-mundaka-gernika-tour/');
 if(await page.locator('[data-open-360],#immersive-dialog').count())throw new Error('Tour exposes 360 demo');
 return {result:'PASS',checks:['no public 360 entry points']};
}
