import type { CustomField } from "@spree/sdk";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import { ProductCustomFields } from "@/components/products/ProductCustomFields";
import en from "../../../../messages/en.json";
import ja from "../../../../messages/ja.json";

const field = (key: string, label: string, value: string): CustomField => ({
  id: key,
  key,
  label,
  field_type: "short_text",
  value,
});

const customFields = [
  field("custom.warranty", "Warranty", "2 Years"),
  field("custom.runtime", "Runtime", "120 minutes"),
  field("custom.room_coverage", "Room Coverage", "Up to 25m²"),
  field("custom.voltage", "Voltage", "18V Lithium"),
  field("custom.connectivity", "Connectivity", "WiFi + App"),
  field("custom.wattage", "Wattage", "2000W"),
  field("custom.color_code", "Color Code", "Matte"),
];

const renderWith = (locale: Locale, messages: typeof en) =>
  render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ProductCustomFields customFields={customFields} />
    </NextIntlClientProvider>,
  );

describe("ProductCustomFields", () => {
  it("translates known labels and value patterns", () => {
    renderWith("ja", ja);

    expect(screen.getByText("保証期間")).toBeInTheDocument();
    expect(screen.getByText("2 年")).toBeInTheDocument();
    expect(screen.getByText("120 分")).toBeInTheDocument();
    expect(screen.getByText("最大 25m²")).toBeInTheDocument();
    expect(screen.getByText("18V リチウム")).toBeInTheDocument();
    expect(screen.getByText("Wi-Fi + アプリ")).toBeInTheDocument();
  });

  it("leaves unknown labels and plain values as they are", () => {
    renderWith("ja", ja);

    expect(screen.getByText("2000W")).toBeInTheDocument();
    expect(screen.getByText("Color Code")).toBeInTheDocument();
    expect(screen.getByText("Matte")).toBeInTheDocument();
  });

  it("keeps the original English text in English", () => {
    renderWith("en", en);

    expect(screen.getByText("Room Coverage")).toBeInTheDocument();
    expect(screen.getByText("2 Years")).toBeInTheDocument();
    expect(screen.getByText("120 minutes")).toBeInTheDocument();
    expect(screen.getByText("WiFi + App")).toBeInTheDocument();
  });
});
