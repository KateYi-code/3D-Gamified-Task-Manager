import { test, expect } from "@playwright/test";
import { login } from "./utils";

test.beforeEach(login);

test("should be able to create target and tasks", async ({ page }) => {
  await page.getByTestId("weekly-grid-day-Wed").getByTestId("add-target-button").click();
  await page
    .locator('[id="radix-«rm»"] > form > .space-y-3 > div:nth-child(2) > .file\\:text-foreground')
    .click();
  await page.locator('[id="«rv»-form-item"]').click();
  await page.locator('[id="«rv»-form-item"]').fill("goal 1");
  await page
    .locator('[id="radix-«rm»"] > form > .space-y-3 > div:nth-child(2) > .file\\:text-foreground')
    .click();
  await page
    .locator('[id="radix-«rm»"] > form > .space-y-3 > div:nth-child(2) > .file\\:text-foreground')
    .fill("task1");
  await page
    .locator('[id="radix-«rm»"] > form > .space-y-3 > div:nth-child(2) > .inline-flex')
    .click();
  await page
    .locator("form")
    .filter({ hasText: "Your Goal TitleYour Taskstask1DeleteDeleteAdd TaskDONE" })
    .getByPlaceholder("Enter new task")
    .click();
  await page
    .locator("form")
    .filter({ hasText: "Your Goal TitleYour Taskstask1DeleteDeleteAdd TaskDONE" })
    .getByPlaceholder("Enter new task")
    .fill("task2");
  await page
    .locator("form")
    .filter({ hasText: "Your Goal TitleYour Taskstask1DeleteDeleteAdd TaskDONE" })
    .locator("button")
    .nth(2)
    .click();
  await page
    .locator("form")
    .filter({ hasText: "Your Goal TitleYour Taskstask1DeleteDeletetask2DeleteDeleteAdd TaskDONE" })
    .getByPlaceholder("Enter new task")
    .click();
  await page
    .locator("form")
    .filter({ hasText: "Your Goal TitleYour Taskstask1DeleteDeletetask2DeleteDeleteAdd TaskDONE" })
    .getByPlaceholder("Enter new task")
    .fill("task3");
  await page
    .locator("div")
    .filter({ hasText: /^Your Taskstask1DeleteDeletetask2DeleteDeleteAdd Task$/ })
    .locator("button")
    .nth(4)
    .click();
  await page.locator('[id="radix-«rm»"] > form > button').click();
  await expect(page.getByText("goal 1")).toBeVisible();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^task1task2task3$/ })
      .getByTestId("IN_PROGRESS"),
  ).toBeVisible();
  await expect(page.getByTestId("PENDING").nth(2)).toBeVisible();
});
