import { ReactNode } from "react";

import AustraliaFlag from "@/assets/icons/flags/Australia.svg?react";
import AustriaFlag from "@/assets/icons/flags/Austria.svg?react";
import BelgiumFlag from "@/assets/icons/flags/Belgium.svg?react";
import BulgariaFlag from "@/assets/icons/flags/Bulgaria.svg?react";
import ChinaFlag from "@/assets/icons/flags/China.svg?react";
import FranceFlag from "@/assets/icons/flags/France.svg?react";
import GermanyFlag from "@/assets/icons/flags/Germany.svg?react";
import HungaryFlag from "@/assets/icons/flags/Hungary.svg?react";
import ItalyFlag from "@/assets/icons/flags/Italy.svg?react";
import JapanFlag from "@/assets/icons/flags/Japan.svg?react";
import LuxembourgFlag from "@/assets/icons/flags/Luxembourg.svg?react";
import MaltaFlag from "@/assets/icons/flags/Malta.svg?react";
import MonacoFlag from "@/assets/icons/flags/Monaco.svg?react";
import PortugalFlag from "@/assets/icons/flags/Portugal.svg?react";
import RomaniaFlag from "@/assets/icons/flags/Romania.svg?react";
import SlovakiaFlag from "@/assets/icons/flags/Slovakia.svg?react";
import SpainFlag from "@/assets/icons/flags/Spain.svg?react";
import SwedenFlag from "@/assets/icons/flags/Sweden.svg?react";
import UnitedKingdomFlag from "@/assets/icons/flags/UnitedKingdom.svg?react";
import VaticanFlag from "@/assets/icons/flags/Vatican.svg?react";

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
 * @returns {ReactNode} The country flag
 */
export function CountryFlag({
  countryId,
  className = "",
}: CountryFlagProps): ReactNode {
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
    case "Austria":
      return <AustriaFlag className={className} />;
    case "Australia":
      return <AustraliaFlag className={className} />;
    case "Bulgaria":
      return <BulgariaFlag className={className} />;
    case "China":
      return <ChinaFlag className={className} />;
    case "Monaco":
      return <MonacoFlag className={className} />;
    case "France":
      return <FranceFlag className={className} />;
    case "Romania":
      return <RomaniaFlag className={className} />;
    case "Slovakia":
      return <SlovakiaFlag className={className} />;
    case "Sweden":
      return <SwedenFlag className={className} />;
    case "Luxembourg":
      return <LuxembourgFlag className={className} />;
    default:
      return null;
  }
}
