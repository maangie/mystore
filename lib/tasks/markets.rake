# 市場（マーケット）を整えるタスク。
namespace :markets do
  desc "日本をほかの市場（Asia など）から分けて JPY の市場にし、USD 価格を換算した円の価格を入れる（JPY_RATE で 1 USD あたりの円を指定。省略時は 150）"
  task japan: :environment do
    rate = BigDecimal(ENV.fetch("JPY_RATE", "150"))
    # USD の金額を円に換算して 10 円単位に丸める（円は小数を持たない）
    to_yen = ->(usd) { ((usd * rate) / 10).round * 10 }
    store = Spree::Store.default

    japan = store.markets.find_or_initialize_by(name: "Japan")

    ActiveRecord::Base.transaction do
      # 国は 1 つの市場にしか属せないため、先にほかの市場から外す。
      # Spree 5 のサンプルデータには日本を含む Asia 市場があったが、Spree 6 のものには無い
      store.markets.where.not(id: japan.id).find_each do |market|
        next unless market.countries.any? { |country| country.iso == "JP" }

        market.countries = market.countries.reject { |country| country.iso == "JP" }
        market.save!
      end

      japan.update!(
        currency: "JPY",
        default_locale: "ja",
        supported_locales: "ja,en",
        countries: [ Spree::Country.by_iso("JP") ]
      )

      # すでにある円の価格は手で直された可能性があるので触らない
      created = 0
      Spree::Price.where(currency: "USD", price_list_id: nil).find_each do |usd|
        next if Spree::Price.exists?(variant_id: usd.variant_id, currency: "JPY", price_list_id: nil)

        Spree::Price.create!(
          variant_id: usd.variant_id,
          currency: "JPY",
          amount: to_yen.call(usd.amount),
          compare_at_amount: usd.compare_at_amount && to_yen.call(usd.compare_at_amount)
        )
        created += 1
      end

      puts "Japan 市場（JPY）を用意し、円の価格を #{created} 件作りました（1 USD = #{rate.to_s("F")} 円）"
    end
  end
end
