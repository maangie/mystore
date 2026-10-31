import { expect, test } from "@playwright/test";
import { waitForHydration } from "../e2e/support";

const BASE_PATH = "/jp/ja";

test.describe("ストア画面", () => {
  test("トップに日本語のカテゴリと円の価格が出る", async ({ page }) => {
    await page.goto(BASE_PATH);

    const categories = page.getByRole("navigation", {
      name: "Category navigation",
    });
    await expect(
      categories.getByRole("link", { name: "キッチン", exact: true }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .getByRole("main")
        .getByText(/^￥[\d,]+$/)
        .first(),
    ).toBeVisible();
  });

  test("カテゴリから商品を開ける", async ({ page }) => {
    await page.goto(`${BASE_PATH}/c/kitchen/coffee-machines`);
    await expect(
      page.getByRole("heading", { level: 1, name: "コーヒーマシン" }),
    ).toBeVisible({ timeout: 30_000 });

    const link = page.getByRole("link", {
      name: "ドリップコーヒーメーカー 1.5L",
    });
    await waitForHydration(link);
    await link.click();
    // パンくずリストのために、開いたカテゴリが ?category_id= で付く。
    await expect(page).toHaveURL(/\/products\/drip-coffee-maker\?category_id=/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "ドリップコーヒーメーカー 1.5L",
      }),
    ).toBeVisible({ timeout: 30_000 });
  });

  test("色を選ぶとその色の SKU になる", async ({ page }) => {
    await page.goto(`${BASE_PATH}/products/drip-coffee-maker`);
    const sku = page
      .getByRole("term")
      .filter({ hasText: /^SKU$/ })
      .locator("xpath=following-sibling::*[1]");
    await expect(sku).toHaveText("DRIP-COFFEE-MAKER-BLACK", {
      timeout: 30_000,
    });

    const white = page.getByRole("button", { name: "ホワイト", exact: true });
    await waitForHydration(white);
    await white.click();
    await expect(sku).toHaveText("DRIP-COFFEE-MAKER-WHITE");
  });

  test("カートに入れて、数量を変えて、取り除ける", async ({ page }) => {
    await page.goto(`${BASE_PATH}/products/drip-coffee-maker`);
    const addToCart = page.getByRole("button", { name: "カートに入れる" });
    await waitForHydration(addToCart);
    await addToCart.click();
    await expect(
      page.getByRole("dialog", { name: /カート （1 点）/ }),
    ).toBeVisible({
      timeout: 30_000,
    });

    await page.goto(`${BASE_PATH}/cart`);
    const main = page.getByRole("main");
    await expect(
      main.getByRole("heading", { level: 1, name: "ショッピングカート" }),
    ).toBeVisible({ timeout: 30_000 });
    const subtotal = main
      .getByRole("term")
      .filter({ hasText: /^小計$/ })
      .locator("xpath=following-sibling::*[1]");
    await expect(subtotal).toHaveText("￥13,500");

    const increase = main.getByRole("button", { name: "数量を増やす" });
    await waitForHydration(increase);
    await increase.click();
    await expect(main.getByRole("textbox", { name: "数量" })).toHaveValue("2", {
      timeout: 30_000,
    });
    await expect(subtotal).toHaveText("￥27,000", { timeout: 30_000 });

    await main.getByRole("button", { name: /を削除$/ }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "カートは空です" }),
    ).toBeVisible({ timeout: 30_000 });
  });
});
