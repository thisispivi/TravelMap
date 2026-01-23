import "./RowTimezone.scss";
import { Row } from "./Row";
import { City } from "../../../core";
import { CountryFlag } from "../../atoms";
import { JSX } from "react";
import { PlaneIcon } from "../../../assets";
import { formatDeltaVsCityForDateSpan } from "@/utils/timezoneOffset";
import { useLanguage } from "../../../hooks/language/language";

interface TimezoneRowProps {
  className?: string;
  sCity: City;
  eCity: City;
  sDate?: Date;
  eDate?: Date;
}

/**
 * A timezone row
 *
 * The timezone row component is used to create a timezone row.
 *
 * @component
 *
 * @param {TimezoneRowProps} props - The props of the component
 * @param {string} props.className - The class to apply to the timezone row
 * @param {City} props.sCity - The start country
 * @param {City} props.eCity - The end country
 * @returns {JSX.Element} - The timezone row
 */
export function TimezoneRow({
  sCity,
  eCity,
  sDate,
  eDate,
  className = "",
}: TimezoneRowProps): JSX.Element {
  const { t, currLanguage } = useLanguage(["home"]);
  const startDate = sDate ?? eCity.travels?.[0]?.sDate ?? new Date();
  const endDate = eDate ?? eCity.travels?.[0]?.eDate ?? startDate;

  return (
    <Row className={`timezone-row ${className} row--wrap`}>
      <div className="timezone-row__cities">
        <h2 className="timezone-row__cities__city">
          <CountryFlag countryId={sCity.country.id} />
          {sCity.getName(t)}
        </h2>
        <PlaneIcon className="timezone-row__icon" />
        <h2 className="timezone-row__cities__city">
          <CountryFlag countryId={eCity.country.id} />
          {eCity.getName(t)}
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
