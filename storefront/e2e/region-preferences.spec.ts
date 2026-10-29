import { expect, test } from "@playwright/test";
import { BASE_PATH, waitForHydration } from "./support";

// The header's region button is desktop-only (`hidden lg:flex`), which the
// default Desktop Chrome viewport satisfies.
test.describe("region preferences (header)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForHydration(
      page
        .getByRole("banner")
        .getByRole("button", { name: "Region and language" }),
    );
  });

  test("clicking the flag opens the region and language dialog", async ({
    page,
  }) => {
    await page
      .getByRole("banner")
      .getByRole("button", { name: "Region and language" })
      .click();

    const dialog = page.getByRole("dialog", { name: "Region and language" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Region")).toHaveValue("us");
    await expect(dialog.getByLabel("Language")).toHaveValue("en");
    await expect(
      dialog.getByRole("button", { name: "Update preferences" }),
    ).toBeEnabled();
  });

  test("closes with Escape without changing the page", async ({ page }) => {
    await page
      .getByRole("banner")
      .getByRole("button", { name: "Region and language" })
      .click();
    const dialog = page.getByRole("dialog", { name: "Region and language" });
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(new RegExp(`${BASE_PATH}$`));
  });

  test("submitting unchanged preferences just closes the dialog", async ({
    page,
  }) => {
    await page
      .getByRole("banner")
      .getByRole("button", { name: "Region and language" })
      .click();
    const dialog = page.getByRole("dialog", { name: "Region and language" });

    await dialog.getByRole("button", { name: "Update preferences" }).click();

    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(new RegExp(`${BASE_PATH}$`));
  });

  test("switching region navigates to that region's storefront", async ({
    page,
  }) => {
    await page
      .getByRole("banner")
      .getByRole("button", { name: "Region and language" })
      .click();
    const dialog = page.getByRole("dialog", { name: "Region and language" });
    const region = dialog.getByLabel("Region");

    const other = await region
      .locator("option")
      .evaluateAll((options) =>
        options
          .map((option) => (option as HTMLOptionElement).value)
          .find((value) => value !== "us"),
      );
    test.skip(!other, "the seeded store has only one region");

    await region.selectOption(other as string);
    await dialog.getByRole("button", { name: "Update preferences" }).click();

    await expect(page).toHaveURL(new RegExp(`/${other}/[a-z]{2}(/|$)`), {
      timeout: 30_000,
    });
    await expect(page.getByRole("banner")).toBeVisible();
  });
});
