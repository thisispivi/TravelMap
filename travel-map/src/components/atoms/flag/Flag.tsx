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
        return <BelgiumFlag className="flag" width={"auto"} height={"auto"} />;
      case "United Kingdom":
        return <EnglandFlag className="flag" width={"auto"} height={"auto"} />;
      case "Italy":
        return <ItalyFlag className="flag" width={"auto"} height={"auto"} />;
      case "Germany":
        return <GermanyFlag className="flag" width={"auto"} height={"auto"} />;
      case "Spain":
        return <SpainFlag className="flag" width={"auto"} height={"auto"} />;
      case "Hungary":
        return <HungaryFlag className="flag" width={"auto"} height={"auto"} />;
      default:
        return null;
    }
  }
  return getCountryFlag(id);
}
