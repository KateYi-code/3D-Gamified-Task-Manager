import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:3000/auth");
  await page.getByRole("textbox", { name: "Email", exact: true }).click();
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("tomyuan1@gmail.com");
  await page.getByRole("textbox", { name: "Email", exact: true }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill("tomyuan1");
  await page.locator("form").getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("button", { name: "Previous Week" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next Week" })).toBeVisible();
});
