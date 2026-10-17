import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const TOTAL_SLIDES = 48;
/** Top-level deck slides only — avoids nested false matches and opacity heuristics. */
const SLIDES_SELECTOR = '#stage > .slide[data-slide]';

function slides(page) {
  return page.locator(SLIDES_SELECTOR);
}

async function activeSlideIndex(page) {
  const active = page.locator(`${SLIDES_SELECTOR}.is-active`);
  await expect(active).toHaveCount(1, { timeout: 15_000 });
  const raw = await active.first().getAttribute('data-slide');
  const index = Number(raw);
  if (!Number.isFinite(index) || index < 1) {
    throw new Error(`Active slide missing data-slide (got ${raw})`);
  }
  return index;
}

async function expectActiveSlide(page, expectedIndex) {
  await expect
    .poll(() => activeSlideIndex(page), { timeout: 15_000 })
    .toBe(expectedIndex);
}

async function goToSlide(page, index) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.goto(`./#slide-${index}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      // Hash-only navigations may not reload; force the deck to sync from location.hash.
      await page.evaluate((slideIndex) => {
        const desired = `#slide-${slideIndex}`;
        if (location.hash !== desired) {
          location.hash = desired;
        } else {
          window.dispatchEvent(new Event('hashchange'));
        }
      }, index);
      await expect(page.locator(`${SLIDES_SELECTOR}.is-active[data-slide="${index}"]`)).toBeVisible({ timeout: 15_000 });
      await expectActiveSlide(page, index);
      return;
    } catch (error) {
      lastError = error;
      const message = String(error?.message || error);
      if (!/ERR_CONNECTION_REFUSED|NS_ERROR_CONNECTION_REFUSED|Timeout/i.test(message) || attempt === 2) {
        throw error;
      }
      await page.waitForTimeout(750 * (attempt + 1));
    }
  }
  throw lastError;
}

test.describe('deck verification', () => {
  test('contains 48 slides and keeps the viewport free of horizontal overflow', async ({ page }) => {
    // First suite hit pays Vite cold-compile cost; keep assertion strict, wait longer.
    test.setTimeout(90_000);
    await goToSlide(page, 1);

    await expect(slides(page)).toHaveCount(TOTAL_SLIDES, { timeout: 30_000 });
    await expect(page.locator('[data-testid="countdown-timer"], [aria-label*="countdown" i], .countdown-timer').first()).toBeVisible();

    // Spot-check interactive/later slides for horizontal document overflow.
    for (const index of [1, 14, 15, 35, 40, 43, TOTAL_SLIDES]) {
      await goToSlide(page, index);
      const dimensions = await page.evaluate(() => ({
        body: document.body.scrollWidth,
        document: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      }));
      expect(dimensions.body, `slide ${index} body overflow`).toBeLessThanOrEqual(dimensions.viewport + 2);
      expect(dimensions.document, `slide ${index} document overflow`).toBeLessThanOrEqual(dimensions.viewport + 2);
    }
  });

  test('supports keyboard navigation with arrows and PageUp/PageDown', async ({ page }) => {
    await goToSlide(page, 1);
    await page.keyboard.press('ArrowRight');
    await expectActiveSlide(page, 2);

    await page.keyboard.press('ArrowLeft');
    await expectActiveSlide(page, 1);

    await page.keyboard.press('PageDown');
    await expectActiveSlide(page, 2);

    await page.keyboard.press('PageUp');
    await expectActiveSlide(page, 1);
  });

  test('supports direct hash navigation to any slide', async ({ page }) => {
    await goToSlide(page, 23);
    await expect(page).toHaveURL(/#slide-23$/);
    await expectActiveSlide(page, 23);

    await goToSlide(page, TOTAL_SLIDES);
    await expect(page).toHaveURL(/#slide-48$/);
    await expectActiveSlide(page, TOTAL_SLIDES);
  });

  test('final QR points to the deployed deck', async ({ page }) => {
    await goToSlide(page, TOTAL_SLIDES);
    const qrLink = page.locator('.qr-placeholder');
    await expect(qrLink).toHaveAttribute('href', 'https://soundguyai.github.io/CodexTalkOct26/');
    await expect(qrLink.locator('img[data-qr]')).toHaveAttribute('data-qr-url', 'https://soundguyai.github.io/CodexTalkOct26/', { timeout: 15_000 });
  });

  test('captures one screenshot per slide', async ({ page }) => {
    test.setTimeout(180_000);
    const screenshotDirectory = path.resolve('test-results/slides');
    fs.rmSync(screenshotDirectory, { recursive: true, force: true });
    fs.mkdirSync(screenshotDirectory, { recursive: true });

    for (let index = 1; index <= TOTAL_SLIDES; index += 1) {
      await goToSlide(page, index);
      await page.screenshot({
        path: path.join(screenshotDirectory, `slide-${String(index).padStart(2, '0')}.png`),
        fullPage: false,
      });
    }

    const screenshots = fs.readdirSync(screenshotDirectory)
      .filter((filename) => /^slide-\d{2}\.png$/.test(filename));
    expect(screenshots).toHaveLength(TOTAL_SLIDES);
  });
});
