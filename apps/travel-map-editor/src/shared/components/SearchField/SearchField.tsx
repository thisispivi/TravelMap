import "./SearchField.scss";

import { Search } from "lucide-react";
import { ReactNode } from "react";

/**
 * Properties accepted by the SearchField component.
 * @property {string} label - Accessible name and placeholder
 * @property {(value: string) => void} onChange - Receives the typed query
 * @property {string} value - The current query
 */
interface SearchFieldProps {
  label: string;
  onChange: (value: string) => void;
  value: string;
}

/**
 * SearchField component
 * The filter box at the head of a list panel, such as the trips or the places.
 * @component
 * @param {SearchFieldProps} props - The field props
 * @param {string} props.label - Accessible name and placeholder
 * @param {(value: string) => void} props.onChange - Receives the typed query
 * @param {string} props.value - The current query
 * @returns {ReactNode} A labelled search input
 */
export function SearchField({
  label,
  onChange,
  value,
}: SearchFieldProps): ReactNode {
  return (
    <label className="search-field">
      <Search aria-hidden="true" className="search-field__icon" />
      <input
        aria-label={label}
        className="search-field__input"
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        type="search"
        value={value}
      />
    </label>
  );
}
