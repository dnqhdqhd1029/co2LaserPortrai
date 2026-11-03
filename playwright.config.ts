import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright",
  outputDir: "./test-results",
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:4174",
    browserName: "chromium",
    headless: true,
    viewport: { width: 1440, height: 1400 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
  },
  webServer: {
    command: "node-v24.18.0-win-x64\\node.exe node_modules\\vite\\bin\\vite.js --host 127.0.0.1 --port 4174",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
