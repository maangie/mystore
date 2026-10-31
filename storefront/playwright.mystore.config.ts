import { defineConfig, devices } from "@playwright/test";

/**
 * このリポジトリの Rails（管理画面）とストア画面を、画面を操作して確かめる。
 *
 * `bin/dev` で立ち上げた開発用のサーバーと DB に対して動く。
 * 起動していなければ Playwright が `bin/dev` を立ち上げる。
 * DB には README の「日本向けのデータ」を入れておく。
 *
 *   pnpm run test:mystore
 *
 * 上流の `playwright.config.ts`（Docker の Spree につなぐもの）とは別。
 */
export default defineConfig({
  testDir: "./e2e-mystore",
  // next dev は初めて開くページをその場でビルドするので、既定の 30 秒では足りない。
  timeout: 120_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  outputDir: "test-results/mystore",
  use: {
    locale: "ja-JP",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "storefront",
      testMatch: "storefront.spec.ts",
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3001" },
    },
    {
      name: "dashboard-setup",
      testMatch: "dashboard.setup.ts",
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3000" },
    },
    {
      name: "dashboard",
      testMatch: "dashboard.spec.ts",
      dependencies: ["dashboard-setup"],
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3000" },
    },
  ],
  webServer: {
    command: "bin/dev",
    cwd: "..",
    // ストア画面は Rails の API を読んで描くので、これが開ければ両方動いている。
    url: "http://localhost:3001/jp/ja",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
