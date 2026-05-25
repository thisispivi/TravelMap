import "./TravelSelector.scss";

import { JSX } from "react";
import { useNavigate } from "react-router-dom";

import { CalendarIcon, DoubleChevronIcon } from "../../../assets";
import { Travel } from "../../../core";
import { useLanguage } from "../../../hooks/language/language";
import { formatDateRangeShort } from "../../../i18n/functions/date";
import { classNames } from "../../../utils/className";

interface TravelSelectorProps {
  travels: Travel[];
  selectedTravelIdx: number;
  cityName: string;
}

/**
 * TravelSelector component
 *
 * Compact previous / next selector for a city's travel entries.
 *
 * @component
 *
 * @param {TravelSelectorProps} props - The travel selector props
 * @param {Travel[]} props.travels - City travels to navigate through
 * @param {number} props.selectedTravelIdx - Active travel index
 * @param {string} props.cityName - City route segment
 * @returns {JSX.Element} The travel selector
 */
export function TravelSelector({
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
        className={classNames(
          "travel-selector__chevron-icon",
          "travel-selector__chevron-icon--left",
          selectedTravelIdx <= 0 && "travel-selector__chevron-icon--disabled",
        )}
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
        className={classNames(
          "travel-selector__chevron-icon",
          selectedTravelIdx >= filteredTravels.length - 1 &&
            "travel-selector__chevron-icon--disabled",
        )}
        onClick={() =>
          selectedTravelIdx < filteredTravels.length - 1 &&
          navigate(`/gallery/${cityName}/${selectedTravelIdx + 1}`)
        }
      />
    </div>
  );
}
