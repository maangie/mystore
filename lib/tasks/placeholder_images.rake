# 画像のない商品にプレースホルダー画像を付けるタスク。
namespace :products do
  desc "画像のない商品に、商品名入りのプレースホルダー画像（800x800 の PNG）を付ける。rsvg-convert が必要"
  task placeholder_images: :environment do
    abort "rsvg-convert が見つかりません（brew install librsvg）" unless system("which rsvg-convert > /dev/null")

    # カテゴリ（最上位の permalink）ごとの背景色
    colors = {
      "kitchen" => "#f1e4d3",
      "air-and-climate" => "#dde9ee",
      "garment-care" => "#e7e1ee",
      "floor-care" => "#e3ead9",
      "personal-care" => "#f2dde0"
    }
    created = 0
    products = Mobility.with_locale(:en) do
      Spree::Product.all.select { |product| product.media.empty? && product.variant_images.empty? }
    end

    products.each do |product|
      color = Mobility.with_locale(:en) do
        top = product.categories.first&.permalink.to_s.split("/").first
        colors.fetch(top, "#e9e9e9")
      end
      name = Mobility.with_locale(:ja) { product.name }
      # 長い商品名は 2 行に分ける
      # 空白があればその位置で、なければ真ん中で分ける
      split = name.index(" ", name.length / 2 - 3) || (name.length + 1) / 2
      lines = name.length > 12 ? [ name[0, split].strip, name[split..].strip ] : [ name ]
      texts = lines.each_with_index.map do |line, i|
        y = 420 + (i * 64) - ((lines.size - 1) * 32)
        %(<text x="400" y="#{y}" font-size="52" text-anchor="middle" fill="#3a3a3a">#{ERB::Util.html_escape(line)}</text>)
      end

      svg = <<~SVG
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" font-family="Hiragino Sans, sans-serif">
          <rect width="800" height="800" fill="#{color}"/>
          <circle cx="400" cy="400" r="300" fill="#ffffff" fill-opacity="0.45"/>
          #{texts.join("\n  ")}
        </svg>
      SVG

      Dir.mktmpdir do |dir|
        svg_path = File.join(dir, "image.svg")
        png_path = File.join(dir, "#{product.slug}.png")
        File.write(svg_path, svg)
        system("rsvg-convert", "-o", png_path, svg_path, exception: true)

        media = product.media.new(alt: name, media_type: "image", store: Spree::Store.default)
        media.attachment.attach(io: File.open(png_path), filename: "#{product.slug}.png", content_type: "image/png")
        media.save!
      end
      created += 1
    end

    puts "画像のない商品 #{created} 件にプレースホルダー画像を付けました"
  end
end
