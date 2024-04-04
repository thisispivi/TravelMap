import useLanguage from "../../../hooks/language/language";
import { City, Travel } from "../../../core";
import "./CityCard.scss";
import { useNavigate } from "react-router-dom";
import { ArrivalIcon, DepartureIcon } from "../../../assets";
import { formatDate } from "../../../i18n/functions/date";
import { CountryFlag } from "../../atoms";

interface CityCardProps {
  className?: string;
  city: City;
  travel: Travel;
  idx: number;
  isClickable?: boolean;
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
  travel,
  idx,
  isClickable = false,
}: CityCardProps): JSX.Element {
  const lang = useLanguage([]).currentLanguage;
  const navigate = useNavigate();
  const { t } = useLanguage(["home"]);

  return (
    <div
      className={`city-card ${isClickable ? "city-card--clickable" : "city-card--not-clickable"}`}
      onClick={() => isClickable && navigate(`/gallery/${city.name}/${idx}`)}
    >
      <div className={`city-card__top ${className} ${city.name}`}>
        <h3>{city.getName(t)}</h3>
        <CountryFlag countryName={city.country.id} />
      </div>

      <div className="city-card__content">
        <div className="travel-card__info">
          <DepartureIcon className={"travel-card__icon"} />
          <p>{formatDate(travel.sDate, lang)}</p>
        </div>
        <div className="travel-card__info">
          <ArrivalIcon className={"travel-card__icon"} />
          <p>{formatDate(travel.eDate, lang)}</p>
        </div>
      </div>
    </div>
  );
}
