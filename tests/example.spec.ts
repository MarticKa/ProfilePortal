import { test, expect } from "@playwright/test";

test.describe("Examples", () => {
  test.beforeEach(async ({}) => {});

  test("Example test 1", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByTestId("login-email")).toBeVisible();
  });
});
