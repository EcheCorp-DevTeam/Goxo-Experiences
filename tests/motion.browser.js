// Run with browser_run_code's filename argument against the local Astro server.
async (sharedPage) => {
  const isolated = await sharedPage.context().browser().newContext();
  const page = await isolated.newPage();
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const zoomScale = () => page.locator('.hero-image').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).a);
  try {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto('http://localhost:4321/');
    await page.mouse.move(700, 40);
    await page.waitForTimeout(1500);
    assert(await zoomScale() === 1, 'Zoom should be inactive outside hero');
    await page.mouse.move(1000, 350);
    await page.waitForFunction(() => new DOMMatrix(getComputedStyle(document.querySelector('.hero-image')).transform).a > 1.075);
    await page.mouse.move(700, 40);
    await page.waitForTimeout(1500);
    assert(await zoomScale() === 1, 'Zoom did not return after pointer left');
    assert(await page.locator('#atmosphere').count() === 0, 'Obsolete hero canvas');
    await page.locator('[data-territory="rioja"]').click();
    await page.locator('[data-territory="pintxos"]').click();
    await page.waitForFunction(() => document.querySelector('#hero-landscape').getAttribute('src').includes('pintxos'));
    await page.locator('#hero-motion').click();
    assert(await zoomScale() === 1, 'Pause did not stop zoom');
    assert(await page.locator('#hero-landscape').evaluate(el => getComputedStyle(el).opacity === '1'), 'Pause left photo faded');
    await page.locator('#hero-motion').click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'off');
    assert(await zoomScale() === 1, 'Reduced motion did not stop zoom');
    assert(await page.locator('.hero-image').evaluate(el => getComputedStyle(el).transform === 'none'), 'Reduced motion is not static');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'on');
    await page.locator('#tours-grid').scrollIntoViewIfNeeded();
    const cards = await page.locator('[data-tour-card]:visible').evaluateAll(elements => elements.map(el => {
      const card = el.getBoundingClientRect();
      const photo = el.querySelector('.tour-card-photo').getBoundingClientRect();
      return { top: card.top, height: card.height, photoHeight: photo.height };
    }));
    assert(cards.length === 4, 'Expected all four desktop tours');
    assert(cards.every(card => Math.abs(card.top - cards[0].top) < 1), 'Desktop tours are not in one row');
    assert(cards.every(card => Math.abs(card.height - cards[0].height) < 1 && Math.abs(card.photoHeight - cards[0].photoHeight) < 1), 'Tour heights differ');
    await page.locator('.tour-card-photo').first().hover();
    await page.waitForFunction(() => document.querySelector('.tour-card-photo[data-hover]'));
    for (let index = 0; index < 4; index++) {
      const photo = page.locator('.tour-card-photo').nth(index);
      await photo.hover({ position: { x: 100, y: 120 } });
      await page.waitForFunction(index => document.querySelectorAll('.tour-card-photo')[index].querySelector('.tour-magnifier'), index);
      assert(await page.locator('.tour-magnifier').count() === 1, 'More than one magnifier');
      const before = await photo.locator('.tour-magnifier').evaluate(el => ({ left: parseFloat(el.style.left), background: parseFloat(el.style.backgroundPositionX) }));
      await photo.hover({ position: { x: 130, y: 120 } });
      await page.waitForFunction(index => parseFloat(document.querySelectorAll('.tour-card-photo')[index].querySelector('.tour-magnifier').style.left) > 125, index);
      const after = await photo.locator('.tour-magnifier').evaluate(el => ({ left: parseFloat(el.style.left), background: parseFloat(el.style.backgroundPositionX) }));
      assert(Math.abs((after.background - before.background) + 2 * (after.left - before.left)) < 1, 'Lens does not track image at 2x');
    }
    await page.locator('[data-filter="all"]').hover();
    await page.waitForFunction(() => !document.querySelector('.tour-magnifier'));
    await page.locator('[data-filter="vino"]').click();
    assert(await page.locator('[data-tour-card]:visible').count() === 1, 'Filter broke');
    await page.locator('[data-filter="all"]').click();
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile overflow');
    assert(errors.length === 0, errors.join('\n'));
    return { result: 'PASS', checks: ['hover zoom', 'pointer leave reset', 'rapid territories', 'pause during fade', 'reduced motion', 'cards', 'filters', 'mobile layout'], errors };
  } finally { await isolated.close(); }
}
