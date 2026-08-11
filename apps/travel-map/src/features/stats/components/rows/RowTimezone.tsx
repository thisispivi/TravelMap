import "./RowTimezone.scss";

import { City } from "@travelmap/core";
import { ReactNode } from "react";

import ChevronRightIcon from "@/assets/icons/ChevronRight.svg?react";
import { visitedTrips } from "@/data/world";
import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { Row } from "@/shared/components/Row/Row";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";
import { formatDeltaVsCityForDateSpan } from "@/shared/lib/timezoneOffset";
import { getCityTravels } from "@/shared/lib/travelQueries";

/**
 * Properties accepted by the TimezoneRow component.
 * @property {string} [className] - The class name
 * @property {City} sCity - The origin city
 * @property {City} eCity - The destination city
 * @property {Date} [sDate] - The departure date
 * @property {Date} [eDate] - The arrival date
 */
interface TimezoneRowProps {
  className?: string;
  sCity: City;
  eCity: City;
  sDate?: Date;
  eDate?: Date;
}

/**
 * TimezoneRow component
 * Displays the timezone offset between two cities.
 * @component
 * @param {TimezoneRowProps} props - The timezone row props
 * @param {City} props.sCity - Start city
 * @param {City} props.eCity - End city
 * @param {Date} [props.sDate] - Start date for offset calculation
 * @param {Date} [props.eDate] - End date for offset calculation
 * @param {string} [props.className=""] - Additional class names
 * @returns {ReactNode} The timezone row
 */
export function TimezoneRow({
  sCity,
  eCity,
  sDate,
  eDate,
  className = "",
}: TimezoneRowProps): ReactNode {
  const { currLanguage } = useLanguage(["home"]);
  const firstTravel = getCityTravels(eCity, visitedTrips)[0];
  const startDate = sDate ?? firstTravel?.sDate ?? new Date();
  const endDate = eDate ?? firstTravel?.eDate ?? startDate;

  return (
    <Row className={classNames("timezone-row", className, "row--wrap")}>
      <div className="timezone-row__cities">
        <h2 className="timezone-row__cities__city">
          <CountryFlag countryId={sCity.country.id} />
          {sCity.getLocalizedName(currLanguage)}
        </h2>
        <ChevronRightIcon className="timezone-row__icon" />
        <h2 className="timezone-row__cities__city">
          <CountryFlag countryId={eCity.country.id} />
          {eCity.getLocalizedName(currLanguage)}
        </h2>
      </div>
      <b className="timezone-row__distance">
        {formatDeltaVsCityForDateSpan(
          currLanguage,
          eCity,
          sCity,
          startDate,
          endDate,
        )}
      </b>
    </Row>
  );
}
