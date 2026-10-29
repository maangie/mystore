# 商品データの翻訳を取り込むタスク。
namespace :translations do
  desc "db/data/product_names_ja.yml から商品名の日本語訳を取り込む"
  task product_names_ja: :environment do
    names = YAML.load_file(Rails.root.join("db/data/product_names_ja.yml"))

    names.each do |slug, name|
      product = Spree::Product.find_by(slug: slug)
      next warn("見つからない商品: #{slug}") unless product

      # slug を明示しないと、ja 用に英語版と違う slug が自動生成されるため、英語版と同じ値を入れる
      Mobility.with_locale(:ja) { product.update!(name: name, slug: slug) }
    end

    puts "#{names.size} 件の商品名を取り込みました"
  end
end
