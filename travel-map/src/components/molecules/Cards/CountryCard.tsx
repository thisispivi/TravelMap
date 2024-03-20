import { PropsWithChildren } from "react";
import useLanguage from "../../../hooks/language/language";
import "./CountryCard.scss";
import { CountryFlag } from "../../atoms";

interface CountryCardProps extends PropsWithChildren {
  className?: string;
  countryName: string;
}

/**
 * CountryCard component
 *
 * The CountryCard component is a molecule that displays the country name and the content.
 * It also adds a flag based on the country name.
 *
 * @param {CountryCardProps} data - The data that will be used to display the component.
 * @param {string} [data.className=""] - The class name that will be added to the component.
 * @param {string} data.countryName - The country name that will be displayed.
 * @returns {JSX.Element} The CountryCard component
 */
export default function CountryCard({
  className = "",
  countryName,
  children,
}: CountryCardProps): JSX.Element {
  const { t } = useLanguage(["home"]);

  return (
    <div className={`country-card ${className} ${countryName}`}>
      <div className="country-card__header">
        <h2>{t(`countries.${countryName}`)}</h2>
        <CountryFlag countryName={countryName} className="country-flag" />
      </div>
      <div className="country-card__content">{children}</div>
    </div>
  );
}
