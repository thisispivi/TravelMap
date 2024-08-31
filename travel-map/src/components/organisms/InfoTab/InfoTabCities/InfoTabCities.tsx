import { memo, useContext } from "react";
import { City, Travel } from "../../../../core";
import useLanguage from "../../../../hooks/language/language";
import { CityCard } from "../../../molecules";
import "./InfoTabCities.scss";
import { HomeContext } from "../../../pages/Home/Home";

interface InfoTabCitiesProps {
  className?: string;
  id: string;
  cities: City[];
  getTravelIdx: (city: City, travel: Travel) => number;
  isVisible?: boolean;
}

/**
 * InfoTabCities component
 *
 * The info tab cities component is used to display the cities
 * that are part of the visited or future travels.
 *
 * @component
 *
 * @param {InfoTabCitiesProps} props - The props of the component
 * @param {string} props.className - The class to apply to the info tab cities
 * @param {string} props.id - The id of the info tab
 * @param {City[]} props.cities - The cities to display
 * @param {(city: City, travel: Travel) => number} props.getTravelIdx - The function to get the travel index
 * @param {boolean} props.isVisible - The visibility of the info tab cities
 * @returns {JSX.Element} - The info tab cities
 */
export default memo(function InfoTabCities({
  className = "",
  id,
  cities,
  getTravelIdx,
  isVisible = false,
}: InfoTabCitiesProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  const { hoveredCity, setHoveredCity, setMapCenter, setMapZoom } =
    useContext(HomeContext)!;
  return (
    <div
      className={`info-tab-cities info-tab-${id} ${className} 
    ${isVisible ? "info-tab-cities--visible" : ""}
    `}
    >
      <div className={`info-tab-cities__header info-tab-${id}__header`}>
        <h1>{t(id + ".title")}</h1>
      </div>
      <div
        className={`info-tab-cities__content info-tab-${id}__content`}
        id="info-tab"
      >
        {cities.map((city, i) => (
          <CityCard
            key={i}
            city={new City(city)}
            travel={city.travels[0]}
            idx={getTravelIdx(city, city.travels[0])}
            isClickable={city.travels[0].photos.length > 0}
            hoveredCity={hoveredCity}
            setHoveredCity={setHoveredCity}
            setMapCenter={setMapCenter}
            setMapZoom={setMapZoom}
          />
        ))}
        {cities.length % 2 !== 0 && (
          <div
            className={`info-tab-cities__void-city info-tab-${id}__void-city city-card`}
          />
        )}
      </div>
    </div>
  );
});
