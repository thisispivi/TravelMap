import type { Continent } from "../typings/Continent";
import type { Currency } from "../typings/Currency";
import type { MarkerSizes } from "../typings/Marker";
import type { TransportMode } from "../classes/Trip";

/**
 * Serializable country data authored in the forkable dataset.
 * @property {string} id - The stable country reference key
 * @property {string} name - The canonical Natural Earth join name
 * @property {Record<string, string>} [nameByLocale] - Locale-specific display names
 * @property {{ h: number; s: number; l: number }} color - The country HSL color
 * @property {Continent} continent - The country continent
 * @property {Currency} currency - The country currency
 * @property {number} [minMarkerScale] - Minimum marker scale
 * @property {number} [maxMarkerScale] - Maximum marker scale
 */
export interface CountryJson {
  id: string;
  name: string;
  nameByLocale?: Record<string, string>;
  color: { h: number; s: number; l: number };
  continent: Continent;
  currency: Currency;
  minMarkerScale?: number;
  maxMarkerScale?: number;
}

/**
 * Serializable city data authored in the forkable dataset.
 * @property {string} id - The stable city reference key and gallery URL segment
 * @property {string} name - The canonical city display name
 * @property {Record<string, string>} [nameByLocale] - Locale-specific display names
 * @property {string} countryId - The owning country reference key
 * @property {[number, number]} coordinates - Longitude and latitude
 * @property {string} timeZone - The IANA timezone
 * @property {number} [population] - Population when known
 * @property {string[]} [backgroundImages] - CDN-relative background image paths
 * @property {boolean} [isLived] - Whether the city is a former home
 * @property {number} [minMarkerScale] - Minimum marker scale
 * @property {MarkerSizes} [customMarkerSizes] - Custom marker dimensions
 */
export interface CityJson {
  id: string;
  name: string;
  nameByLocale?: Record<string, string>;
  countryId: string;
  coordinates: [number, number];
  timeZone: string;
  population?: number;
  backgroundImages?: string[];
  isLived?: boolean;
  minMarkerScale?: number;
  customMarkerSizes?: MarkerSizes;
}

/**
 * A serialized stop in a trip itinerary.
 * @property {"stop"} type - The step discriminator
 * @property {string} cityId - The referenced city
 * @property {string} sDate - The local start date
 * @property {string} eDate - The local end date
 * @property {string} [photoPath] - The photo manifest key
 * @property {boolean} [isLayover] - Whether the stop is a layover
 * @property {{ minPhotos?: number; maxPhotos?: number }} [rowConstraints] - Gallery row constraints
 * @property {number} [targetRowHeight] - Gallery target row height
 */
export interface TripStopJson {
  type: "stop";
  cityId: string;
  sDate: string;
  eDate: string;
  photoPath?: string;
  isLayover?: boolean;
  rowConstraints?: { minPhotos?: number; maxPhotos?: number };
  targetRowHeight?: number;
}

/**
 * A serialized transport leg in a trip itinerary.
 * @property {"transport"} type - The step discriminator
 * @property {TransportMode} mode - The transport mode
 * @property {string} fromId - The departure city
 * @property {string} toId - The arrival city
 * @property {string} [sDate] - The local departure date
 * @property {string} [eDate] - The local arrival date
 * @property {number} [distanceInKm] - Distance in kilometers
 * @property {number} [durationMinutes] - Duration in minutes
 * @property {string[]} [viaIds] - Intermediate cities
 * @property {boolean} [roundTrip] - Whether this is a return leg
 * @property {{ company?: string; number?: string; class?: string; durationMinutes?: number; distanceInKm?: number }} [flight] - Flight details
 * @property {{ company?: string; durationMinutes?: number; distanceInKm?: number; viaIds?: string[] }} [ferry] - Ferry details
 */
export interface TripTransportJson {
  type: "transport";
  mode: TransportMode;
  fromId: string;
  toId: string;
  sDate?: string;
  eDate?: string;
  distanceInKm?: number;
  durationMinutes?: number;
  viaIds?: string[];
  roundTrip?: boolean;
  flight?: {
    company?: string;
    number?: string;
    class?: string;
    durationMinutes?: number;
    distanceInKm?: number;
  };
  ferry?: {
    company?: string;
    durationMinutes?: number;
    distanceInKm?: number;
    viaIds?: string[];
  };
}

/**
 * A serialized trip authored in the forkable dataset.
 * @property {string} id - The stable trip identifier
 * @property {string} title - The canonical title
 * @property {Record<string, string>} [titleByLocale] - Locale-specific titles
 * @property {string} sDate - The local trip start date
 * @property {string} eDate - The local trip end date
 * @property {string} originCityId - The origin city
 * @property {string} returnCityId - The return city
 * @property {string} [coverImage] - CDN-relative cover image
 * @property {{ center: [number, number]; zoom: number }} [mapFocus] - Authored map viewport
 * @property {(TripStopJson | TripTransportJson)[]} steps - Ordered itinerary steps
 */
export interface TripJson {
  id: string;
  title: string;
  titleByLocale?: Record<string, string>;
  sDate: string;
  eDate: string;
  originCityId: string;
  returnCityId: string;
  coverImage?: string;
  mapFocus?: { center: [number, number]; zoom: number };
  steps: (TripStopJson | TripTransportJson)[];
}
