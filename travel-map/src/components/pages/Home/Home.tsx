import { Map } from "../../organisms";
import "./Home.scss";

export default function Home() {
  return (
    <div className="content">
      <Map
        topojsonUrl={
          "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"
        }
      />
    </div>
  );
}
