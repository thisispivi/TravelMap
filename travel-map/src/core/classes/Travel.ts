import { Image } from "../typings/Image";

export interface TravelInterface {
  sDate: Date;
  eDate: Date;
  photos?: Image[];
  isFuture?: boolean;
  rowCostraints?: { minPhotos?: number; maxPhotos?: number };
  targetRowHeight?: number;
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
 * @param {object} travelData.rowCostraints - The constraints of the rows of the gallery
 * @param {number} travelData.rowCostraints.minPhotos - The minimum number of photos per row
 * @param {number} travelData.rowCostraints.maxPhotos - The maximum number of photos per row
 * @param {number} travelData.targetRowHeight - The target height of the rows of the gallery
 */
export class Travel implements TravelInterface {
  sDate: Date;
  eDate: Date;
  photos: Image[];
  isFuture: boolean = false;
  rowCostraints?: { minPhotos?: number; maxPhotos?: number };
  targetRowHeight?: number;

  constructor({
    sDate,
    eDate,
    photos,
    isFuture,
    rowCostraints,
    targetRowHeight,
  }: TravelInterface) {
    this.sDate = sDate;
    this.eDate = eDate;
    this.photos = photos || [];
    this.isFuture = isFuture || false;
    this.rowCostraints = rowCostraints || { maxPhotos: 8 };
    this.targetRowHeight = targetRowHeight || 260;
  }
}
