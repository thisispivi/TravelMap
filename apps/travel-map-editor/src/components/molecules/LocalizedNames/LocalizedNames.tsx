import { useLanguage } from "@app/shared/hooks/useLanguage";
import { ReactNode } from "react";
import { Link } from "react-router";

import { locales } from "../../../core/dataset";
import { TextField } from "../../atoms/Fields/Fields";

/**
 * A canonical name with its optional per-locale overrides.
 * @property {string} name - Canonical name
 * @property {Record<string, string>} [nameByLocale] - Locale-specific names
 */
export interface LocalizedValue {
  name: string;
  nameByLocale?: Record<string, string>;
}

/**
 * LocalizedNames component
 * Edits the canonical name plus one field per locale configured for the fork.
 * An override is dropped when cleared so the canonical name stays the single
 * source of truth.
 * @component
 * @param {LocalizedNamesProps} props
 * @param {string} props.canonicalHint - Explains what the canonical name is used for
 * @param {string} props.label - Panel heading
 * @param {(names: LocalizedValue) => void} props.onChange - Name update callback
 * @param {LocalizedValue} props.value - Current names
 * @returns {ReactNode} The name inputs
 */
export function LocalizedNames({
  canonicalHint,
  label,
  onChange,
  value,
}: LocalizedNamesProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const configuredLocales = locales();

  /**
   * Updates one locale override, removing it when the field is cleared.
   * @param {string} locale - Locale tag
   * @param {string} text - New text
   * @returns {void}
   */
  function handleLocaleChange(locale: string, text: string): void {
    const nameByLocale = { ...value.nameByLocale };
    if (text) nameByLocale[locale] = text;
    else delete nameByLocale[locale];
    onChange({
      ...value,
      nameByLocale:
        Object.keys(nameByLocale).length > 0 ? nameByLocale : undefined,
    });
  }
  return (
    <section className="editor-panel">
      <h2 className="editor-panel__legend">{label}</h2>
      <TextField
        hint={canonicalHint}
        label={t("localizedNames.canonical")}
        onChange={(name) => onChange({ ...value, name })}
        value={value.name}
      />
      {configuredLocales.length > 0 ? (
        <div className="editor-panel__row">
          {configuredLocales.map((locale) => (
            <TextField
              key={locale}
              label={locale}
              onChange={(text) => handleLocaleChange(locale, text)}
              value={value.nameByLocale?.[locale] ?? ""}
            />
          ))}
        </div>
      ) : (
        <p className="editor-panel__hint">
          {t("localizedNames.noLocalesBefore")}{" "}
          <Link to="/config">{t("nav.configuration")}</Link>{" "}
          {t("localizedNames.noLocalesAfter")}
        </p>
      )}
    </section>
  );
}

/**
 * Props for LocalizedNames.
 * @property {string} canonicalHint - Explains what the canonical name is used for
 * @property {string} label - Panel heading
 * @property {(names: LocalizedValue) => void} onChange - Name update callback
 * @property {LocalizedValue} value - Current names
 */
interface LocalizedNamesProps {
  canonicalHint: string;
  label: string;
  onChange: (names: LocalizedValue) => void;
  value: LocalizedValue;
}
