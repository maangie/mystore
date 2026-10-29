# db/data/product_images の SVG から商品画像を作って差し替えるタスク。
namespace :products do
  desc "db/data/product_images/<商品の slug>.svg を PNG にして、その商品の画像と差し替える。rsvg-convert が必要"
  task illustrations: :environment do
    abort "rsvg-convert が見つかりません（brew install librsvg）" unless system("which rsvg-convert > /dev/null")

    replaced = 0
    Rails.root.glob("db/data/product_images/*.svg").each do |svg_path|
      slug = svg_path.basename(".svg").to_s
      # ja ロケールのまま検索すると ja の翻訳側を探してしまうため、検索は英語版で行う
      product = Mobility.with_locale(:en) { Spree::Product.find_by(slug: slug) }
      unless product
        warn("見つからない商品: #{slug}")
        next
      end

      Dir.mktmpdir do |dir|
        png_path = File.join(dir, "#{slug}.png")
        system("rsvg-convert", "-w", "1024", "-o", png_path, svg_path.to_s, exception: true)

        alt = Mobility.with_locale(:ja) { product.name }
        ActiveRecord::Base.transaction do
          product.media.destroy_all
          media = product.media.new(alt: alt, media_type: "image", store: Spree::Store.default)
          media.attachment.attach(io: File.open(png_path), filename: "#{slug}.png", content_type: "image/png")
          media.save!
        end
      end
      replaced += 1
    end

    puts "商品画像を #{replaced} 件差し替えました"
  end
end
