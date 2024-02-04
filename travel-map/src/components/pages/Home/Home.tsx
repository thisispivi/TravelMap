import * as topojson from "topojson-client";
import "./Home.scss";
import { worldData } from "../../../assets";
import { HomeTemplate } from "../../templates";

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = worldData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const world: any = topojson.feature(data, data.objects.countries);
  console.log(world);

  return (
    <div className="home">
      <HomeTemplate countries={world} />
    </div>
  );
}
