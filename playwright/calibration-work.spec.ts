import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

test("camera opens Calibration Work and Exit returns to COS", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/?portraitExport=1", { waitUntil: "networkidle" });
  await expect(page.locator('[data-portrait-screen="cos-control"]')).toBeVisible({ timeout: 10_000 });

  await page.getByRole("button", { name: "Camera" }).click();
  const calibration = page.locator('[data-portrait-screen="calibration-work"]');
  await expect(calibration).toBeVisible();
  await expect(calibration.locator(".portrait-calibration-panel")).toHaveCount(2);
  await expect(calibration.getByRole("button", { name: "Back" })).toHaveCount(0);
  const cameraButton = calibration.getByRole("button", { name: "Camera" });
  await expect(cameraButton).toBeVisible();
  await expect(cameraButton).toHaveText("");
  await expect(cameraButton).not.toHaveAttribute("data-active");

  const exportDirectory = path.resolve(process.cwd(), "tmp/calibration-work");
  await mkdir(exportDirectory, { recursive: true });
  await page.locator('[data-screen-frame="true"]').screenshot({
    path: path.join(exportDirectory, "calibration-work.png"),
    animations: "disabled",
    caret: "hide",
    scale: "css",
  });

  await page.getByRole("button", { name: "Exit" }).click();
  await expect(page.locator('[data-portrait-screen="cos-control"]')).toBeVisible();
});
