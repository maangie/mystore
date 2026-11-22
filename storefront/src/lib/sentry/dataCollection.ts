import type * as Sentry from "@sentry/nextjs";

/** `Sentry.init` が受け取る `dataCollection` の型（@sentry/nextjs は型を直接公開していないため取り出す） */
type DataCollection = NonNullable<
  NonNullable<Parameters<typeof Sentry.init>[0]>["dataCollection"]
>;

/**
 * Sentry に送るデータの範囲を返す。
 *
 * Sentry 11 では `sendDefaultPii` がなくなり、`dataCollection` の初期値は
 * IP アドレス・ユーザー情報・cookie・リクエストやレスポンスの本文などをすべて送る設定になった。
 * これまでどおり「明示的に有効にしたときだけ個人情報を送る」ため、無効のときは個人情報にあたる項目を止める。
 *
 * @param sendPii - 個人情報を送るなら true（環境変数で明示的に有効にしたとき）
 * @returns `Sentry.init` に渡す `dataCollection`
 */
export const sentryDataCollection = (sendPii: boolean): DataCollection => {
  if (sendPii) return {};
  return {
    userInfo: false,
    cookies: false,
    httpBodies: [],
    stackFrameVariables: false,
  };
};
