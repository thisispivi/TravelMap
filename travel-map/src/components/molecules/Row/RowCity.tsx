import { DistanceIcon } from "../../../assets";
import { City } from "../../../core/classes/City";
import { Muravera } from "../../../data/cities/Cagliari/Cagliari";
import { haversineDistance } from "../../../utils/distance";
import { CountryFlag } from "../../atoms";
import Row from "./Row";
import "./RowCity.scss";

interface CityRowProps {
  className?: string;
  sCity?: City;
  eCity: City;
}

export default function CityRow({
  sCity = Muravera,
  eCity,
  className = "",
}: CityRowProps): JSX.Element {
  const distanceInKm = haversineDistance(
    sCity.coordinates[1],
    sCity.coordinates[0],
    eCity.coordinates[1],
    eCity.coordinates[0],
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
