import { PlaneIcon } from "../../../assets";
import { Flight } from "../../../core";
import useLanguage from "../../../hooks/language/language";
import { formatMileage } from "../../../utils/format";
import { CountryFlag } from "../../atoms";
import Row from "./Row";
import "./RowFlight.scss";
import { JSX } from "react";

interface FlightRowProps {
  className?: string;
  flight: Flight;
}

/**
 * A flight row
 *
 * The flight row component is used to create a flight row.
 *
 * @component
 *
 * @param {FlightRowProps} props - The props of the component
 * @param {string} props.className - The class to apply to the flight row
 * @param {Flight} props.flight - The flight
 * @returns {JSX.Element} - The flight row
 */
export default function FlightRow({
  flight,
  className = "",
}: FlightRowProps): JSX.Element {
  const { t, currLanguage } = useLanguage(["home"]);
  return (
    <Row className={`flight-row ${className} row--wrap`}>
      <div className="flight-row__cities">
        <h2 className="flight-row__cities__city">
          <CountryFlag countryId={flight.sCity.country.id} />
          {t(`cities.${flight.sCity.name}`)}
        </h2>
        <PlaneIcon className="flight-row__icon" />
        <h2 className="flight-row__cities__city">
          <CountryFlag countryId={flight.eCity.country.id} />
          {t(`cities.${flight.eCity.name}`)}
        </h2>
      </div>
      <b className="flight-row__distance">
        {formatMileage(flight.distanceInKm, currLanguage)} km
      </b>
    </Row>
  );
}
