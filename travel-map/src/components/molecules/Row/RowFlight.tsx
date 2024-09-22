import { PlaneIcon } from "../../../assets";
import { Flight } from "../../../core/classes/Flight";
import { CountryFlag } from "../../atoms";
import Row from "./Row";
import "./RowFlight.scss";

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
  return (
    <Row className={`flight-row ${className} row--wrap`}>
      <div className="flight-row__city">
        <b>
          <CountryFlag countryId={flight.sCity.country.id} />
          {flight.sCity.name}
        </b>
        <PlaneIcon className="flight-row__icon" />
        <b>
          <CountryFlag countryId={flight.eCity.country.id} />
          {flight.eCity.name}
        </b>
      </div>
      <b className="flight-row__distance">
        {flight.distanceInKm.toFixed(2)} km
      </b>
    </Row>
  );
}
