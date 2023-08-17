import { City } from "../utils/city";
import { Country } from "../utils/country";
import { ReactComponent as DepartureIcon } from "../icons/Departure.svg";
import { ReactComponent as ArrivalIcon } from "../icons/Arrival.svg";
import { ReactComponent as PeopleIcon } from "../icons/People.svg";

interface TooltipProps {
  city: City;
  getCountryFlag: (country: Country) => JSX.Element | null;
}

export function Tooltip({ city, getCountryFlag }: TooltipProps) {
  return (
    <foreignObject x={-45} y={-5} width={90} height={90}>
      <div className="tooltip">
        <div className="title">
          {city.name}
          {getCountryFlag(city.country)}
        </div>
        <div className="content">
          <div className="population">
            <PeopleIcon className="flag" />
            <p>{city.population.toLocaleString()}</p>
          </div>
          <div className="start">
            <DepartureIcon className="flag" />
            <p>{city.startDate.toLocaleDateString()}</p>
          </div>
          <div className="end">
            <ArrivalIcon className="flag" />
            <p>{city.endDate.toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </foreignObject>
  );
}
