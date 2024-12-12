import { DistanceIcon } from "../../../assets";
import { City } from "../../../core/classes/City";
import { Muravera } from "../../../data/Italy/Muravera/Muravera";
import { haversineDistance } from "../../../utils/distance";
import { CountryFlag } from "../../atoms";
import Row from "./Row";
import "./RowCity.scss";

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
export default function CityRow({
  sCity = Muravera,
  eCity,
  className = "",
}: CityRowProps): JSX.Element {
  const distanceInKm = haversineDistance(
    sCity.coordinates[1],
    sCity.coordinates[0],
    eCity.coordinates[1],
    eCity.coordinates[0]
  );
  return (
    <Row className={`city-row ${className} row--wrap`}>
      <div className="city-row__city">
        <b>
          <CountryFlag countryId={sCity.country.id} />
          {sCity.name}
        </b>
        <DistanceIcon className="city-row__icon" />
        <b>
          <CountryFlag countryId={eCity.country.id} />
          {eCity.name}
        </b>
      </div>
      <b className="city-row__distance">{distanceInKm.toFixed(2)} km</b>
    </Row>
  );
}
