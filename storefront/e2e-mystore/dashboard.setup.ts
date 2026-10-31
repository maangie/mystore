import { expect, test as setup } from "@playwright/test";
import { AUTH_FILE, signIn } from "./dashboard-support";

setup("管理画面にログインしておく", async ({ page }) => {
  await signIn(page);
  await expect(
    page.getByRole("heading", { level: 1, name: "ダッシュボード" }),
  ).toBeVisible({ timeout: 30_000 });
  await page.context().storageState({ path: AUTH_FILE });
});
