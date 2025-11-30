import { useNavigate } from "react-router-dom";
import { CalendarIcon, DoubleChevronIcon } from "../../../assets";
import { Travel } from "../../../core";
import "./TravelSelector.scss";
import { formatDateRangeShort } from "../../../i18n/functions/date";
import useLanguage from "../../../hooks/language/language";
import { JSX } from "react";

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
 * @param {TravelSelectorProps} props - The props of the component
 * @param {Travel[]} props.travels - The travels
 * @param {number} props.selectedTravelIdx - The selected travel index
 * @param {string} props.cityName - The city name
 *
 * @returns {JSX.Element} - The travel selector
 */
export default function TravelSelector({
  travels,
  selectedTravelIdx,
  cityName,
}: TravelSelectorProps): JSX.Element {
  const { currLanguage } = useLanguage([]);
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
        <CalendarIcon className="travel-selector__icon" />
        <p className="travel-selector__date">
          {formatDateRangeShort({
            sDateInput: currTravel.sDate,
            eDateInput: currTravel.eDate,
            locale: currLanguage,
            includeWeekday: true,
            showYear: true,
          })}
        </p>
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
