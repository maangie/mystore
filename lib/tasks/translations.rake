# カタログデータの翻訳を取り込むタスク。
namespace :translations do
  desc "db/data/translations_ja.yml からカタログデータの日本語訳を取り込む"
  task import_ja: :environment do
    data = YAML.load_file(Rails.root.join("db/data/translations_ja.yml"))

    # ja ロケールのまま検索すると ja の翻訳側を探してしまうため、検索は英語版で行う
    products, categories, option_types, option_values = nil
    Mobility.with_locale(:en) do
      products = Spree::Product.where(slug: data["products"].keys).index_by(&:slug)
      # 子カテゴリの permalink と pretty_name は親の訳から作られるため、親から順に入れる
      categories = Spree::Category.where(permalink: data["categories"].keys).order(:depth).to_a
      option_types = Spree::OptionType.where(name: data["option_types"].keys).to_a
      option_values = Spree::OptionValue.where(name: data["option_values"].keys).to_a
    end

    (data["products"].keys - products.keys).each { |slug| warn("見つからない商品: #{slug}") }

    Mobility.with_locale(:ja) do
      products.each do |slug, product|
        attrs = data["products"][slug]
        # slug を明示しないと、ja 用に英語版と違う slug が自動生成されるため、英語版と同じ値を入れる
        product.update!(**attrs.symbolize_keys, slug: slug, meta_title: "#{attrs["name"]} | Spree Commerce デモ")
      end

      categories.each do |category|
        permalink = category[:permalink]
        # permalink を明示しないと、日本語名から permalink が作られてしまうため、英語版と同じ値を入れる
        category.update!(name: data["categories"][permalink], permalink: permalink)
      end

      option_types.each { |option_type| option_type.update!(label: data["option_types"][option_type.name]) }
      option_values.each { |option_value| option_value.update!(label: data["option_values"][option_value.name]) }
    end

    puts "商品 #{products.size} 件、カテゴリ #{categories.size} 件、" \
      "オプション #{option_types.size} 件、オプション値 #{option_values.size} 件を取り込みました"
  end
end
