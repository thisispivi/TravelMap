import { City } from "../../../classes/City";
import { Marker as MarkerMap } from "react-simple-maps";
import MarkerIcon from "../../../icons/Marker";
import "./Marker.scss";
import { useTranslation } from "react-i18next";

interface MarkerProps {
  city: City;
  hoveredCity?: City;
  setHoveredCity: (city: City | undefined) => void;
  currentZoom: number;
  isDarkMode?: boolean;
}

export function Marker({
  city,
  hoveredCity,
  setHoveredCity,
  currentZoom,
  isDarkMode = false,
}: MarkerProps) {
  const { t } = useTranslation(["home"]);

  const setXOffset = () => {
    switch (city.name) {
      case "Brussels":
        return "0.3rem";
      case "Bruges":
        return "-0.1rem";
      case "Barcelona":
        return "0.08rem";
      default:
        return "0rem";
    }
  };
  const setYOffset = () => {
    switch (city.name) {
      case "Brussels":
        return "-0.07rem";
      case "Bruges":
        return "0.08rem";
      case "Barcelona":
        return "0.14rem";
      default:
        return "0.1rem";
    }
  };

  return (
    <MarkerMap
      id={city.name + "-marker"}
      key={city.name}
      coordinates={city.coordinates}
      data-tooltip-id={city.name}
      onMouseEnter={() => setHoveredCity(city)}
      onMouseLeave={() => setHoveredCity(undefined)}
      style={{
        default: { outline: "none" },
        hover: { outline: "none" },
        pressed: { outline: "none" },
      }}
    >
      <MarkerIcon active={hoveredCity?.name === city.name} />
      {currentZoom > 10 && (
        <text
          textAnchor="middle"
          style={{
            fontSize: "0.1rem",
            fontWeight: "600",
            width: "1rem",
          }}
          x={setXOffset()}
          y={setYOffset()}
          fill={
            isDarkMode
              ? hoveredCity?.name === city.name
                ? "#ffffff"
                : "#c4c4c4"
              : hoveredCity?.name === city.name
              ? "#000"
              : "#4d4d4d"
          }
        >
          {t("cities." + city.name)}
        </text>
      )}
    </MarkerMap>
  );
}
