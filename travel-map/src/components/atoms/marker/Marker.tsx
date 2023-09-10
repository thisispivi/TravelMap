import { City } from "../../../classes/City";
import { Marker as MarkerMap } from "react-simple-maps";
import MarkerIcon from "../../../icons/Marker";
import "./Marker.scss";

interface MarkerProps {
  city: City;
  hoveredCity?: City;
  setHoveredCity: (city: City | undefined) => void;
}

export function Marker({ city, hoveredCity, setHoveredCity }: MarkerProps) {
  return (
    <MarkerMap
      id={city.name + "-marker"}
      key={city.name}
      coordinates={city.coordinates}
      data-tooltip-id={city.name}
      onMouseEnter={() => setHoveredCity(city)}
      onMouseLeave={() => setHoveredCity(undefined)}
    >
      <MarkerIcon active={hoveredCity?.name === city.name} />
    </MarkerMap>
  );
}
