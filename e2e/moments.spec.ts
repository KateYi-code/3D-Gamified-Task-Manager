import { test, expect } from "@playwright/test";
import { login } from "./utils";

test.beforeEach(login);

test("should create a task & a moment", async ({ page }) => {
  await page.getByTestId("weekly-grid-day-Wed").getByTestId("add-target-button").click();
  await page.getByTestId("goal-field").nth(0).click();
  await page.getByTestId("goal-field").nth(0).fill("test goal");
  await page
    .locator('[id="radix-«r1i»"] > form > .space-y-3 > div:nth-child(2) > .file\\:text-foreground')
    .click();
  await page
    .locator('[id="radix-«r1i»"] > form > .space-y-3 > div:nth-child(2) > .file\\:text-foreground')
    .fill("test 1");
  await page
    .locator('[id="radix-«r1i»"] > form > .space-y-3 > div:nth-child(2) > .inline-flex')
    .click();
  await page
    .locator("form")
    .filter({ hasText: "Your Goal TitleYour Taskstest" })
    .locator("button")
    .nth(3)
    .click();
  await page.getByRole("link", { name: "Moments" }).click();
  await page.getByRole("button", { name: "Post Moment +" }).click();
  await page.getByRole("textbox", { name: "Tell your followers what’s up…" }).click();
  await page.getByRole("textbox", { name: "Tell your followers what’s up…" }).fill("hello");
  await page.getByRole("combobox").selectOption("cmaojq6ac000xzrmz971s4h8v");
  await page.getByRole("button", { name: "Choose File" }).click();
  await page.getByRole("button", { name: "Choose File" }).setInputFiles("赞赏02.jpg");
  await page.getByRole("button", { name: "Post Moment" }).click();
  await expect(page.getByText("hello").nth(1)).toBeVisible();
  await page.getByText("hello").nth(1).click();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("main")).toContainText("hello");
});
