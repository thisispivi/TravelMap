import { City } from "../../../core";
import { UnitedKingdom } from "../UnitedKingdom";

export const London = new City({
  name: "London",
  country: UnitedKingdom,
  coordinates: [-0.1276474, 51.5073219],
  backgroundImgSources: ["/UnitedKingdom/London/London.jpg"],
  population: 9748000,
  timeZone: "Europe/London",
});
