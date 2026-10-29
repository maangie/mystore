import type { CustomField } from "@spree/sdk";
import { useTranslations } from "next-intl";

interface ProductCustomFieldsProps {
  customFields?: Array<CustomField>;
}

type ProductsTranslator = ReturnType<typeof useTranslations<"products">>;

// Spree custom fields have no per-locale storage, so the storefront translates
// the values that follow a known pattern and leaves model numbers and units as-is.
const VALUE_PATTERNS: Array<{
  pattern: RegExp;
  key: string;
  params: (match: RegExpMatchArray) => Record<string, string | number>;
}> = [
  {
    pattern: /^(\d+) Years?$/,
    key: "years",
    params: (match) => ({ count: Number(match[1]) }),
  },
  {
    pattern: /^(\d+) minutes?$/,
    key: "minutes",
    params: (match) => ({ count: Number(match[1]) }),
  },
  {
    pattern: /^Up to (.+)$/,
    key: "upTo",
    params: (match) => ({ value: match[1] }),
  },
  {
    pattern: /^(.+) Lithium$/,
    key: "lithium",
    params: (match) => ({ value: match[1] }),
  },
  {
    pattern: /^App$/,
    key: "app",
    params: () => ({}),
  },
  {
    pattern: /^WiFi \+ App$/,
    key: "wifiApp",
    params: () => ({}),
  },
];

const translateLabel = (field: CustomField, t: ProductsTranslator): string => {
  const key = `customFieldLabels.${field.key}`;
  return t.has(key) ? t(key) : field.label;
};

const translateText = (value: string, t: ProductsTranslator): string => {
  for (const { pattern, key, params } of VALUE_PATTERNS) {
    const match = value.match(pattern);
    if (match) {
      return t(`customFieldValues.${key}`, params(match));
    }
  }
  return value;
};

function renderBooleanValue(
  value: unknown,
  t: ReturnType<typeof useTranslations<"products">>,
): React.ReactNode {
  return value ? t("yes") : t("no");
}

function renderValue(
  field: CustomField,
  t: ReturnType<typeof useTranslations<"products">>,
): React.ReactNode {
  switch (field.field_type) {
    case "boolean":
      return renderBooleanValue(field.value, t);
    case "json":
      return typeof field.value === "string"
        ? field.value
        : JSON.stringify(field.value);
    case "rich_text":
      // Value is admin-authored HTML from the Spree CMS backend (trusted source)
      return <span dangerouslySetInnerHTML={{ __html: field.value ?? "" }} />;
    case "short_text":
      return translateText(String(field.value), t);
    case "long_text":
    case "number":
      return String(field.value);
    default:
      return String(field.value);
  }
}

export function ProductCustomFields({
  customFields,
}: ProductCustomFieldsProps): React.JSX.Element | null {
  const t = useTranslations("products");

  if (!customFields || customFields.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border-t pt-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {t("properties")}
      </h2>
      <dl className="space-y-3">
        {customFields.map((field) => (
          <div key={field.id} className="flex">
            <dt className="w-32 shrink-0 text-gray-500 text-sm">
              {translateLabel(field, t)}
            </dt>
            <dd className="text-gray-900 text-sm min-w-0">
              {renderValue(field, t)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
