import {
  BelgiumFlag,
  GermanyFlag,
  HungaryFlag,
  ItalyFlag,
  SpainFlag,
  UnitedKingdomFlag,
  JapanFlag,
  PortugalFlag,
  MaltaFlag,
  VaticanFlag,
} from "../../../assets";

interface CountryFlagProps {
  countryId: string;
  className?: string;
}

/**
 * CountryFlag component
 *
 * Given a country name, it returns the flag of the country
 *
 * @component
 *
 * @param {CountryFlagProps} props - The props of the component
 * @param {string} props.countryId - The id of the country
 * @param {string} [props.className=""] - The class name of the component
 * @returns {JSX.Element|null} The country flag
 */
export default function CountryFlag({
  countryId,
  className = "",
}: CountryFlagProps): JSX.Element | null {
  switch (countryId.replace(" ", "")) {
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
    case "Japan":
      return <JapanFlag className={className} />;
    case "Portugal":
      return <PortugalFlag className={className} />;
    case "Malta":
      return <MaltaFlag className={className} />;
    case "Vatican":
      return <VaticanFlag className={className} />;
    default:
      return null;
  }
}
