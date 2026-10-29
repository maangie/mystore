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

## 日本向けのデータ

商品・価格・画像などは DB の中のデータで、リポジトリにはそれを入れるタスクだけがある。
`git pull` ではデータは増えないので、新しい DB（開発・本番・E2E 用など）では次を順に 1 回ずつ実行する。

```bash
bin/rails spree:load_sample_data       # サンプルの商品（セットアップで実行済みなら不要）
bin/rails translations:import_ja       # 商品名・説明・カテゴリなどの日本語訳（db/data/translations_ja.yml）
bin/rails markets:japan                # 日本を JPY の市場にし、円の価格を作る
bin/rails option_values:set_colors     # 色の選択肢に見本の色を入れる（db/data/option_value_colors.yml）
bin/rails products:placeholder_images  # 画像のない商品に、商品名入りの仮の画像を付ける
bin/rails products:illustrations       # db/data/product_images の画像で商品画像を差し替え、色ごとに結びつける
```

- `markets:japan` は `JPY_RATE` で 1 USD あたりの円を指定できる（省略時は 150）。すでにある円の価格には触らない
- `products:placeholder_images` と `products:illustrations` は `rsvg-convert` が要る（`brew install librsvg`）。
  `placeholder_images` は画像のない商品だけが対象。`illustrations` は db/data/product_images に画像のある商品の画像を作り直す。
  実行する順は `placeholder_images` → `illustrations` のどちらでもよい
- 色を変えて画像を変えたい商品は、`db/data/product_images/<商品の slug>-<色>.svg` を置いて `products:illustrations` を実行する。
  写真（`.png` `.jpg` `.webp`）も置ける。ドリップコーヒーメーカーとエアフライヤーの写真は、
  `-matte-black.webp` が元の写真で、ほかの色は元の写真の本体部分を ImageMagick で塗り替えて作った
  （色は商品のバリアントの色の名前。`products:link_color_images` が、その名前の画像をその色に結びつける）
- 写真のないサンプル商品には、すべて色ごとの SVG のイラストを置いてある。そのため `illustrations` を実行すれば、
  仮の画像の商品は残らない

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
