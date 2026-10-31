import { expect, test } from "@playwright/test";
import { AUTH_FILE, signIn } from "./dashboard-support";

test.describe("管理画面（ログイン前）", () => {
  test("ログインしていなければログイン画面になる", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard\/login$/);
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
  });

  test("パスワードが違うとログインできない", async ({ page }) => {
    await signIn(page, "wrong-password");
    await expect(page.getByText("Invalid email or password")).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/login$/);
  });

  // ログアウトするとそのログインは使えなくなるので、使い回すログインとは別にログインする。
  test("ログインしてログアウトできる", async ({ page }) => {
    await signIn(page);
    await expect(
      page.getByRole("heading", { level: 1, name: "ダッシュボード" }),
    ).toBeVisible({ timeout: 30_000 });

    await page.getByRole("button", { name: "ユーザーメニュー" }).click();
    await page.getByRole("menuitem", { name: "ログアウト" }).click();
    await expect(page).toHaveURL(/\/dashboard\/login$/);
  });
});

test.describe("管理画面（ログイン後）", () => {
  test.use({ storageState: AUTH_FILE });

  test("商品を検索して開ける", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "商品", exact: true }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "商品" }),
    ).toBeVisible({ timeout: 30_000 });

    await page.getByRole("searchbox", { name: "検索…" }).fill("Drip Coffee");
    const rows = page.getByRole("table").getByRole("row");
    await expect(rows).toHaveCount(2, { timeout: 30_000 });

    await page.getByRole("link", { name: "Drip Coffee Maker 1.5L" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Drip Coffee Maker 1.5L" }),
    ).toBeVisible({ timeout: 30_000 });
    for (const sku of [
      "DRIP-COFFEE-MAKER-BLACK",
      "DRIP-COFFEE-MAKER-WHITE",
      "DRIP-COFFEE-MAKER-STEEL-GREY",
    ]) {
      // バリアントの表と価格の表の両方に出る。
      await expect(page.getByRole("row", { name: sku }).first()).toBeVisible();
    }
  });
});
