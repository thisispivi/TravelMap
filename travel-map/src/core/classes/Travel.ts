import { Image } from "../typings/Image";

/**
 * Data used to construct one city visit.
 * @property {Date} sDate - The visit start date
 * @property {Date} eDate - The visit end date
 * @property {Image[]} [photos] - The visit media
 * @property {boolean} [isFuture] - Whether the visit is planned
 * @property {{ minPhotos?: number; maxPhotos?: number }} [rowConstraints] - Gallery row constraints
 * @property {number} [targetRowHeight] - The preferred gallery row height
 */
interface TravelInterface {
  sDate: Date;
  eDate: Date;
  photos?: Image[];
  isFuture?: boolean;
  rowConstraints?: { minPhotos?: number; maxPhotos?: number };
  targetRowHeight?: number;
}

/**
 * The travel class is used to represent a travel.
 * @class
 * @param {TravelInterface} travelData - The data of the travel
 * @param {Date} travelData.sDate - The start date of the travel
 * @param {Date} travelData.eDate - The end date of the travel
 * @param {Image[]} [travelData.photos] - The photos of the travel
 * @param {boolean} [travelData.isFuture] - If the travel is in the future
 * @param {{ minPhotos?: number; maxPhotos?: number }} [travelData.rowConstraints] - The constraints of the gallery rows
 * @param {number} [travelData.rowConstraints.minPhotos] - The minimum number of photos per row
 * @param {number} [travelData.rowConstraints.maxPhotos] - The maximum number of photos per row
 * @param {number} [travelData.targetRowHeight] - The target height of the gallery rows
 */
export class Travel implements TravelInterface {
  sDate: Date;
  eDate: Date;
  photos: Image[];
  isFuture: boolean = false;
  rowConstraints?: { minPhotos?: number; maxPhotos?: number };
  targetRowHeight?: number;

  /**
   * Creates a city visit with gallery defaults.
   * @param {TravelInterface} travelData - The city visit data
   */
  constructor(travelData: TravelInterface) {
    const { sDate, eDate, photos, isFuture, rowConstraints, targetRowHeight } =
      travelData;

    this.sDate = sDate;
    this.eDate = eDate;
    this.photos = photos || [];
    this.isFuture = isFuture || false;
    this.rowConstraints = rowConstraints || { maxPhotos: 8 };
    this.targetRowHeight = targetRowHeight || 260;
  }
}
