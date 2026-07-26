import { ReactNode, SyntheticEvent } from "react";

/**
 * Properties accepted by the CountryFlag component.
 * @property {string} countryId - The country id
 * @property {string} [className] - The class name
 */
interface CountryFlagProps {
  countryId: string;
  className?: string;
}

/**
 * Hides an unavailable flag instead of leaving a broken-image glyph in the UI.
 * @param {SyntheticEvent<HTMLImageElement>} event - The failed image event
 * @returns {void}
 */
function handleImageError(event: SyntheticEvent<HTMLImageElement>): void {
  event.currentTarget.hidden = true;
}

/**
 * CountryFlag component
 * Loads a country flag lazily from the public assets so a fork can use any
 * supported country id without adding a React import.
 * @component
 * @param {CountryFlagProps} props - The props of the component
 * @param {string} props.countryId - The id of the country
 * @param {string} [props.className=""] - The class name of the component
 * @returns {ReactNode} The country flag
 */
export function CountryFlag({
  countryId,
  className = "",
}: CountryFlagProps): ReactNode {
  return (
    <img
      alt=""
      aria-hidden="true"
      className={className}
      onError={handleImageError}
      src={`/flags/${countryId}.svg`}
    />
  );
}
