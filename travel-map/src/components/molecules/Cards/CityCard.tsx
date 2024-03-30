import useLanguage from "../../../hooks/language/language";
import { City } from "../../../core";
import "./CityCard.scss";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface CityCardProps {
  className?: string;
  city: City;
  isFuture?: boolean;
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
 * @param {boolean} [data.isFuture=false] - If the city is a future city or not.
 * @returns {JSX.Element} The CityCard component
 */
export default function CityCard({
  className = "",
  city,
  isFuture = false,
}: CityCardProps): JSX.Element {
  const navigate = useNavigate();
  const { t } = useLanguage(["home"]);

  const travels = useMemo(() => {
    return city.travels.filter((travel) =>
      isFuture ? travel.isFuture : !travel.isFuture
    );
  }, [city.travels, isFuture]);

  return (
    <div className={`city-card ${className} ${city.name}`}>
      <h3>{city.getName(t)}</h3>
      <div className="city-card__content">
        {travels.map((travel, i) => (
          <div
            className="city-card__travel"
            key={i}
            onClick={() => navigate(`/gallery/${city.name}/${i}`)}
          >
            <span>{travel.sDate.toDateString()}</span>
            <span>{travel.eDate.toDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
