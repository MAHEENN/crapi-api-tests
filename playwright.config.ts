import { defineConfig } from '@playwright/test';
import { apiBaseUrl, loadLocalEnvironment } from './src/config/env';

loadLocalEnvironment();

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  workers: 1,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: apiBaseUrl(),
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    { name: 'api', testMatch: '**/api/**/*.spec.ts' },
    { name: 'integration', testMatch: '**/integration/**/*.spec.ts' },
  ],
});
