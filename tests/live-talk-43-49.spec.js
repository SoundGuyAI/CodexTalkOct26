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
    await yours.click();
    await expect(page.locator(`${SLIDES}.is-active`)).toHaveAttribute('data-slide', String(index));
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
    await page.screenshot({ path: 'test-results/live-talk/slide-49-bubbles.png' });
  });
});
