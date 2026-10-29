# 商品画像を整えるタスク。
namespace :products do
  desc "db/data/product_images の <商品の slug>[-<色>].svg を PNG にして、その商品の画像と差し替える。rsvg-convert が必要"
  task illustrations: :environment do
    abort "rsvg-convert が見つかりません（brew install librsvg）" unless system("which rsvg-convert > /dev/null")

    # ja ロケールのまま検索すると ja の翻訳側を探してしまうため、検索は英語版で行う
    products = Mobility.with_locale(:en) { Spree::Product.all.to_a }
    # ファイル名の先頭が一番長く一致する slug の商品とする（色の名前が slug に続く）
    files = Rails.root.glob("db/data/product_images/*.svg").group_by do |path|
      name = path.basename(".svg").to_s
      products.select { |product| name == product.slug || name.start_with?("#{product.slug}-") }.max_by { |product| product.slug.length }
    end

    replaced = 0
    files.each do |product, paths|
      unless product
        warn("商品が見つからない画像: #{paths.map { |path| path.basename.to_s }.join(", ")}")
        next
      end

      alt = Mobility.with_locale(:ja) { product.name }
      Dir.mktmpdir do |dir|
        ActiveRecord::Base.transaction do
          product.media.destroy_all
          paths.sort.each do |svg_path|
            name = svg_path.basename(".svg").to_s
            png_path = File.join(dir, "#{name}.png")
            system("rsvg-convert", "-w", "1024", "-o", png_path, svg_path.to_s, exception: true)

            media = product.media.new(alt: alt, media_type: "image", store: Spree::Store.default)
            media.attachment.attach(io: File.open(png_path), filename: "#{name}.png", content_type: "image/png")
            media.save!
            replaced += 1
          end
        end
      end
    end

    puts "商品画像を #{replaced} 件差し替えました"
    Rake::Task["products:link_color_images"].invoke
  end

  desc "「<商品の slug>-<色>.<拡張子>」という名前の画像を、その色のバリアントに結びつける（変えた色の画像を出すため）"
  task link_color_images: :environment do
    linked = 0
    Mobility.with_locale(:en) { Spree::Product.includes(variants: { option_values: :option_type }).all.to_a }.each do |product|
      colors = product.variants.flat_map { |variant| variant.option_values.select { |value| value.option_type.name == "color" }.map(&:name) }.uniq
      product.media.each do |media|
        base = File.basename(media.attachment.blob.filename.to_s, ".*")
        # 「blue-and-white」と「white」のように後ろが重なる色は、一番長く一致する色を選ぶ
        color = colors.select { |name| base.end_with?("-#{name}") }.max_by(&:length)
        next unless color

        product.variants.each do |variant|
          next unless variant.option_values.any? { |value| value.option_type.name == "color" && value.name == color }

          link = Spree::VariantMedia.find_or_create_by!(variant: variant, asset: media)
          linked += 1 if link.previously_new_record?
        end
      end
    end

    puts "色のバリアントに画像を #{linked} 件結びつけました"
  end
end
