import { useTranslation } from "react-i18next";
import { City } from "../../../classes/City";

export interface MarkerTextProps {
  city: City;
  hoveredCity?: City;
  scaleFactor?: number;
  isDarkMode?: boolean;
}

export function MarkerText({
  city,
  hoveredCity,
  scaleFactor = 1,
  isDarkMode = false,
}: MarkerTextProps) {
  const { t } = useTranslation(["home"]);

  const getFontSize = (x: number) => {
    const size = 19.3649 - 19.1701 * Math.pow(x, 0.00196925);
    return size < 0.03 ? 0.03 : size;
  };

  const getXOffset = (x: number) => {
    switch (city.name) {
      case "Brussels":
        return 7.18526 - 6.68627 * Math.pow(x, 0.0128478);
      case "Bruges":
        if (x > 50) return 0;
        return 7.01898 * Math.pow(x, 0.00451212) - 7.15685;
      default:
        return 0;
    }
  };

  const getYOffset = (x: number) => {
    switch (city.name) {
      case "Brussels":
        return 0.0123954 * Math.pow(x, 0.410715) - 0.0920783;
      default:
        return 0.200185 - 0.0654652 * Math.pow(x, 0.200203);
    }
  };

  return (
    <text
      textAnchor="middle"
      style={{
        fontSize: `${getFontSize(scaleFactor)}rem`,
        fontWeight: "600",
        width: "1rem",
        filter: `drop-shadow(0 0 0.12px rgb(${
          isDarkMode ? "0 0 0" : "255 255 255"
        }))`,
        userSelect: "none",
      }}
      x={getXOffset(scaleFactor) + "rem"}
      y={getYOffset(scaleFactor) + "rem"}
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
  );
}
