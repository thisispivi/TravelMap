import useLanguage from "../../../hooks/language/language";
import { City, Travel } from "../../../core";
import "./CityCard.scss";
import { useNavigate } from "react-router-dom";
import { ArrivalIcon, DepartureIcon } from "../../../assets";
import { formatDate } from "../../../i18n/functions/date";
import { CountryFlag, Loading } from "../../atoms";
import { useState } from "react";
import useThrottle from "../../../hooks/throttle/throttle";
import { mobileAndTabletCheck } from "../../../utils/responsive";

interface CityCardProps {
  className?: string;
  city: City;
  travel: Travel;
  idx: number;
  isClickable?: boolean;
  hoveredCity: City | null;
  setHoveredCity: (city: City | null) => void;
  setMapCenter?: (center: [number, number]) => void;
  setMapZoom?: (zoom: number) => void;
}

/**
 * CityCard component
 *
 * The CityCard component is a molecule that displays the city name and the travel dates.
 * It also adds an image background based on the city name.
 *
 * @param {CityCardProps} data - The data that will be used to display the component.
 * @param {string} data.className - The class to apply to the city card
 * @param {City} data.city - The city
 * @param {Travel} data.travel - The travel
 * @param {number} data.idx - The index of the travel used to retrieve the travel photos
 * @param {boolean} data.isClickable - Whether the card is clickable
 * @param {City} data.hoveredCity - The hovered city
 * @param {function} data.setHoveredCity - The function to set the hovered city
 * @param {function} data.setMapCenter - The function to set the map center
 * @param {function} data.setMapZoom - The function to set the map zoom
 * @returns {JSX.Element} The CityCard component
 */
export default function CityCard({
  className = "",
  city,
  travel,
  idx,
  isClickable = false,
  hoveredCity,
  setHoveredCity,
  setMapCenter,
  setMapZoom,
}: CityCardProps): JSX.Element {
  const lang = useLanguage([]).currentLanguage;
  const navigate = useNavigate();
  const { t } = useLanguage(["home"]);

  const [isLoading, setIsLoading] = useState(true);
  const isLoadingThrottled = useThrottle({ status: isLoading, delay: 200 });

  const handleImageLoad = () => setIsLoading(false);

  return (
    <div
      className={`city-card ${isClickable ? "city-card--clickable" : "city-card--not-clickable"} 
      ${hoveredCity && hoveredCity.name === city.name ? "city-card--hovered" : ""}
      ${mobileAndTabletCheck() ? "city-card--mobile" : "city-card--desktop"}
      `}
      onClick={
        isClickable ? () => navigate(`/gallery/${city.name}/${idx}`) : undefined
      }
      onMouseEnter={
        !mobileAndTabletCheck()
          ? () => {
              if (setMapCenter && setMapZoom && city.mapCoordinates) {
                setMapZoom(0);
                setMapCenter([0, 0]);
                setMapZoom(30);
                setMapCenter(city.mapCoordinates);
              }
              setHoveredCity && setHoveredCity(city);
            }
          : undefined
      }
      onMouseLeave={
        !mobileAndTabletCheck()
          ? () => setHoveredCity && setHoveredCity(null)
          : undefined
      }
    >
      <div
        className={`city-card__top ${className} ${city.name} ${city.name}-${idx}`}
      >
        <div className="city-card__background">
          {isLoadingThrottled && <Loading />}
          <img
            src={city.backgroundImgsSrc[idx]}
            alt={city.getName(t)}
            onLoad={handleImageLoad}
            style={{ display: isLoadingThrottled ? "none" : "block" }}
          />
        </div>
        <div className="city-card__title">
          <h3>{city.getName(t)}</h3>
          <CountryFlag countryName={city.country.id} />
        </div>
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
