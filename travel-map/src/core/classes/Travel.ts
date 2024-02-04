import { i18n } from "i18next";
import { Image } from "../typings/Image";

export interface TravelInterface {
  sDate: Date;
  eDate: Date;
  photos: Image[];
}

export class Travel implements TravelInterface {
  sDate: Date;
  eDate: Date;
  photos: Image[];

  constructor(sDate: Date, eDate: Date, photos: Image[]) {
    this.sDate = sDate;
    this.eDate = eDate;
    this.photos = photos;
  }

  showSDate(t: i18n["t"], length: "short" | "long") {
    return `${t(
      "weekdays." + this.sDate.getDay() + "." + length
    )} ${this.sDate.getDate()} ${t(
      "months." + this.sDate.getMonth() + "." + length
    )} ${this.sDate.getFullYear()}  `;
  }

  showEDate(t: i18n["t"], length: "short" | "long") {
    return `${t(
      "weekdays." + this.eDate.getDay() + "." + length
    )} ${this.eDate.getDate()} ${t(
      "months." + this.eDate.getMonth() + "." + length
    )} ${this.eDate.getFullYear()}  `;
  }
}
