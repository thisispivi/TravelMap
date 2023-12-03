import "./Flag.scss";
import { ReactComponent as ItalyFlag } from "./../../../icons/Italian.svg";
import { ReactComponent as EnglandFlag } from "./../../../icons/England.svg";
import { ReactComponent as BelgiumFlag } from "./../../../icons/Belgium.svg";
import { ReactComponent as GermanyFlag } from "./../../../icons/Germany.svg";
import { ReactComponent as SpainFlag } from "./../../../icons/Spain.svg";
import { ReactComponent as HungaryFlag } from "./../../../icons/Hungary.svg";

export function CountryFlag({ id }: { id: string }) {
  function getCountryFlag(id: string) {
    switch (id) {
      case "Belgium":
        return <BelgiumFlag className="flag" width={"100%"} height={"100%"} />;
      case "United Kingdom":
        return <EnglandFlag className="flag" width={"100%"} height={"100%"} />;
      case "Italy":
        return <ItalyFlag className="flag" width={"100%"} height={"100%"} />;
      case "Germany":
        return <GermanyFlag className="flag" width={"100%"} height={"100%"} />;
      case "Spain":
        return <SpainFlag className="flag" width={"100%"} height={"100%"} />;
      case "Hungary":
        return <HungaryFlag className="flag" width={"100%"} height={"100%"} />;
      default:
        return null;
    }
  }
  return getCountryFlag(id);
}
