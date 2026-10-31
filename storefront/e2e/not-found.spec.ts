import { expect, type Page, test } from "@playwright/test";
import { BASE_PATH, waitForHydration } from "./support";

const missing = `missing-${Date.now()}`;

async function expectNotFoundPage(page: Page, path: string): Promise<void> {
  const response = await page.goto(`${BASE_PATH}${path}`);

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Page not found" }),
  ).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
}

test.describe("見つからないページ", () => {
  test("無い商品はストア画面の枠の中で 404 になる", async ({ page }) => {
    await expectNotFoundPage(page, `/products/${missing}`);
  });

  test("無いカテゴリは 404 になる", async ({ page }) => {
    await expectNotFoundPage(page, `/c/${missing}`);
  });

  test("無い規約は 404 になる", async ({ page }) => {
    await expectNotFoundPage(page, `/policies/${missing}`);
  });

  test("知らないページは 404 になる", async ({ page }) => {
    await expectNotFoundPage(page, `/${missing}/${missing}`);
  });

  test("カートとセッションを読み込んだ後も 404 のページのまま", async ({
    page,
  }) => {
    let pageLoads = 0;
    page.on("request", (request) => {
      if (request.isNavigationRequest()) pageLoads++;
    });

    await expectNotFoundPage(page, `/products/${missing}`);
    await waitForHydration(
      page.getByRole("link", { name: "Browse all products" }),
    );
    // Give the cart and session providers time to finish their first sync.
    await page.waitForLoadState("networkidle");

    expect(pageLoads).toBe(1);
  });

  test("商品一覧へ戻るリンクがある", async ({ page }) => {
    await expectNotFoundPage(page, `/products/${missing}`);

    const browse = page.getByRole("link", { name: "Browse all products" });
    await waitForHydration(browse);
    await browse.click();

    await expect(page).toHaveURL(new RegExp(`${BASE_PATH}/products$`));
    await expect(
      page.getByRole("heading", { level: 1, name: "All Products" }),
    ).toBeVisible({ timeout: 30_000 });
  });
});
