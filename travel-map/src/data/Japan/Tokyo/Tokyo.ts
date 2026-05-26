import { City } from "../../../core";
import { Japan } from "../Japan";

export const Tokyo = new City({
  name: "Tokyo",
  country: Japan,
  coordinates: [139.6917, 35.6895],
  backgroundImgSources: ["/Japan/Tokyo/Tokyo.jpg"],
  population: 37115000,
  timeZone: "Asia/Tokyo",
});
