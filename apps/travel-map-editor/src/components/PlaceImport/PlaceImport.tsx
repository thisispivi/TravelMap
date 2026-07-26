import "./PlaceImport.scss";

import PositionIcon from "@app/assets/icons/Position.svg?react";
import { ReactNode, useState } from "react";

import { ParsedPlace, parseGoogleMapsUrl } from "../../geo";

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
          ? "Short links cannot be read. Open it in Google Maps and copy the full URL."
          : "No coordinates found in that link.",
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
        <span className="editor-field__label">Import from Google Maps</span>
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
            placeholder="Paste a maps link or 41.9028, 12.4964"
            type="text"
            value={link}
          />
          <button
            className="editor-button editor-button--primary"
            disabled={!link.trim()}
            onClick={handleImport}
            type="button"
          >
            Use
          </button>
        </div>
      </label>
      {parsed ? (
        <p className="place-import__preview">
          {parsed.name ? <strong>{parsed.name}</strong> : null} Longitude{" "}
          {parsed.coordinates[0].toFixed(5)}, latitude{" "}
          {parsed.coordinates[1].toFixed(5)}
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
