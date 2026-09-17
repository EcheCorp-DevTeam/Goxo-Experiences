// Run with browser_run_code's filename argument while the Astro dev server is running.
async (sharedPage) => {
  const context = await sharedPage.context().browser().newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  try {
    await page.goto('http://localhost:4321/');
    await page.locator('#experiencias').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(1600);
    await page.screenshot({ path: 'output/playwright/tours-four-desktop.png' });
    await page.locator('[data-open-360]').first().click();
    await page.waitForFunction(() => document.querySelector('#scene-attribution').textContent.includes('White Cliff Top'), { timeout: 20000 });
    assert(await page.locator('#sphere canvas').count() === 1, 'Viewer canvas missing');
    for (const [index, title] of [[1, 'Golden Gate Hills'], [2, 'Pool'], [0, 'White Cliff Top']]) {
      await page.locator('.scene-button').nth(index).click();
      await page.waitForFunction(title => document.querySelector('#scene-attribution').textContent.includes(title), title);
      assert(await page.locator('#sphere .goxo-marker').count() === 3, 'Markers missing');
    }
    await page.screenshot({ path: 'output/playwright/viewer-360-fixed.png' });
    await page.keyboard.press('Escape');
    assert(await page.locator('#sphere canvas').count() === 0, 'Closing did not release viewer');
    await page.locator('[data-open-360]').first().click();
    await page.waitForSelector('#sphere canvas');
    await page.waitForFunction(() => !document.querySelector('.scene-button').disabled);
    assert(await page.locator('#sphere .goxo-marker').count() === 3, 'Reopened viewer did not load');
    assert(errors.length === 0, errors.join('\n'));
    return { result: 'PASS', checks: ['viewer opens', 'three panoramas', 'markers', 'close', 'reopen', 'no failed resources'] };
  } finally { await context.close(); }
}
