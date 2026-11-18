import { defineConfig, devices } from "@playwright/test";

// Ensure localhost / 127.0.0.1 requests bypass any sandbox HTTP proxy
const localBypass = "localhost,127.0.0.1,::1";
process.env.NO_PROXY = process.env.NO_PROXY
  ? `${process.env.NO_PROXY},${localBypass}`
  : localBypass;
process.env.no_proxy = process.env.NO_PROXY;
if (process.env.PLAYWRIGHT_USE_REAL_SUPABASE !== "1") {
  delete process.env.HTTP_PROXY;
  delete process.env.http_proxy;
  delete process.env.HTTPS_PROXY;
  delete process.env.https_proxy;
}

const port = process.env.PLAYWRIGHT_PORT || "3100";
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "node ./e2e/helpers/start-test-server.mjs",
        url: baseURL,
        reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === "1",
        timeout: 120_000,
      },
});
