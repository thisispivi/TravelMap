import useLanguage from "../../../hooks/language/language";
import { City, Travel } from "../../../core";
import "./CityCard.scss";
import { useNavigate } from "react-router-dom";
import { ArrivalIcon, DepartureIcon } from "../../../assets";
import { formatDate } from "../../../i18n/functions/date";
import { CountryFlag, Loading } from "../../atoms";
import { memo, JSX, useCallback } from "react";
import { mobileAndTabletCheck } from "../../../utils/responsive";
import { parameters } from "../../../utils/parameters";
import { LazyLoadImage } from "react-lazy-load-image-component";

interface CityCardProps {
  className?: string;
  city: City;
  travel?: Travel;
  travelIdx?: number;
  isClickable?: boolean;
  setHoveredCity: (city: City | null) => void;
  mapPosition?: { center: [number, number]; zoom: number };
  setMapPosition?: (position: {
    center: [number, number];
    zoom: number;
  }) => void;
  isAutoPosition?: boolean;
  isHidden?: boolean;
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
 * @param {Travel} [data.travel] - The travel
 * @param {number} [data.travelIdx = 0] - The index of the travel used to retrieve the travel photos
 * @param {boolean} data.isClickable - Whether the card is clickable
 * @param {City} data.hoveredCity - The hovered city
 * @param {function} data.setHoveredCity - The function to set the hovered city
 * @param {function} data.setMapPosition - The function to set the map position
 * @param {boolean} data.isAutoPosition - Whether the map should auto position to the city when hovered
 * @param {boolean} data.isHidden - Whether the card is hidden
 * @returns {JSX.Element} The CityCard component
 */
const CityCard = ({
  className = "",
  city,
  travel,
  travelIdx = 0,
  isClickable = false,
  setHoveredCity,
  setMapPosition,
  isAutoPosition = false,
  isHidden = false,
}: CityCardProps): JSX.Element => {
  const lang = useLanguage([]).currLanguage;
  const navigate = useNavigate();
  const { t } = useLanguage(["home"]);

  const handleMouseEnter = useCallback(() => {
    if (!mobileAndTabletCheck()) {
      if (setMapPosition && city.mapCoordinates && isAutoPosition)
        setMapPosition({
          center: city.mapCoordinates,
          zoom: parameters.map.hoveredCityZoom,
        });

      setHoveredCity && setHoveredCity(city);
    }
  }, [setMapPosition, city, isAutoPosition, setHoveredCity]);

  const handleMouseLeave = useCallback(() => {
    if (!mobileAndTabletCheck()) {
      setHoveredCity && setHoveredCity(null);
    }
  }, [setHoveredCity]);

  return (
    <div
      className={`city-card ${isClickable ? "city-card--clickable" : "city-card--not-clickable"} 
      ${mobileAndTabletCheck() ? "city-card--mobile" : "city-card--desktop"}
      ${isHidden ? "city-card--hidden" : "city-card--visible"}
      `}
      onClick={
        isClickable
          ? () => navigate(`/gallery/${city.name}/${travelIdx}`)
          : undefined
      }
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`city-card__top ${className} ${city.name} ${city.name}-${travelIdx}`}
      >
        <div className="city-card__background">
          <div className="city-card__background-overlay" />
          <LazyLoadImage
            alt={city.getName(t)}
            className="city-card__background-img"
            effect="opacity"
            placeholder={
              <div className="centered">
                <Loading />
              </div>
            }
            src={city.backgroundImgsSrc[travelIdx]}
          />
        </div>
      </div>
      <div className="city-card__content">
        <div className="city-card__title">
          <h2>{city.getName(t)}</h2>
          <CountryFlag countryId={city.country.id} />
        </div>
        {travel?.sDate ? (
          <div className="travel-card__info">
            <DepartureIcon className="travel-card__icon" />
            <p>{formatDate(travel.sDate, lang)}</p>
          </div>
        ) : null}
        {travel?.eDate ? (
          <div className="travel-card__info">
            <ArrivalIcon className="travel-card__icon" />
            <p>{formatDate(travel.eDate, lang)}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const MemoizedCityCard = memo(CityCard);
export default MemoizedCityCard;
