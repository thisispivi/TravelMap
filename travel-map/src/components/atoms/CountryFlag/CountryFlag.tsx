import {
  BelgiumFlag,
  GermanyFlag,
  HungaryFlag,
  ItalyFlag,
  SpainFlag,
  UnitedKingdomFlag,
} from "../../../assets";

interface CountryFlagProps {
  countryName: string;
  className?: string;
}

/**
 * CountryFlag component
 *
 * Given a country name, it returns the flag of the country
 *
 * @component
 *
 * @param {string} countryName - The name of the country
 * @param {string} [className=""] - The class name of the component
 * @returns {JSX.Element} The country flag
 */
export default function CountryFlag({
  countryName,
  className = "",
}: CountryFlagProps): JSX.Element {
  switch (countryName) {
    case "Germany":
      return <GermanyFlag className={className} />;
    case "Italy":
      return <ItalyFlag className={className} />;
    case "Spain":
      return <SpainFlag className={className} />;
    case "UnitedKingdom":
      return <UnitedKingdomFlag className={className} />;
    case "Belgium":
      return <BelgiumFlag className={className} />;
    case "Hungary":
      return <HungaryFlag className={className} />;
    default:
      return <></>;
  }
}
