import { useNavigate } from "react-router-dom";
import { ArrivalIcon, DepartureIcon, DoubleChevronIcon } from "../../../assets";
import { Travel } from "../../../core";
import "./TravelSelector.scss";
import { formatDate } from "../../../i18n/functions/date";
import useLanguage from "../../../hooks/language/language";

export interface TravelSelectorProps {
  travels: Travel[];
  selectedTravelIdx: number;
  cityName: string;
}

/**
 * TravelSelector component
 *
 * The travel selector component is used to display a travel selector.
 *
 * @component
 *
 * @returns {JSX.Element} - The travel selector
 */
export default function TravelSelector({
  travels,
  selectedTravelIdx,
  cityName,
}: TravelSelectorProps): JSX.Element {
  const { currentLanguage } = useLanguage([]);
  const navigate = useNavigate();
  const currTravel = travels[selectedTravelIdx];
  const filteredTravels = travels.filter((t) => !t.isFuture);
  return (
    <div className="travel-selector">
      <DoubleChevronIcon
        className={`travel-selector__chevron-icon travel-selector__chevron-icon--left
        ${selectedTravelIdx > 0 ? "" : "travel-selector__chevron-icon--disabled"}`}
        onClick={() =>
          selectedTravelIdx > 0 &&
          navigate(`/gallery/${cityName}/${selectedTravelIdx - 1}`)
        }
      />
      <div className="travel-selector__info">
        <div className="travel-selector__dates">
          <DepartureIcon className="travel-selector__travel-icon" />
          <p>{formatDate(currTravel.sDate, currentLanguage)}</p>
        </div>
        <p className="travel-selector__bar">-</p>
        <div className="travel-selector__dates">
          <ArrivalIcon className="travel-selector__travel-icon" />
          <p>{formatDate(currTravel.eDate, currentLanguage)}</p>
        </div>
      </div>
      <DoubleChevronIcon
        className={`travel-selector__chevron-icon
        ${selectedTravelIdx < filteredTravels.length - 1 ? "" : "travel-selector__chevron-icon--disabled"}`}
        onClick={() =>
          selectedTravelIdx < filteredTravels.length - 1 &&
          navigate(`/gallery/${cityName}/${selectedTravelIdx + 1}`)
        }
      />
    </div>
  );
}
