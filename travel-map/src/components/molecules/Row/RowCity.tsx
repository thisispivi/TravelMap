import { JSX } from "react";
import { DistanceIcon } from "../../../assets";
import { City } from "../../../core";
import { useLanguage } from "../../../hooks/language/language";
import { getCitiesDistance } from "../../../utils/distance";
import { formatMileage } from "../../../utils/format";
import { CountryFlag } from "../../atoms";
import "./RowCity.scss";
import { Row } from "..";
import { parameters } from "../../../utils/parameters";

interface CityRowProps {
  className?: string;
  sCity?: City;
  eCity: City;
}

/**
 * A city row
 *
 * The city row component is used to create a city row.
 *
 * @component
 *
 * @param {CityRowProps} props - The props of the component
 * @param {string} props.className - The class to apply to the city row
 * @param {City} props.sCity - The start city
 * @param {City} props.eCity - The end city
 * @returns {JSX.Element} - The city row
 */
export function CityRow({
  sCity = parameters.birthCity,
  eCity,
  className = "",
}: CityRowProps): JSX.Element {
  const { t, currLanguage } = useLanguage(["home"]);
  const distanceInKm = getCitiesDistance(sCity, eCity);
  return (
    <Row className={`city-row ${className} row--wrap`}>
      <div className="city-row__cities">
        <p className="city-row__cities__city">
          <CountryFlag countryId={sCity.country.id} />
          {t(`cities.${sCity.name}`)}
        </p>
        <DistanceIcon className="city-row__icon" />
        <p className="city-row__cities__city">
          <CountryFlag countryId={eCity.country.id} />
          {t(`cities.${eCity.name}`)}
        </p>
      </div>
      <b className="city-row__distance">
        {formatMileage(distanceInKm, currLanguage)} km
      </b>
    </Row>
  );
}
