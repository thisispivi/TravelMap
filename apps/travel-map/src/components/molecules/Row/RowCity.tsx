import "./RowCity.scss";

import { City } from "@travelmap/core";
import { ReactNode } from "react";

import DistanceIcon from "@/assets/icons/Distance.svg?react";
import { CountryFlag } from "@/components/atoms/CountryFlag/CountryFlag";

import { useLanguage } from "../../../hooks/language/language";
import { getCitiesDistance } from "../../../utils/distance";
import { formatMileage } from "../../../utils/format";
import { Row } from "./Row";

/**
 * Properties accepted by the CityRow component.
 * @property {string} [className] - The class name
 * @property {City} [sCity] - The origin city
 * @property {City} eCity - The destination city
 */
interface CityRowProps {
  className?: string;
  sCity?: City;
  eCity: City;
}

/**
 * CityRow component
 * Displays a start city, end city, and their distance.
 * @component
 * @param {CityRowProps} props - The city row props
 * @param {City} [props.sCity] - The start city
 * @param {City} props.eCity - The end city
 * @param {string} [props.className=""] - Additional class names
 * @returns {ReactNode} The city row
 */
export function CityRow({
  sCity,
  eCity,
  className = "",
}: CityRowProps): ReactNode {
  const { currLanguage } = useLanguage(["home"]);
  if (!sCity) return null;
  const distanceInKm = getCitiesDistance(sCity, eCity);
  return (
    <Row className={`city-row ${className} row--wrap`}>
      <div className="city-row__cities">
        <p className="city-row__cities__city">
          <CountryFlag countryId={sCity.country.id} />
          {sCity.getLocalizedName(currLanguage)}
        </p>
        <DistanceIcon className="city-row__icon" />
        <p className="city-row__cities__city">
          <CountryFlag countryId={eCity.country.id} />
          {eCity.getLocalizedName(currLanguage)}
        </p>
      </div>
      <b className="city-row__distance">
        {formatMileage(distanceInKm, currLanguage)} km
      </b>
    </Row>
  );
}
