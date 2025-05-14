import { test, expect } from "@playwright/test";
import { login } from "./utils";

test.beforeEach(login);

test("test", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Previous Week" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next Week" })).toBeVisible();
});
