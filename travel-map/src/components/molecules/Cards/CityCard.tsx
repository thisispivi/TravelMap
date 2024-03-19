import useLanguage from "../../../hooks/language/language";
import { City } from "../../../core";
import "./CityCard.scss";

interface CityCardProps {
  className?: string;
  city: City;
}

export default function CityCard({
  className = "",
  city,
}: CityCardProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  return (
    <div className={`city-card ${className} ${city.name}`}>
      <h3>{city.getName(t)}</h3>
      <div className="city-card__content">
        {city.travels.map((travel, i) => (
          <div key={i}>
            <span>{travel.sDate.toDateString()}</span>
            <span>{travel.eDate.toDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
