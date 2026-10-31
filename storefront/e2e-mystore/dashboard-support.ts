import type { Page } from "@playwright/test";

// README のセットアップで作る開発用の管理者。違う管理者で試すときは環境変数で渡す。
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "spree@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "spree123";

/**
 * ログインした状態（Cookie）を保存するファイル。
 *
 * Spree はログインを同じ IP から 1 分に 5 回までしか受け付けないので、
 * ログインは dashboard.setup.ts で 1 回だけして、ほかのテストはこれを使い回す。
 */
export const AUTH_FILE = "playwright/.auth/admin.json";

/** ログイン画面を開き、メールアドレスとパスワードを入れてログインする。 */
export const signIn = async (
  page: Page,
  password = ADMIN_PASSWORD,
): Promise<void> => {
  await page.goto("/dashboard/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
};
