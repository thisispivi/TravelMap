import { City } from "../utils/city";
import { Country } from "../utils/country";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { ReactComponent as DepartureIcon } from "../icons/Departure.svg";
import { ReactComponent as ArrivalIcon } from "../icons/Arrival.svg";
import { ReactComponent as PeopleIcon } from "../icons/People.svg";
import { Button } from "./Button";

interface TooltipProps {
  city: City;
  getCountryFlag: (country: Country) => JSX.Element | null;
  onClick?: (city: City) => void;
  onMouseEnter?: (city: City) => void;
  onMouseLeave?: () => void;
}

export function Tooltip({
  city,
  onClick,
  getCountryFlag,
  onMouseEnter,
  onMouseLeave,
}: TooltipProps) {
  return (
    <div
      onMouseEnter={() => onMouseEnter && onMouseEnter(city)}
      onMouseLeave={() => onMouseLeave && onMouseLeave()}
      onMouseMove={() => onMouseEnter && onMouseEnter(city)}
    >
      <ReactTooltip clickable id={city.name} variant="light" key={city.name}>
        <div className="title">
          <p>{city.name}</p>
          {getCountryFlag(city.country)}
        </div>
        <div className="content">
          <div className="population">
            <PeopleIcon className="flag" />
            <p>{city.population.toLocaleString()}</p>
          </div>
          <div className="start">
            <DepartureIcon className="flag" />
            <p>{city.startDate.toDateString()}</p>
          </div>
          <div className="end">
            <ArrivalIcon className="flag" />
            <p>{city.endDate.toDateString()}</p>
          </div>
        </div>
        <Button
          text={"Open slideshow"}
          onClick={() => onClick && onClick(city)}
        />
      </ReactTooltip>
    </div>
  );
}
