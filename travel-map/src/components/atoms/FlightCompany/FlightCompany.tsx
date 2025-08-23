import {
  AirOneLogo,
  AlitaliaLogo,
  AllNipponAirwaysLogo,
  EasyJetLogo,
  ItaAirwaysLogo,
  RyanairLogo,
  VoloteaLogo,
  WizzAirLogo,
} from "../../../assets";
import { JSX } from "react";
import { FlightCompany as FlightCompanyCore } from "@/core";

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
          className={`flight-company--${FlightCompanyCore.RYANAIR} ${className}`}
        />
      );
    case FlightCompanyCore.ALL_NIPPON_AIRWAYS:
      return (
        <AllNipponAirwaysLogo
          className={`flight-company--${FlightCompanyCore.ALL_NIPPON_AIRWAYS} ${className}`}
        />
      );
    case FlightCompanyCore.ITA_AIRWAYS:
      return (
        <ItaAirwaysLogo
          className={`flight-company--${FlightCompanyCore.ITA_AIRWAYS} ${className}`}
        />
      );
    case FlightCompanyCore.EASYJET:
      return (
        <EasyJetLogo
          className={`flight-company--${FlightCompanyCore.EASYJET} ${className}`}
        />
      );
    case FlightCompanyCore.VOLOTEA:
      return (
        <VoloteaLogo
          className={`flight-company--${FlightCompanyCore.VOLOTEA} ${className}`}
        />
      );
    case FlightCompanyCore.WIZZ_AIR:
      return (
        <WizzAirLogo
          className={`flight-company--${FlightCompanyCore.WIZZ_AIR} ${className}`}
        />
      );
    case FlightCompanyCore.AIR_ONE:
      return (
        <AirOneLogo
          className={`flight-company--${FlightCompanyCore.AIR_ONE} ${className}`}
        />
      );
    case FlightCompanyCore.ALITALIA:
      return (
        <AlitaliaLogo
          className={`flight-company--${FlightCompanyCore.ALITALIA} ${className}`}
        />
      );
    default:
      return null;
  }
}
