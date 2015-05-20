# README

## Issue
my spree dumps deface error, such as:

```
Deface: 1 overrides found for 'spree/shared/_nav_bar'
Deface: 'auth_shared_login_bar' matched 1 times with 'li#search-bar'
Deface: [ERROR] The original source for 'auth_shared_login_bar' has changed, this override should be reviewed to ensure it's still valid.
   (0.1ms)  SELECT MAX("spree_taxons"."updated_at") FROM "spree_taxons" WHERE "spree_taxons"."parent_id" IS NULL
  Spree::Taxon Load (0.1ms)  SELECT "spree_taxons".* FROM "spree_taxons" WHERE "spree_taxons"."parent_id" IS NULL  ORDER BY "spree_taxons"."lft"
  Rendered /Users/maangie/.rvm/gems/ruby-2.2.1/gems/spree_frontend-3.0.1/app/views/spree/shared/_search.html.erb (4.1ms)
```

Please teach me how to avoid the error.

Thanks in advance.

## Ruby version
2.2.1

## System dependencies
sqlite3

## Configuration

```bash
% git clone https://github.com/maangie/mystore.git
% cd mystore
% bin/bundle
% bin/spring rake db:migrate
% bin/spring rake db:seed
% bin/spring rake spree_sample:load
% bin/spring rails server
```
