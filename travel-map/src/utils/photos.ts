import { anderlecht } from "./photos/anderlecth";
import { barcellona } from "./photos/barcelona";
import { bruges } from "./photos/bruges";
import { brussels } from "./photos/brussels";
import { budapest } from "./photos/budapest";
import { imola } from "./photos/imola";

export function getCityPhotos(cityName: string) {
  switch (cityName) {
    case "Bruges":
      return bruges;
    case "Brussels":
      return brussels;
    case "Anderlecht":
      return anderlecht;
    case "Barcelona":
      return barcellona;
    case "Budapest":
      return budapest;
    case "Imola":
      return imola;
    default:
      return [];
  }
}
