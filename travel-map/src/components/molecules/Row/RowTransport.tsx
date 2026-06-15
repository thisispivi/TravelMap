import "./RowTransport.scss";

import { ReactNode } from "react";

import { AirplaneIcon, FerryIcon } from "../../../assets";
import { Ferry, Flight } from "../../../core";
import { useLanguage } from "../../../hooks/language/language";
import { classNames } from "../../../utils/className";
import { formatMileage } from "../../../utils/format";
import { CountryFlag } from "../../atoms";
import { Row } from "./Row";

interface TransportRowProps {
  className?: string;
  transport: Flight | Ferry;
}

/**
 * TransportRow component
 *
 * Displays a flight or ferry route with its distance.
 *
 * @component
 *
 * @param {TransportRowProps} props - The transport row props
 * @param {string} [props.className] - Additional class names
 * @param {Flight | Ferry} props.transport - Transport route to display
 * @returns {ReactNode} The transport row
 */
export function TransportRow({
  transport,
  className = "",
}: TransportRowProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const isFerry = transport instanceof Ferry;
  const TransportIcon = isFerry ? FerryIcon : AirplaneIcon;
  return (
    <Row className={classNames("transport-row", className, "row--wrap")}>
      <div className="transport-row__cities">
        <h2 className="transport-row__cities__city">
          <CountryFlag countryId={transport.sCity.country.id} />
          {t(`cities.${transport.sCity.name}`)}
        </h2>
        <TransportIcon
          className={classNames(
            "transport-row__icon",
            `transport-row__icon--${isFerry ? "ferry" : "flight"}`,
          )}
        />
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
