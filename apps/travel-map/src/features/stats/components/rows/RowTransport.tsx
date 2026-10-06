import "./RowTransport.scss";

import { Ferry, Flight } from "@travelmap/core";
import { ReactNode } from "react";

import AirplaneIcon from "@/assets/icons/Airplane.svg?react";
import FerryIcon from "@/assets/icons/Ferry.svg?react";
import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { Row } from "@/shared/components/Row/Row";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";
import { formatMileage } from "@/shared/lib/format";

/**
 * Properties accepted by the TransportRow component.
 * @property {string} [className] - The class name
 * @property {Flight | Ferry} transport - The transport
 */
interface TransportRowProps {
  className?: string;
  transport: Flight | Ferry;
}

/**
 * TransportRow component
 * Displays a flight or ferry route with its distance.
 * @component
 * @param {TransportRowProps} props - The transport row props
 * @param {Flight | Ferry} props.transport - Transport route to display
 * @param {string} [props.className=""] - Additional class names
 * @returns {ReactNode} The transport row
 */
export function TransportRow({
  transport,
  className = "",
}: TransportRowProps): ReactNode {
  const { currLanguage } = useLanguage(["home"]);
  const isFerry = transport instanceof Ferry;
  const TransportIcon = isFerry ? FerryIcon : AirplaneIcon;
  return (
    <Row className={classNames("transport-row", className, "row--wrap")}>
      <div className="transport-row__cities">
        <h2 className="transport-row__cities__city">
          <CountryFlag countryId={transport.sCity.country.id} />
          {transport.sCity.getLocalizedName(currLanguage)}
        </h2>
        <TransportIcon
          className={classNames(
            "transport-row__icon",
            `transport-row__icon--${isFerry ? "ferry" : "flight"}`,
          )}
        />
        <h2 className="transport-row__cities__city">
          <CountryFlag countryId={transport.eCity.country.id} />
          {transport.eCity.getLocalizedName(currLanguage)}
        </h2>
      </div>
      <b className="transport-row__distance">
        {formatMileage(transport.distanceInKm, currLanguage)} km
      </b>
    </Row>
  );
}
