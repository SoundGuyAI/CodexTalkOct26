import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT || 4173);
const host = '127.0.0.1';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://${host}:${port}`;

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  timeout: 120_000,
  reporter: process.env.CI ? [['html', { outputFolder: 'test-results/report', open: 'never' }], ['line']] : 'list',
  use: {
    baseURL,
    // Trace/video artifacts were flaking on Windows teardown (ENOENT during context.close).
    trace: 'off',
    video: 'off',
    screenshot: 'only-on-failure',
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `pnpm exec vite build && pnpm exec vite preview --host ${host} --port ${port} --strictPort`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 180 * 1000,
      },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        screen: { width: 1920, height: 1080 },
      },
    },
  ],
});
