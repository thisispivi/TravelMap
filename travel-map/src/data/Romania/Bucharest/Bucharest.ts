import { City, Travel } from "../../../core";
import { Romania } from "../Romania";

export const Bucharest = new City({
  name: "Bucharest",
  country: Romania,
  coordinates: [26.1025, 44.4268],
  travels: [
    new Travel({
      sDate: new Date(2026, 2, 26),
      eDate: new Date(2026, 2, 30),
      isFuture: true,
    }),
  ],
  backgroundImgSources: ["/Romania/Bucharest/Bucharest.webp"],
  population: 1883425,
  timeZone: "Europe/Bucharest",
});
