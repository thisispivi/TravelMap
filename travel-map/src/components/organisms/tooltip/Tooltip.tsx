import { City } from "../../../classes/City";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { ReactComponent as DepartureIcon } from "../../../icons/Departure.svg";
import { ReactComponent as ArrivalIcon } from "../../../icons/Arrival.svg";
import { ReactComponent as PeopleIcon } from "../../../icons/People.svg";
import { TextButton } from "../../atoms";
import { i18n } from "i18next";
import { CountryFlag } from "../../atoms";
import { Column, Row } from "../../molecules";
import "./Tooltip.scss";
import { showDate } from "../../../utils/date";

interface TooltipProps {
  city: City;
  onClick?: (city: City) => void;
  onMouseEnter?: (city: City) => void;
  onMouseLeave?: () => void;
  t: i18n["t"];
}

export function Tooltip({
  city,
  onClick,
  onMouseEnter,
  onMouseLeave,
  t,
}: TooltipProps) {
  return (
    <div
      onMouseEnter={() => onMouseEnter && onMouseEnter(city)}
      onMouseLeave={() => onMouseLeave && onMouseLeave()}
      onMouseMove={() => onMouseEnter && onMouseEnter(city)}
    >
      <ReactTooltip clickable id={city.name} variant="light" key={city.name}>
        <Row className="header">
          <h2>{city.getCountryName(t)}</h2>
          <CountryFlag id={city.country.id} />
        </Row>
        <Column>
          <Row>
            <PeopleIcon className="icon" />
            <p>{city.population.toLocaleString()}</p>
          </Row>
          <Row>
            <DepartureIcon className="icon" />
            <p>{showDate(city.startDate, t, "short")}</p>
          </Row>
          <Row>
            <ArrivalIcon className="icon" />
            <p>{showDate(city.endDate, t, "short")}</p>
          </Row>
        </Column>
        <TextButton
          text={"Open slideshow"}
          onClick={() => onClick && onClick(city)}
        />
      </ReactTooltip>
    </div>
  );
}
