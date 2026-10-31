import { expect, test } from "@playwright/test";
import { BASE_PATH, waitForHydration } from "./support";

// The header's region button is desktop-only (`hidden lg:flex`), which the
// default Desktop Chrome viewport satisfies.
test.describe("地域と言語の設定（ヘッダー）", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_PATH);
    await waitForHydration(
      page
        .getByRole("banner")
        .getByRole("button", { name: "Region and language" }),
    );
  });

  test("国旗を押すと地域と言語のダイアログが開く", async ({ page }) => {
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

  test("Escape で閉じ、ページは変わらない", async ({ page }) => {
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

  test("設定を変えずに送るとダイアログが閉じるだけ", async ({ page }) => {
    await page
      .getByRole("banner")
      .getByRole("button", { name: "Region and language" })
      .click();
    const dialog = page.getByRole("dialog", { name: "Region and language" });

    await dialog.getByRole("button", { name: "Update preferences" }).click();

    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(new RegExp(`${BASE_PATH}$`));
  });

  test("地域を切り替えると、その地域のストア画面に移る", async ({ page }) => {
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
    test.skip(!other, "初期データのストアには地域が 1 つしかない");

    await region.selectOption(other as string);
    await dialog.getByRole("button", { name: "Update preferences" }).click();

    await expect(page).toHaveURL(new RegExp(`/${other}/[a-z]{2}(/|$)`), {
      timeout: 30_000,
    });
    await expect(page.getByRole("banner")).toBeVisible();
  });
});
