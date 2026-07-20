import { expect, test } from "@playwright/test";

test("loads demo dashboard and switches language", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("نمای مهندسی")).toBeVisible();
  await page.getByLabel("Language").click();
  await expect(page.getByText("Engineering overview")).toBeVisible();
  await expect(page.getByText("Compare repositories")).toBeVisible();
});

test("validates GitHub username", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("نام کاربری گیت‌هاب را وارد کنید").fill("bad--name");
  await page.getByRole("button", { name: "تحلیل" }).click();
  await expect(page.getByText("نام کاربری معتبر گیت‌هاب وارد کنید")).toBeVisible();
});
