import { Image } from "../typings/Image";

export interface TravelInterface {
  sDate: Date;
  eDate: Date;
  photos?: Image[];
  isFuture?: boolean;
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
 * @param {boolean} travelData.isFuture - If the travel is in the future
 */
export class Travel implements TravelInterface {
  sDate: Date;
  eDate: Date;
  photos: Image[];
  isFuture: boolean = false;

  constructor({ sDate, eDate, photos, isFuture }: TravelInterface) {
    this.sDate = sDate;
    this.eDate = eDate;
    this.photos = photos || [];
    this.isFuture = isFuture || false;
  }
}
