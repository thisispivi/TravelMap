import "./RowTransport.scss";
import { CountryFlag } from "../../atoms";
import { Ferry } from "@/core/classes/Ferry";
import { Flight } from "../../../core";
import { JSX } from "react";
import { PlaneIcon } from "../../../assets";
import { formatMileage } from "../../../utils/format";
import { useLanguage } from "../../../hooks/language/language";
import { Row } from "./Row";

interface TransportRowProps {
  className?: string;
  transport: Flight | Ferry;
}

/**
 * A transport row
 *
 * The transport row component is used to create a transport row.
 *
 * @component
 *
 * @param {TransportRowProps} props - The props of the component
 * @param {string} props.className - The class to apply to the transport row
 * @param {Flight | Ferry} props.transport - The transport
 * @returns {JSX.Element} - The transport row
 */
export function TransportRow({
  transport,
  className = "",
}: TransportRowProps): JSX.Element {
  const { t, currLanguage } = useLanguage(["home"]);
  return (
    <Row className={`transport-row ${className} row--wrap`}>
      <div className="transport-row__cities">
        <h2 className="transport-row__cities__city">
          <CountryFlag countryId={transport.sCity.country.id} />
          {t(`cities.${transport.sCity.name}`)}
        </h2>
        <PlaneIcon className="transport-row__icon" />
        <h2 className="transport-row__cities__city">
          <CountryFlag countryId={transport.eCity.country.id} />
          {t(`cities.${transport.eCity.name}`)}
        </h2>
      </div>
      <b className="transport-row__distance">
        {formatMileage(transport.distanceInKm, currLanguage)} km
      </b>
    </Row>
  );
}
