# mystore

[Spree Commerce](https://spreecommerce.org) 5.6 を使ったストアのバックエンドと管理画面です。

## 構成

- Ruby 4.0.9 / Rails 8.1
- Spree 5.6.1（`spree`, `spree_admin`, `spree_emails`）
- 認証: Devise（顧客 `Spree::User`、管理者 `Spree::AdminUser`）
- DB: SQLite

ストア画面（storefront）は含まない。Spree 5.5 以降のストア画面は Next.js 製で、
Store API（`/api/v3/store`）経由でこのアプリとつなぐ。

## 必要なもの

- Ruby（`.ruby-version` を参照）
- [libvips](https://www.libvips.org/install.html)（商品画像の処理に使う）

## セットアップ

```bash
git clone git@github.com:maangie/mystore.git
cd mystore
bin/setup --skip-server
bin/rails db:seed AUTO_ACCEPT=1
bin/rails spree:load_sample_data # サンプルデータが要るときだけ
```

`config/master.key` はリポジトリに含まれない。無い場合は `bin/rails credentials:edit` で作り直す。

## 起動

```bash
bin/dev
```

- 管理画面: http://localhost:3000/admin
- Store API: http://localhost:3000/api/v3/store

seed で作られる管理者は `spree@example.com` / `spree123`。

## チェック

```bash
bin/rails test
bin/rubocop
bin/brakeman
bin/bundler-audit
```
