# mystore

[Spree Commerce](https://spreecommerce.org) 6.0 を使ったストアです。バックエンド・管理画面・ストア画面をこのリポジトリにまとめている。

## 構成

- Ruby 4.0.9 / Rails 8.1
- Spree 6.0.0（`spree`, `spree_emails`, `spree_dashboard`）
- 管理画面: React 製の Spree Dashboard（`dashboard/` でビルドし、Rails が `/dashboard` で配信する）
- 認証: Spree 標準の `Spree::Customer`（顧客）と `Spree::AdminUser`（管理者）。Devise は使わない
- ストア画面: Spree 公式の Next.js 製 storefront（`storefront/`。[spree/storefront](https://github.com/spree/storefront) から取り込んだもの）。
  Store API（`/api/v3/store`）経由でこのアプリとつなぐ
- DB: SQLite

## 必要なもの

- Ruby（`.ruby-version` を参照）
- Node.js 24 以上と pnpm（管理画面とストア画面に使う。版は各 `package.json` の `packageManager` に従う）
- [libvips](https://www.libvips.org/install.html)（商品画像の処理に使う）

## セットアップ

```bash
git clone git@github.com:maangie/mystore.git
cd mystore
bin/setup --skip-server # gem と npm パッケージを入れ、管理画面をビルドし、DB を用意する
bin/rails db:seed AUTO_ACCEPT=1 ADMIN_EMAIL=spree@example.com ADMIN_PASSWORD=spree123
bin/rails spree:load_sample_data # サンプルデータが要るときだけ
```

`bin/setup` は publishable API キーを作り、ストア画面用の `storefront/.env.local` を書く（既にあれば触らない）。
キーは `bin/rails spree:cli:ensure_api_key` で出せる。決済・メール・計測などの設定は `storefront/.env.example` を参照。

`ADMIN_EMAIL` / `ADMIN_PASSWORD` を渡さないと管理者は作られず、初回設定用のリンクが表示される
（`bin/rails spree:setup:token` で出し直せる）。

`config/master.key` はリポジトリに含まれない。無い場合は `bin/rails credentials:edit` で作り直し、
`bin/rails db:encryption:init` が出す鍵を `active_record_encryption` として credentials に入れる
（環境変数 `ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY` などでもよい）。

## 起動

```bash
bin/dev
```

- ストア画面: http://localhost:3001
- 管理画面: http://localhost:3000/dashboard
- Store API: http://localhost:3000/api/v3/store
- Admin API: http://localhost:3000/api/v3/admin

管理画面を変えたら作り直す。

```bash
cd dashboard && VITE_BASE_PATH=/dashboard/ pnpm build
```

画面を触りながら開発するときは `cd dashboard && pnpm dev` で http://localhost:5173 を開く（API は 3000 番へ転送される）。

pnpm は実行したディレクトリの `packageManager` で版を選ぶので、`pnpm --dir` ではなく各ディレクトリに入って実行する。

## チェック

```bash
bin/rails test
bin/rubocop
bin/brakeman
bin/bundler-audit
(cd dashboard && pnpm audit)
(cd storefront && pnpm run check && pnpm exec tsc --noEmit && pnpm test && pnpm audit)
```
