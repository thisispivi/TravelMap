import MapChart from "./components/MapChart";
import { Country } from "./utils/country";
import { cities } from "./utils/data";
import { ReactComponent as ItalyFlag } from "./icons/Italian.svg";
import { ReactComponent as EnglandFlag } from "./icons/England.svg";
import { ReactComponent as BelgiumFlag } from "./icons/Belgium.svg";
import { ReactComponent as GermanyFlag } from "./icons/Germany.svg";
import { ReactComponent as SpainFlag } from "./icons/Spain.svg";
import { ReactComponent as HungaryFlag } from "./icons/Hungary.svg";

export default function HomePage() {
  const visited = [
    {
      name: "Belgium",
      fill: "rgba(213, 48, 50, 0.4)",
      stroke: "rgba(213, 48, 50, 1)",
    },
    {
      name: "Spain",
      fill: "rgba(243, 159, 24, 0.4)",
      stroke: "rgba(243, 159, 24, 1)",
    },
    {
      name: "Italy",
      fill: "rgba(0, 86, 185, 0.4)",
      stroke: "rgba(0, 86, 185, 1)",
    },
    {
      name: "Hungary",
      fill: "rgba(217, 80, 48, 0.4)",
      stroke: "rgba(217, 80, 48, 1)",
    },
    {
      name: "Germany",
      fill: "rgba(49, 127, 67, 0.4)",
      stroke: "rgba(49, 127, 67, 1)",
    },
    {
      name: "United Kingdom",
      fill: "rgba(132, 195, 190, 0.4)",
      stroke: "rgba(132, 195, 190, 1)",
    },
  ];

  const getCountryFlag = (country: Country) => {
    switch (country) {
      case Country.Belgium:
        return <BelgiumFlag className="flag" />;
      case Country.England:
        return <EnglandFlag className="flag" />;
      case Country.Italy:
        return <ItalyFlag className="flag" />;
      case Country.Germany:
        return <GermanyFlag className="flag" />;
      case Country.Spain:
        return <SpainFlag className="flag" />;
      case Country.Hungary:
        return <HungaryFlag className="flag" />;
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <MapChart
        visited={visited}
        markers={cities}
        getCountryFlag={getCountryFlag}
      />
    </div>
  );
}
