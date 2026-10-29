# mystore

[Spree Commerce](https://spreecommerce.org) 6.0 を使ったストアのバックエンドと管理画面です。

## 構成

- Ruby 4.0.9 / Rails 8.1
- Spree 6.0.0（`spree`, `spree_emails`, `spree_dashboard`）
- 管理画面: React 製の Spree Dashboard（`dashboard/` でビルドし、Rails が `/dashboard` で配信する）
- 認証: Spree 標準の `Spree::Customer`（顧客）と `Spree::AdminUser`（管理者）。Devise は使わない
- DB: SQLite

ストア画面（storefront）は含まない。ストア画面は Next.js 製で、
Store API（`/api/v3/store`）経由でこのアプリとつなぐ。

## 必要なもの

- Ruby（`.ruby-version` を参照）
- Node.js 24 以上と pnpm（管理画面のビルドに使う）
- [libvips](https://www.libvips.org/install.html)（商品画像の処理に使う）

## セットアップ

```bash
git clone git@github.com:maangie/mystore.git
cd mystore
bin/setup --skip-server # gem と npm パッケージを入れ、管理画面をビルドし、DB を用意する
bin/rails db:seed AUTO_ACCEPT=1 ADMIN_EMAIL=spree@example.com ADMIN_PASSWORD=spree123
bin/rails spree:load_sample_data # サンプルデータが要るときだけ
```

`ADMIN_EMAIL` / `ADMIN_PASSWORD` を渡さないと管理者は作られず、初回設定用のリンクが表示される
（`bin/rails spree:setup:token` で出し直せる）。

`config/master.key` はリポジトリに含まれない。無い場合は `bin/rails credentials:edit` で作り直し、
`bin/rails db:encryption:init` が出す鍵を `active_record_encryption` として credentials に入れる
（環境変数 `ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY` などでもよい）。

## 起動

```bash
bin/dev
```

- 管理画面: http://localhost:3000/dashboard
- Store API: http://localhost:3000/api/v3/store
- Admin API: http://localhost:3000/api/v3/admin

管理画面を変えたら作り直す。

```bash
VITE_BASE_PATH=/dashboard/ pnpm --dir dashboard build
```

画面を触りながら開発するときは `pnpm --dir dashboard dev` で http://localhost:5173 を開く（API は 3000 番へ転送される）。

## チェック

```bash
bin/rails test
bin/rubocop
bin/brakeman
bin/bundler-audit
pnpm --dir dashboard audit
```
