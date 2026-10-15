import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const TOTAL_SLIDES = 47;
const SLIDES_SELECTOR = '[data-slide], section[aria-roledescription="slide"], .slide';

function slides(page) {
  return page.locator(SLIDES_SELECTOR);
}

async function activeSlideIndex(page) {
  const allSlides = slides(page);
  const count = await allSlides.count();

  for (let index = 0; index < count; index += 1) {
    const slide = allSlides.nth(index);
    const active = await slide.evaluate((element) => {
      const style = window.getComputedStyle(element);
      return element.classList.contains('is-active')
        || element.getAttribute('aria-current') === 'true'
        || element.getAttribute('data-active') === 'true'
        || element.getAttribute('aria-hidden') === 'false'
        || (style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) > 0);
    });

    if (active) return index + 1;
  }

  throw new Error('No active slide could be identified. Mark the active slide with .is-active or data-active="true".');
}

async function expectActiveSlide(page, expectedIndex) {
  await expect.poll(() => activeSlideIndex(page)).toBe(expectedIndex);
}

async function goToSlide(page, index) {
  await page.goto(`./#slide-${index}`);
  await expectActiveSlide(page, index);
}

test.describe('deck verification', () => {
  test('contains 47 slides and keeps the viewport free of horizontal overflow', async ({ page }) => {
    await page.goto('./#slide-1');

    await expect(slides(page)).toHaveCount(TOTAL_SLIDES);
    await expect(page.locator('[data-testid="countdown-timer"], [aria-label*="countdown" i], .countdown-timer').first()).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      body: document.body.scrollWidth,
      document: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));

    expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport);
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
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
    await expect(page).toHaveURL(/#slide-47$/);
    await expectActiveSlide(page, TOTAL_SLIDES);
  });

  test('final QR points to the deployed deck', async ({ page }) => {
    await goToSlide(page, TOTAL_SLIDES);
    const qrLink = page.locator('.qr-placeholder');
    await expect(qrLink).toHaveAttribute('href', 'https://soundguyai.github.io/CodexTalkOct26/');
    await expect(qrLink.locator('img[data-qr]')).toHaveAttribute('data-qr-url', 'https://soundguyai.github.io/CodexTalkOct26/');
  });

  test('captures one screenshot per slide', async ({ page }) => {
    test.setTimeout(120_000);
    const screenshotDirectory = path.resolve('test-results/slides');
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
