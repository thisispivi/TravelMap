import { City, Travel } from "../../../core";
import { France } from "../France";

export const Cannes = new City({
  name: "Cannes",
  country: France,
  coordinates: [7.0174, 43.5528],
  population: 74000,
  timeZone: "Europe/Paris",
  travels: [
    new Travel({
      sDate: new Date(2025, 11, 31),
      eDate: new Date(2025, 11, 31),
      isFuture: false,
    }),
  ],
  backgroundImgSources: ["/France/Cannes/Cannes.jpg"],
});
