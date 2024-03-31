import { ArrivalIcon, DepartureIcon } from "../../../assets";
import { Travel } from "../../../core";
import useLanguage from "../../../hooks/language/language";
import { formatDate } from "../../../i18n/functions/date";
import "./TravelCard.scss";

interface TravelCardProps {
  travel: Travel;
  onClick?: () => void;
}

export default function TravelCard({ travel, onClick }: TravelCardProps) {
  const lang = useLanguage([]).currentLanguage;
  return (
    <div
      className={`travel-card ${travel.photos.length > 0 ? "travel-card--clickable" : ""}`}
      onClick={() => travel.photos.length > 0 && onClick && onClick()}
    >
      <div className="travel-card__info">
        <DepartureIcon className={"travel-card__icon"} />
        <p>{formatDate(travel.sDate, lang)}</p>
      </div>
      <p>-</p>
      <div className="travel-card__info">
        <ArrivalIcon className={"travel-card__icon"} />
        <p>{formatDate(travel.eDate, lang)}</p>
      </div>
    </div>
  );
}
