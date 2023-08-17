import { City } from "../utils/city";
import { Country } from "../utils/country";
import { ReactComponent as DepartureIcon } from "../icons/Departure.svg";
import { ReactComponent as ArrivalIcon } from "../icons/Arrival.svg";
import { ReactComponent as PeopleIcon } from "../icons/People.svg";
import { Button } from "./Button";

interface TooltipProps {
  city?: City;
  getCountryFlag: (country: Country) => JSX.Element | null;
  active?: boolean;
  onClick?: (city: City) => void;
}

export function Tooltip({
  city,
  active = false,
  onClick,
  getCountryFlag,
}: TooltipProps) {
  return (
    <foreignObject x={-38} y={0} width={active ? 76 : 0} height={90}>
      <div className={`tooltip ${active ? "active" : ""}`}>
        {city && (
          <>
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
            <Button
              text={"Open slideshow"}
              onClick={() => onClick && onClick(city)}
            />
          </>
        )}
      </div>
    </foreignObject>
  );
}
