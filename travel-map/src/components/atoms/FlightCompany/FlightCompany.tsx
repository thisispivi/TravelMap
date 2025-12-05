import {
  AirOneLogo,
  AlitaliaLogo,
  AllNipponAirwaysLogo,
  ChinaEasternAirlinesLogo,
  EasyJetLogo,
  ItaAirwaysLogo,
  RyanairLogo,
  VoloteaLogo,
  WizzAirLogo,
  AeroitaliaLogo,
  JetstarLogo,
  VirginAustraliaLogo,
} from "../../../assets";
import { JSX } from "react";
import { FlightCompany as FlightCompanyCore } from "@/core";
import "./FlightCompany.scss";

interface FlightCompanyProps {
  company?: FlightCompanyCore;
  className?: string;
}

/**
 * FlightCompany component
 *
 * Given a company name, it returns the flag of the company
 *
 * @component
 *
 * @param {FlightCompanyProps} props - The props of the component
 * @param {FlightCompanyCore} props.company - The company
 * @param {string} [props.className=""] - The class name of the component
 * @returns {JSX.Element|null} The company flag
 */
export default function FlightCompany({
  company,
  className = "",
}: FlightCompanyProps): JSX.Element | null {
  switch (company) {
    case FlightCompanyCore.RYANAIR:
      return (
        <RyanairLogo
          className={`flight-company flight-company--${FlightCompanyCore.RYANAIR} ${className}`}
        />
      );
    case FlightCompanyCore.ALL_NIPPON_AIRWAYS:
      return (
        <AllNipponAirwaysLogo
          className={`flight-company flight-company--${FlightCompanyCore.ALL_NIPPON_AIRWAYS} ${className}`}
        />
      );
    case FlightCompanyCore.ITA_AIRWAYS:
      return (
        <ItaAirwaysLogo
          className={`flight-company flight-company--${FlightCompanyCore.ITA_AIRWAYS} ${className}`}
        />
      );
    case FlightCompanyCore.EASYJET:
      return (
        <EasyJetLogo
          className={`flight-company flight-company--${FlightCompanyCore.EASYJET} ${className}`}
        />
      );
    case FlightCompanyCore.VOLOTEA:
      return (
        <VoloteaLogo
          className={`flight-company flight-company--${FlightCompanyCore.VOLOTEA} ${className}`}
        />
      );
    case FlightCompanyCore.WIZZ_AIR:
      return (
        <WizzAirLogo
          className={`flight-company flight-company--${FlightCompanyCore.WIZZ_AIR} ${className}`}
        />
      );
    case FlightCompanyCore.AIR_ONE:
      return (
        <AirOneLogo
          className={`flight-company flight-company--${FlightCompanyCore.AIR_ONE} ${className}`}
        />
      );
    case FlightCompanyCore.ALITALIA:
      return (
        <AlitaliaLogo
          className={`flight-company flight-company--${FlightCompanyCore.ALITALIA} ${className}`}
        />
      );
    case FlightCompanyCore.CHINA_EASTERN_AIRLINES:
      return (
        <ChinaEasternAirlinesLogo
          className={`flight-company flight-company--${FlightCompanyCore.CHINA_EASTERN_AIRLINES} ${className}`}
        />
      );
    case FlightCompanyCore.JETSTAR:
      return (
        <JetstarLogo
          className={`flight-company flight-company--${FlightCompanyCore.JETSTAR} ${className}`}
        />
      );
    case FlightCompanyCore.VIRGIN_AUSTRALIA:
      return (
        <VirginAustraliaLogo
          className={`flight-company flight-company--${FlightCompanyCore.VIRGIN_AUSTRALIA} ${className}`}
        />
      );
    case FlightCompanyCore.AEROITALIA:
      return (
        <AeroitaliaLogo
          className={`flight-company flight-company--${FlightCompanyCore.AEROITALIA} ${className}`}
        />
      );
    default:
      return null;
  }
}
