import { Image } from "../typings/Image";

export interface TravelInterface {
  sDate: Date;
  eDate: Date;
  photos: Image[];
}

/**
 * Travel class
 *
 * The travel class is used to represent a travel.
 *
 * @class
 *
 * @param {TravelInterface} travelData - The data of the travel
 * @param {Date} travelData.sDate - The start date of the travel
 * @param {Date} travelData.eDate - The end date of the travel
 * @param {Image[]} travelData.photos - The photos of the travel
 */
export class Travel implements TravelInterface {
  sDate: Date;
  eDate: Date;
  photos: Image[];

  constructor(sDate: Date, eDate: Date, photos: Image[]) {
    this.sDate = sDate;
    this.eDate = eDate;
    this.photos = photos;
  }
}
