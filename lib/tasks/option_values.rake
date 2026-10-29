# 商品の選択肢（色・サイズなど）を整えるタスク。
namespace :option_values do
  desc "db/data/option_value_colors.yml から、色の選択肢に見本の色（color_code）を入れる"
  task set_colors: :environment do
    colors = YAML.load_file(Rails.root.join("db/data/option_value_colors.yml"))
    # ja ロケールのまま検索すると ja の翻訳側を探してしまうため、検索は英語版で行う
    values = Mobility.with_locale(:en) do
      Spree::OptionValue.joins(:option_type).where(spree_option_types: { name: "color" }).to_a
    end

    updated = 0
    values.each do |value|
      code = colors[value.name]
      if code.nil?
        warn("見本の色がない色: #{value.name}")
        next
      end

      next if value.color_code == code

      value.update!(color_code: code)
      updated += 1
    end

    puts "色の選択肢 #{updated} 件に見本の色を入れました"
  end
end
