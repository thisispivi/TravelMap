import useLanguage from "../../../hooks/language/language";
import { City } from "../../../core";
import "./CityCard.scss";
import { useMemo } from "react";

interface CityCardProps {
  className?: string;
  city: City;
}

/**
 * CityCard component
 *
 * The CityCard component is a molecule that displays the city name and the travel dates.
 * It also adds an image background based on the city name.
 *
 * @param {CityCardProps} data - The data that will be used to display the component.
 * @param {string} [data.className=""] - The class name that will be added to the component.
 * @param {City} data.city - The city object that will be displayed.
 * @returns {JSX.Element} The CityCard component
 */
export default function CityCard({
  className = "",
  city,
}: CityCardProps): JSX.Element {
  const { t } = useLanguage(["home"]);

  const travels = useMemo(() => {
    return city.travels.filter((travel) => !travel.isFuture);
  }, [city.travels]);

  return (
    <div className={`city-card ${className} ${city.name}`}>
      <h3>{city.getName(t)}</h3>
      <div className="city-card__content">
        {travels.map((travel, i) => (
          <div key={i}>
            <span>{travel.sDate.toDateString()}</span>
            <span>{travel.eDate.toDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
