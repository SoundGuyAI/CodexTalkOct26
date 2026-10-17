import { test, expect } from '@playwright/test';

const SLIDES = '#stage > .slide[data-slide]';

async function goToSlide(page, index) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.goto(`./#slide-${index}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.evaluate((slideIndex) => {
        const desired = `#slide-${slideIndex}`;
        if (location.hash !== desired) location.hash = desired;
        else window.dispatchEvent(new Event('hashchange'));
      }, index);
      await expect(page.locator(`${SLIDES}.is-active[data-slide="${index}"]`)).toBeVisible({ timeout: 15_000 });
      return;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(400 * (attempt + 1));
    }
  }
  throw lastError;
}

async function slideNumber(page, selector) {
  const index = await page.locator(SLIDES).evaluateAll((slides, sel) => {
    const found = slides.findIndex((slide) => slide.querySelector(sel));
    return found + 1;
  }, selector);
  expect(index).toBeGreaterThan(0);
  return index;
}

test.describe('live talk slides 43, 44, and the close', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('slide 43 cards turn white or stay black without changing slides', async ({ page }) => {
    await goToSlide(page, 1);
    const index = await slideNumber(page, '#part2-everyone-developer-title');
    await goToSlide(page, index);

    const change = page.locator('[data-maker="change"]');
    const ask = page.locator('[data-maker="ask"]');
    const yours = page.locator('[data-maker="yours"]');
    const changeWord = change.locator('.maker-word');
    const askWord = ask.locator('.maker-word');
    const yoursWord = yours.locator('.maker-word');
    await expect(change).toContainText('Create any software');
    await expect(ask).toContainText('Tweak');
    await expect(ask).toContainText('don’t code');
    await expect(yours).toContainText('Make it');
    await expect(yoursWord).toHaveText('Yours');

    const before = await changeWord.boundingBox();
    await change.click();
    await expect(page.locator(`${SLIDES}.is-active`)).toHaveAttribute('data-slide', String(index));
    const changeMotion = await changeWord.evaluate((el) => {
      const anim = el.getAnimations().find((item) => item.animationName === 'maker-word-grow');
      return anim?.effect?.getComputedTiming?.().duration ?? 0;
    });
    expect(changeMotion).toBeGreaterThanOrEqual(1000);
    await page.waitForTimeout(1200);
    await expect.poll(async () => change.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 255, 255)');
    await expect.poll(async () => changeWord.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(9, 9, 11)');
    const grown = await changeWord.boundingBox();
    const changeFont = await changeWord.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(changeFont).toBeGreaterThan(72);
    expect(grown.width).toBeGreaterThan(before.width * 1.4);
    const changeBox = await change.boundingBox();
    expect(grown.x).toBeGreaterThanOrEqual(changeBox.x - 2);
    expect(grown.x + grown.width).toBeLessThanOrEqual(changeBox.x + changeBox.width + 2);

    const askBefore = await askWord.boundingBox();
    await ask.click();
    await expect(page.locator(`${SLIDES}.is-active`)).toHaveAttribute('data-slide', String(index));
    const askMotion = await askWord.evaluate((el) => {
      const anim = el.getAnimations().find((item) => item.animationName === 'maker-word-grow');
      return anim?.effect?.getComputedTiming?.().duration ?? 0;
    });
    expect(askMotion).toBeGreaterThanOrEqual(1000);
    await page.waitForTimeout(1200);
    await expect.poll(async () => ask.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 255, 255)');
    await expect.poll(async () => askWord.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(9, 9, 11)');
    const askGrown = await askWord.boundingBox();
    const askFont = await askWord.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(askFont).toBeGreaterThan(72);
    expect(askGrown.width).toBeGreaterThan(askBefore.width * 1.35);
    const strike = await ask.locator('.maker-strike').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
    expect(strike).toBeGreaterThan(0.85);
    await expect(ask.locator('.maker-code')).toContainText('don’t code');

    const yoursBefore = await yours.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(yoursBefore).not.toBe('rgb(255, 255, 255)');
    const yoursBoxBefore = await yoursWord.boundingBox();
    await yours.click();
    await expect(page.locator(`${SLIDES}.is-active`)).toHaveAttribute('data-slide', String(index));
    const yoursMotion = await yoursWord.evaluate((el) => {
      const anim = el.getAnimations().find((item) => item.animationName === 'maker-word-grow');
      return anim?.effect?.getComputedTiming?.().duration ?? 0;
    });
    expect(yoursMotion).toBeGreaterThanOrEqual(1000);
    await page.waitForTimeout(1200);
    const yoursFont = await yoursWord.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    const yoursGrown = await yoursWord.boundingBox();
    expect(yoursFont).toBeGreaterThan(64);
    expect(yoursGrown.width).toBeGreaterThan(yoursBoxBefore.width * 1.3);
    const yoursPaint = await yours.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        background: `${style.backgroundColor} ${style.backgroundImage}`,
        color: style.color,
      };
    });
    expect(yoursPaint.background).not.toMatch(/rgb\(255,\s*255,\s*255\)/);
    expect(yoursPaint.background).toMatch(/rgb\(21,\s*19,\s*26\)/);
    expect(yoursPaint.color).toBe('rgb(246, 240, 228)');
    await expect.poll(async () => change.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 255, 255)');
    await expect.poll(async () => ask.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 255, 255)');
    await page.screenshot({ path: 'test-results/live-talk/slide-43-cards.png' });
  });

  test('slide 44 chest travel stays visible under reduced motion', async ({ page }) => {
    await goToSlide(page, 1);
    const index = await slideNumber(page, '#part2-hyper-title');
    await goToSlide(page, index);
    const timing = await page.locator('[data-interaction="stuff-chest"]').evaluate((el) => ({
      open: Number(el.dataset.chestOpenMs),
      fly: Number(el.dataset.chestFlyMs),
      close: Number(el.dataset.chestCloseMs),
      lid: getComputedStyle(el.querySelector('.stuff-chest__lid')).transitionDuration,
    }));
    expect(timing.fly).toBeGreaterThanOrEqual(1500);
    expect(timing.fly).toBeLessThanOrEqual(2500);
    expect(timing.open).toBeGreaterThanOrEqual(400);
    expect(timing.close).toBeGreaterThanOrEqual(400);
    expect(parseFloat(timing.lid)).toBeGreaterThanOrEqual(0.45);

    await page.locator('[data-stuff-box]').first().click();
    await expect(page.locator(`${SLIDES}.is-active`)).toHaveAttribute('data-slide', String(index));
    await page.waitForTimeout(800);
    const flying = await page.locator('[data-stuff-box].is-flying').evaluate((el) => {
      const anim = el.getAnimations().find((item) => item.effect?.getComputedTiming?.().duration >= 1000);
      return anim?.effect?.getComputedTiming?.().duration ?? 0;
    });
    expect(flying).toBeGreaterThanOrEqual(1500);
    expect(flying).toBeLessThanOrEqual(2500);
    await expect(page.locator('.stuff-chest.is-open')).toBeVisible();
    await page.screenshot({ path: 'test-results/live-talk/slide-44-chest.png' });
    await page.waitForTimeout(timing.open + timing.fly + timing.close + 800);
    await expect(page.locator('.stuff-chest__pile [data-stuff-box]')).toHaveCount(1);
    await expect(page.locator('.stuff-chest.is-open')).toHaveCount(0);
  });

  test('last slide keeps the chorus going and floats 19 projects', async ({ page }) => {
    await page.goto('./', { waitUntil: 'domcontentloaded' });
    const total = await page.locator(SLIDES).count();
    expect(total).toBeGreaterThan(1);
    await goToSlide(page, total);

    const before = await page.evaluate(() => Number(document.documentElement.dataset.melodyIndex || 0));
    await page.keyboard.press('ArrowRight');
    await expect(page.locator(`${SLIDES}.is-active`)).toHaveAttribute('data-slide', String(total));
    const afterKey = await page.evaluate(() => Number(document.documentElement.dataset.melodyIndex || 0));
    expect(afterKey).toBe(before + 1);

    await page.locator('.nav.next').click();
    await expect(page.locator(`${SLIDES}.is-active`)).toHaveAttribute('data-slide', String(total));
    const afterClick = await page.evaluate(() => Number(document.documentElement.dataset.melodyIndex || 0));
    expect(afterClick).toBe(before + 2);

    await goToSlide(page, total - 1);
    const mid = await page.evaluate(() => Number(document.documentElement.dataset.melodyIndex || 0));
    await page.keyboard.press('ArrowRight');
    await expect(page.locator(`${SLIDES}.is-active`)).toHaveAttribute('data-slide', String(total));
    const midNext = await page.evaluate(() => Number(document.documentElement.dataset.melodyIndex || 0));
    expect(midNext).toBe(mid + 1);
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator(`${SLIDES}.is-active`)).toHaveAttribute('data-slide', String(total - 1));
    const midPrev = await page.evaluate(() => Number(document.documentElement.dataset.melodyIndex || 0));
    expect(midPrev).toBe(midNext + 1);

    await goToSlide(page, total);
    const bubbles = page.locator('.final-bubble');
    await expect(bubbles).toHaveCount(19);
    const names = await bubbles.evaluateAll((els) => els.map((el) => el.dataset.project));
    expect(new Set(names).size).toBe(19);
    const loaded = await bubbles.evaluateAll((els) => els.map((el) => {
      const img = el.querySelector('img');
      return img?.complete && img.naturalWidth > 0;
    }));
    expect(loaded.every(Boolean)).toBe(true);

    const first = await bubbles.evaluateAll((els) => els.map((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y };
    }));
    await page.waitForTimeout(900);
    const second = await bubbles.evaluateAll((els) => els.map((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y };
    }));
    const moved = first.filter((point, i) => Math.hypot(point.x - second[i].x, point.y - second[i].y) > 3).length;
    expect(moved).toBeGreaterThan(12);

    const overlap = await page.evaluate(() => {
      const blocks = [...document.querySelectorAll('#part2-qr-title, .final-answer, .final-url, .final-controls, .qr-placeholder img, .qr-placeholder small')].map((el) => el.getBoundingClientRect());
      return [...document.querySelectorAll('.final-bubble')].filter((el) => {
        const rect = el.getBoundingClientRect();
        const area = rect.width * rect.height;
        return blocks.some((block) => {
          const w = Math.min(rect.right, block.right) - Math.max(rect.left, block.left);
          const h = Math.min(rect.bottom, block.bottom) - Math.max(rect.top, block.top);
          return w > 0 && h > 0 && (w * h) / area > 0.28;
        });
      }).length;
    });
    expect(overlap).toBe(0);

    const dimensions = await page.evaluate(() => ({
      body: document.body.scrollWidth,
      document: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport + 2);
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 2);

    const title = await page.locator('#part2-qr-title').boundingBox();
    const qr = await page.locator('.qr-placeholder').boundingBox();
    expect(title.x).toBeGreaterThanOrEqual(-2);
    expect(title.x + title.width).toBeLessThanOrEqual(1922);
    expect(qr.x).toBeGreaterThan(0);
    expect(qr.x + qr.width).toBeLessThanOrEqual(1922);

    await page.mouse.move(1880, 180);
    await page.waitForTimeout(350);
    const copy = await page.locator('.final-copy').boundingBox();
    expect(copy.x).toBeGreaterThanOrEqual(-2);
    expect(copy.x).toBeLessThan(700);

    const handle = await page.evaluate(() => {
      const bubbles = [...document.querySelectorAll('.final-bubble')];
      for (const el of bubbles) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        if (cx < 80 || cy < 80 || cx > window.innerWidth - 180 || cy > window.innerHeight - 160) continue;
        const top = document.elementFromPoint(cx, cy);
        if (!top || !el.contains(top)) continue;
        el.dataset.dragTest = 'yes';
        return { x: cx, y: cy, left: rect.x, top: rect.y };
      }
      return null;
    });
    expect(handle).toBeTruthy();
    await page.mouse.move(handle.x, handle.y);
    await page.mouse.down();
    await page.mouse.move(handle.x + 150, handle.y + 40, { steps: 12 });
    const dragged = await page.locator('.final-bubble[data-drag-test="yes"]').boundingBox();
    expect(Math.hypot(dragged.x - handle.left, dragged.y - handle.top)).toBeGreaterThan(70);
    await expect(page.locator(`${SLIDES}.is-active`)).toHaveAttribute('data-slide', String(total));
    await page.mouse.up();
    await expect(page.locator(`${SLIDES}.is-active`)).toHaveAttribute('data-slide', String(total));
    await page.screenshot({ path: 'test-results/live-talk/slide-49-bubbles.png' });
  });
});

async function expectNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport + 2);
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 2);
}

test.describe('requested slide edits and sfx toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const patch = (Ctx) => {
        if (!Ctx) return;
        const original = Ctx.prototype.createOscillator;
        Ctx.prototype.createOscillator = function patchedOscillator(...args) {
          const osc = original.apply(this, args);
          const start = osc.start.bind(osc);
          osc.start = (...startArgs) => {
            window.__oscStarts = (window.__oscStarts || 0) + 1;
            return start(...startArgs);
          };
          return osc;
        };
      };
      patch(window.AudioContext);
      patch(window.webkitAudioContext);
    });
  });

  test('cut starts with Improv and Submissions, software starts with Developer', async ({ page }) => {
    await goToSlide(page, 1);
    const cut = await slideNumber(page, '#the-cut-title');
    await goToSlide(page, cut);
    const above = await page.locator('[data-cut-zone="above"] .cut-name').allTextContents();
    expect(above.map((label) => label.trim())).toEqual(['Improv', 'Submissions']);
    const below = await page.locator('[data-cut-zone="below"] .cut-name').allTextContents();
    expect(below.map((label) => label.trim())).not.toContain('Improv');
    expect(below.map((label) => label.trim())).not.toContain('Submissions');
    expect(below.length).toBeGreaterThan(2);
    await expectNoHorizontalOverflow(page);

    const software = await slideNumber(page, '#part2-software-changing-title');
    await goToSlide(page, software);
    await expect(page.locator('[data-past="0"] .software-term__word')).toHaveText('Developer');
    await expect(page.locator('[data-past="1"] .software-term__word')).toHaveText('Prompt');
    await expect(page.locator('[data-past="2"] .software-term__word')).toHaveText('API');
    await expect(page.locator('[data-now="0"] strong')).toHaveText('Everyone');
    await expect(page.locator('[data-now="1"] strong')).toHaveText('Agent');
    await expect(page.locator('[data-now="2"] strong')).toHaveText('AAI');
    const chain = await page.locator('.software-chain--past').boundingBox();
    expect(chain.x).toBeGreaterThanOrEqual(-2);
    expect(chain.x + chain.width).toBeLessThanOrEqual(1922);
    await expectNoHorizontalOverflow(page);

    const everyone = await slideNumber(page, '#part2-everyone-developer-title');
    await goToSlide(page, everyone);
    await expectNoHorizontalOverflow(page);
  });

  test('SFX toggle does not change slides and stays off the chorus mute', async ({ page }) => {
    await goToSlide(page, 1);
    const index = await slideNumber(page, '#part2-everyone-developer-title');
    await goToSlide(page, index);
    const button = page.locator('[data-action="sfx"]');
    await expect(button).toHaveText('SFX off');
    await expect(button).toBeVisible();
    const box = await button.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1922);
    expect(box.y + box.height).toBeLessThanOrEqual(1080);

    const melody = await page.evaluate(() => Number(document.documentElement.dataset.melodyIndex || 0));
    await button.click();
    await expect(page.locator(`${SLIDES}.is-active`)).toHaveAttribute('data-slide', String(index));
    await expect(button).toHaveText('SFX on');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => sessionStorage.getItem('codex-talk-sfx'))).toBe('on');
    const afterToggle = await page.evaluate(() => Number(document.documentElement.dataset.melodyIndex || 0));
    expect(afterToggle).toBe(melody);

    await page.evaluate(() => { window.__oscStarts = 0; });
    await page.locator('[data-maker="change"]').click();
    await expect(page.locator(`${SLIDES}.is-active`)).toHaveAttribute('data-slide', String(index));
    await expect.poll(() => page.evaluate(() => window.__oscStarts || 0)).toBeGreaterThan(0);

    await button.click();
    await expect(button).toHaveText('SFX off');
    expect(await page.evaluate(() => sessionStorage.getItem('codex-talk-sfx'))).toBe('off');
    await page.evaluate(() => { window.__oscStarts = 0; });
    await page.locator('[data-maker="ask"]').click();
    await page.waitForTimeout(80);
    expect(await page.evaluate(() => window.__oscStarts || 0)).toBe(0);

    await page.locator('[data-action="mute"]').click();
    await page.evaluate(() => { window.__oscStarts = 0; });
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => page.evaluate(() => window.__oscStarts || 0)).toBeGreaterThan(0);
    const chorus = await page.evaluate(() => Number(document.documentElement.dataset.melodyIndex || 0));
    expect(chorus).toBe(afterToggle + 1);
  });
});
