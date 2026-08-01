import "./PlaceImport.scss";

import PositionIcon from "@app/assets/icons/Position.svg?react";
import { useLanguage } from "@app/hooks/language/language";
import { ReactNode, useState } from "react";

import { ParsedPlace, parseGoogleMapsUrl } from "../../../core/geo";

/**
 * PlaceImport component
 * Reads a location out of a pasted Google Maps link, so coordinates are copied
 * rather than transcribed. Short goo.gl links are rejected because resolving
 * them needs a network round trip the editor deliberately avoids.
 * @component
 * @param {PlaceImportProps} props
 * @param {(place: ParsedPlace) => void} props.onImport - Called with the parsed location
 * @returns {ReactNode} The link import control
 */
export function PlaceImport({ onImport }: PlaceImportProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const parsed = parseGoogleMapsUrl(link);

  /**
   * Applies the parsed location, or explains why the link cannot be used.
   * @returns {void}
   */
  function handleImport(): void {
    if (!parsed) {
      setError(
        link.includes("goo.gl")
          ? t("placeImport.shortLinkError")
          : t("placeImport.noCoordinatesError"),
      );
      return;
    }
    onImport(parsed);
    setError("");
    setLink("");
  }
  return (
    <div className="place-import">
      <label className="editor-field place-import__field">
        <span className="editor-field__label">{t("placeImport.title")}</span>
        <div className="place-import__row">
          <PositionIcon aria-hidden="true" className="place-import__icon" />
          <input
            className="editor-field__control place-import__input"
            onChange={(event) => {
              setLink(event.target.value);
              setError("");
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              handleImport();
            }}
            placeholder={t("placeImport.placeholder")}
            type="text"
            value={link}
          />
          <button
            className="editor-button editor-button--primary"
            disabled={!link.trim()}
            onClick={handleImport}
            type="button"
          >
            {t("placeImport.use")}
          </button>
        </div>
      </label>
      {parsed ? (
        <p className="place-import__preview">
          {parsed.name ? <strong>{parsed.name}</strong> : null}{" "}
          {t("placeImport.preview", {
            latitude: parsed.coordinates[1].toFixed(5),
            longitude: parsed.coordinates[0].toFixed(5),
          })}
        </p>
      ) : null}
      {error ? (
        <p className="editor-notice editor-notice--error place-import__error">
          <span className="editor-notice__item">{error}</span>
        </p>
      ) : null}
    </div>
  );
}

/**
 * Props for PlaceImport.
 * @property {(place: ParsedPlace) => void} onImport - Called with the parsed location
 */
interface PlaceImportProps {
  onImport: (place: ParsedPlace) => void;
}
