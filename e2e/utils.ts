import { Page } from "@playwright/test";

export const login = async ({ page }: { page: Page }) => {
  await page.goto("http://localhost:3000/auth");
  await page.getByRole("textbox", { name: "Email", exact: true }).click();
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("tomyuan1@gmail.com");
  await page.getByRole("textbox", { name: "Email", exact: true }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill("tomyuan1");
  await page.locator("form").getByRole("button", { name: "Login" }).click();
};
