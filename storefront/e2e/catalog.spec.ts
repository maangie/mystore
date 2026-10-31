import { expect, type Page, test } from "@playwright/test";
import {
  BASE_PATH,
  openCategoryFromMenu,
  openFirstCategory,
  openFirstProduct,
  waitForHydration,
} from "./support";

function productNames(page: Page) {
  return page
    .getByRole("main")
    .getByRole("heading", { level: 3 })
    .allTextContents();
}

test.describe("トップページ", () => {
  test("注目の商品が出て、その商品のページを開ける", async ({ page }) => {
    await page.goto(BASE_PATH);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Featured Products" }),
    ).toBeVisible();

    await openFirstProduct(page, BASE_PATH);
  });

  test("ヘッダーのメニューからカテゴリを開ける", async ({ page }) => {
    await openCategoryFromMenu(page);
  });
});

test.describe("カテゴリのページ", () => {
  test("カテゴリの商品を件数とパンくずリスト付きで並べる", async ({ page }) => {
    const name = await openFirstCategory(page);
    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(breadcrumb.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(breadcrumb.getByText(name)).toBeVisible();
    // The count briefly renders twice while the page streams in.
    await expect(
      page.getByText(/\d+ products?/).filter({ visible: true }),
    ).toBeVisible();
    expect((await productNames(page)).length).toBeGreaterThan(0);
  });

  test("サブカテゴリを選ぶと絞り込まれる", async ({ page }) => {
    const parent = await openFirstCategory(page);
    const subcategory = page
      .getByRole("main")
      .getByRole("link")
      .filter({ hasNot: page.getByRole("heading") })
      .and(page.locator('a[href*="/c/"]'))
      .first();
    await waitForHydration(subcategory);
    const name = (await subcategory.textContent())?.trim() ?? "";
    await subcategory.click();

    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page
        .getByRole("navigation", { name: "Breadcrumb" })
        .getByRole("link", { name: parent }),
    ).toBeVisible();
  });

  test("商品を名前で並べ替える", async ({ page }) => {
    await openFirstCategory(page);
    const sort = page.getByRole("button", { name: "Sort" });
    await waitForHydration(sort);
    await sort.click();
    await page.getByRole("menuitemradio", { name: "Name (A-Z)" }).click();

    await expect(page).toHaveURL(/sort=/, { timeout: 30_000 });
    await expect
      .poll(async () => {
        const names = await productNames(page);
        const sorted = [...names].sort((a, b) =>
          a.localeCompare(b, "en", { sensitivity: "base" }),
        );
        return names.length > 1 && names.join("|") === sorted.join("|");
      })
      .toBe(true);
  });

  test("商品のカードからその商品のページを開ける", async ({ page }) => {
    await openFirstCategory(page);
    await openFirstProduct(page, page.url());
  });
});
