import { PlaneIcon } from "../../../assets";
import { Country } from "../../../core";
import useLanguage from "../../../hooks/language/language";
import { CountryFlag } from "../../atoms";
import Row from "./Row";
import "./RowTimezone.scss";
import { JSX } from "react";

interface TimezoneRowProps {
  className?: string;
  sCountry: Country;
  eCountry: Country;
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
 * @param {Country} props.sCountry - The start country
 * @param {Country} props.eCountry - The end country
 * @returns {JSX.Element} - The timezone row
 */
export default function TimezoneRow({
  sCountry,
  eCountry,
  className = "",
}: TimezoneRowProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  return (
    <Row className={`timezone-row ${className} row--wrap`}>
      <div className="timezone-row__cities">
        <h2 className="timezone-row__cities__city">
          <CountryFlag countryId={sCountry.id} />
          {t(`countries.${sCountry.id}`)}
        </h2>
        <PlaneIcon className="timezone-row__icon" />
        <h2 className="timezone-row__cities__city">
          <CountryFlag countryId={eCountry.id} />
          {t(`countries.${eCountry.id}`)}
        </h2>
      </div>
      <b className="timezone-row__distance">
        {eCountry.timezoneGMT - sCountry.timezoneGMT}h
      </b>
    </Row>
  );
}
