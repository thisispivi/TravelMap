import { Tooltip as ReactTooltip } from "react-tooltip";
import "./Tooltip.scss";
import { City } from "../../../core";
import useLanguage from "../../../hooks/language/language";
import { CountryFlag } from "../../atoms";
import {
  ArrivalIcon,
  DepartureIcon,
  DoubleChevronIcon,
  GalleryIcon,
} from "../../../assets";
import { useState } from "react";
import { formatDate } from "../../../i18n/functions/date";
import { useNavigate } from "react-router-dom";
import Button from "../../atoms/Buttons/Button";

interface TooltipProps {
  city: City;
  onMouseEnter?: (city: City) => void;
  onMouseLeave?: () => void;
  isOpen?: boolean;
}

export default function Tooltip({
  city,
  onMouseEnter,
  onMouseLeave,
  isOpen,
}: TooltipProps) {
  const { t, currentLanguage: lang } = useLanguage(["home"]);
  const [travelIdx, setTravelIdx] = useState(0);
  const filteredTravels = city.travels.filter((travel) => !travel.isFuture);
  const navigate = useNavigate();
  const createBackdrop = (className: string) => (
    <div
      className={`tooltip__backdrop ${className}`}
      onMouseEnter={() => onMouseEnter && onMouseEnter(city)}
      onMouseLeave={() => onMouseLeave && onMouseLeave()}
    />
  );

  return (
    <ReactTooltip
      clickable
      id={city.name}
      variant="light"
      key={city.name}
      anchorSelect={`#${city.name}-marker`}
      className="tooltip"
      isOpen={isOpen}
      opacity={1}
    >
      {createBackdrop("tooltip__backdrop--top")}
      {createBackdrop("tooltip__backdrop--right")}
      {createBackdrop("tooltip__backdrop--bottom")}
      {createBackdrop("tooltip__backdrop--left")}
      <div
        className="tooltip__container"
        onMouseEnter={() => onMouseEnter && onMouseEnter(city)}
        onMouseLeave={() => onMouseLeave && onMouseLeave()}
      >
        <div className="tooltip__header">
          <h3>{city.getName(t)}</h3>
          <CountryFlag countryName={city.country.id} />
        </div>
        <div className="tooltip__content">
          <DoubleChevronIcon
            className={`tooltip__content__chevron-icon tooltip__content__chevron-icon--left ${travelIdx > 0 ? "" : "tooltip__content__chevron-icon--disabled"}`}
            onClick={() => travelIdx > 0 && setTravelIdx(travelIdx - 1)}
          />
          <div className="tooltip__content__travel">
            <div className="tooltip__content__travel__info">
              <DepartureIcon className={"tooltip__content__travel__icon"} />
              <p>{formatDate(filteredTravels[travelIdx].sDate, lang)}</p>
            </div>
            <div className="tooltip__content__travel__info">
              <ArrivalIcon className={"tooltip__content__travel__icon"} />
              <p>{formatDate(filteredTravels[travelIdx].eDate, lang)}</p>
            </div>
          </div>
          <DoubleChevronIcon
            className={`tooltip__content__chevron-icon ${travelIdx < filteredTravels.length - 1 ? "" : "tooltip__content__chevron-icon--disabled"}`}
            onClick={() =>
              travelIdx < filteredTravels.length - 1 &&
              setTravelIdx(travelIdx + 1)
            }
          />
        </div>
        <div className="tooltip__footer">
          <Button
            className="tooltip__footer__button"
            onClick={() => navigate(`/gallery/${city.name}/${travelIdx}`)}
          >
            <GalleryIcon />
            <p>{t("galleryAlt")}</p>
          </Button>
        </div>
      </div>
    </ReactTooltip>
  );
}
