import { z } from "zod";

import { Continent } from "../typings/Continent";
import { Currency } from "../typings/Currency";

/** A finite number used by authored coordinates, dimensions, and map settings. */
const finiteNumberSchema = z.number().finite();

/** A non-empty stable identifier used for cross-document references. */
const idSchema = z.string().trim().min(1);

/**
 * A transport operator id. Operators are fork-owned: an id is resolved against
 * `SiteConfig.companies` for its display name and logo, so a fork can name its
 * own airlines and ferry lines without changing this package.
 */
export type CompanyId = string;

/** A locale-to-label mapping stored alongside a canonical name. */
const localizedNamesSchema = z.record(
  z.string().min(1),
  z.string().trim().min(1),
);

/** Longitude and latitude in GeoJSON order. */
export const CoordinatesSchema = z.tuple([
  finiteNumberSchema.min(-180).max(180),
  finiteNumberSchema.min(-90).max(90),
]);

/** Marker scale overrides accepted in city documents. */
export const MarkerSizesSchema = z.strictObject({
  defaultScale: finiteNumberSchema.positive(),
  maxScale: finiteNumberSchema.positive(),
  minScale: finiteNumberSchema.positive(),
});

/** Serializable country data authored in the forkable dataset. */
export const CountryJsonSchema = z.strictObject({
  color: z.strictObject({
    h: finiteNumberSchema.min(0).max(360),
    l: finiteNumberSchema.min(0).max(100),
    s: finiteNumberSchema.min(0).max(100),
  }),
  continent: z.enum(Continent),
  currency: z.enum(Currency),
  id: idSchema,
  maxMarkerScale: finiteNumberSchema.positive().optional(),
  minMarkerScale: finiteNumberSchema.positive().optional(),
  name: z.string().trim().min(1),
  nameByLocale: localizedNamesSchema.optional(),
});

/** Serializable city data authored in the forkable dataset. */
export const CityJsonSchema = z.strictObject({
  backgroundImages: z.array(z.string().trim().min(1)).optional(),
  coordinates: CoordinatesSchema,
  countryId: idSchema,
  customMarkerSizes: MarkerSizesSchema.optional(),
  id: idSchema,
  isLived: z.boolean().optional(),
  minMarkerScale: finiteNumberSchema.positive().optional(),
  name: z.string().trim().min(1),
  nameByLocale: localizedNamesSchema.optional(),
  population: finiteNumberSchema.int().nonnegative().optional(),
  timeZone: z.string().trim().min(1),
});

/** Transport modes supported by authored itinerary legs. */
export const TransportModeSchema = z.enum([
  "plane",
  "ferry",
  "car",
  "train",
  "bus",
  "taxi",
  "walk",
]);

/** A local calendar date with an optional wall-clock time. */
export const LocalDateSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2})?$/,
    "Expected YYYY-MM-DD or YYYY-MM-DDTHH:mm.",
  );

/** A serialized stop in a trip itinerary. */
export const TripStopJsonSchema = z.strictObject({
  cityId: idSchema,
  eDate: LocalDateSchema,
  isLayover: z.boolean().optional(),
  photoPath: z.string().trim().min(1).optional(),
  rowConstraints: z
    .strictObject({
      maxPhotos: finiteNumberSchema.int().positive().optional(),
      minPhotos: finiteNumberSchema.int().positive().optional(),
    })
    .optional(),
  sDate: LocalDateSchema,
  targetRowHeight: finiteNumberSchema.positive().optional(),
  type: z.literal("stop"),
});

/** A serialized transport leg in a trip itinerary. */
export const TripTransportJsonSchema = z.strictObject({
  distanceInKm: finiteNumberSchema.nonnegative().optional(),
  durationMinutes: finiteNumberSchema.nonnegative().optional(),
  eDate: LocalDateSchema.optional(),
  ferry: z
    .strictObject({
      company: idSchema.optional(),
      distanceInKm: finiteNumberSchema.nonnegative().optional(),
      durationMinutes: finiteNumberSchema.nonnegative().optional(),
      viaIds: z.array(idSchema).optional(),
    })
    .optional(),
  flight: z
    .strictObject({
      class: z.string().trim().min(1).optional(),
      company: idSchema.optional(),
      distanceInKm: finiteNumberSchema.nonnegative().optional(),
      durationMinutes: finiteNumberSchema.nonnegative().optional(),
      number: z.string().trim().min(1).optional(),
    })
    .optional(),
  fromId: idSchema,
  mode: TransportModeSchema,
  roundTrip: z.boolean().optional(),
  sDate: LocalDateSchema.optional(),
  toId: idSchema,
  type: z.literal("transport"),
  viaIds: z.array(idSchema).optional(),
});

/** A serialized trip authored in the forkable dataset. */
export const TripJsonSchema = z.strictObject({
  coverImage: z.string().trim().min(1).optional(),
  eDate: LocalDateSchema,
  id: idSchema,
  mapFocus: z
    .strictObject({
      center: CoordinatesSchema,
      zoom: finiteNumberSchema.positive(),
    })
    .optional(),
  originCityId: idSchema,
  returnCityId: idSchema,
  sDate: LocalDateSchema,
  steps: z.array(
    z.discriminatedUnion("type", [TripStopJsonSchema, TripTransportJsonSchema]),
  ),
  title: z.string().trim().min(1),
  titleByLocale: localizedNamesSchema.optional(),
});

/**
 * A gallery item stored in a photo manifest. A photo's `original` is the path to
 * its full-size file; a video's is a YouTube id, which the uploader cannot know
 * and leaves for the author to paste in — so a video may legitimately be waiting
 * for one, while a photo without a path could never render.
 */
export const ImageSchema = z
  .strictObject({
    alt: z.string().optional(),
    height: finiteNumberSchema.positive(),
    original: z.string().optional(),
    thumbnail: z.string().trim().min(1),
    width: finiteNumberSchema.positive(),
    youtube: z.boolean().optional(),
  })
  .refine((image) => image.youtube === true || (image.original ?? "") !== "", {
    error:
      "A photo needs an original path; only a video may be awaiting its id.",
    path: ["original"],
  });

/** A configured transport operator. */
export const CompanySchema = z.strictObject({
  logo: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1),
});

/** Fork-owned site, map, media, and classification settings. */
export const SiteConfigSchema = z.strictObject({
  companies: z.record(z.string().min(1), CompanySchema).optional(),
  futureCityIds: z.array(idSchema).optional(),
  homeCityId: idSchema.nullable().optional(),
  livedCityIds: z.array(idSchema).optional(),
  locales: z.array(z.string().trim().min(1)).optional(),
  map: z
    .strictObject({
      defaultCenter: CoordinatesSchema,
      defaultMaxZoom: finiteNumberSchema.positive(),
      defaultMinZoom: finiteNumberSchema.nonnegative(),
      defaultZoom: finiteNumberSchema.nonnegative(),
      hoveredCityZoom: finiteNumberSchema.positive(),
      marker: MarkerSizesSchema,
    })
    .optional(),
  media: z.strictObject({ root: z.string().trim().min(1) }).optional(),
  site: z
    .strictObject({
      author: z.string().optional(),
      description: z.string().optional(),
      domain: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      name: z.string().trim().min(1).optional(),
    })
    .optional(),
  trips: z
    .strictObject({ groupByCitiesCutoffYear: finiteNumberSchema.int() })
    .optional(),
  unescoSites: z.record(z.string().min(1), z.array(z.string())).optional(),
});

/** Raw authored data accepted by the world graph builder. */
export const WorldSourcesSchema = z.strictObject({
  cities: z.array(CityJsonSchema),
  countries: z.array(CountryJsonSchema),
  futureCityIds: z.array(idSchema).optional(),
  homeCityId: idSchema.nullable().optional(),
  livedCityIds: z.array(idSchema).optional(),
  photos: z.record(z.string(), z.array(ImageSchema)),
  trips: z.array(TripJsonSchema),
});

/** Serializable country data authored in the forkable dataset. */
export type CountryJson = z.infer<typeof CountryJsonSchema>;

/** Serializable city data authored in the forkable dataset. */
export type CityJson = z.infer<typeof CityJsonSchema>;

/** A serialized stop in a trip itinerary. */
export type TripStopJson = z.infer<typeof TripStopJsonSchema>;

/** A serialized transport leg in a trip itinerary. */
export type TripTransportJson = z.infer<typeof TripTransportJsonSchema>;

/** A serialized trip authored in the forkable dataset. */
export type TripJson = z.infer<typeof TripJsonSchema>;

/** Fork-owned site, map, media, and classification settings. */
export type SiteConfig = z.infer<typeof SiteConfigSchema>;

/** A configured transport operator. */
export type Company = z.infer<typeof CompanySchema>;

/** A gallery item stored in a photo manifest, which a video may not yet have a source for. */
export type Image = z.infer<typeof ImageSchema>;

/**
 * A gallery item with a source, which is all a published gallery contains.
 * `buildWorld` drops the rest, so anything that reaches a component can render.
 */
export type PublishedImage = Image & { original: string };

/**
 * Reports whether a gallery item has a source yet. A video's is a YouTube id the
 * author pastes in after the uploader runs, so a stored manifest can hold one
 * that is not renderable.
 * @param {Image} image - The manifest entry to check
 * @returns {boolean} Whether the item can be rendered
 */
export function hasSource(image: Image): image is PublishedImage {
  return (image.original ?? "") !== "";
}

/** Min, max, and default map marker scales. */
export type MarkerSizes = z.infer<typeof MarkerSizesSchema>;

/** Transport modes supported by authored itinerary legs. */
export type TransportMode = z.infer<typeof TransportModeSchema>;

/** Raw authored data accepted by the world graph builder. */
export type WorldSources = z.input<typeof WorldSourcesSchema>;

/**
 * Narrows a pasted or imported JSON value to the authored trip shape, for the
 * editor's import flow where several document kinds arrive on the same path.
 * @param {unknown} value - Untrusted JSON value
 * @returns {boolean} Whether the value matches the trip contract
 */
export function isTripJson(value: unknown): value is TripJson {
  return TripJsonSchema.safeParse(value).success;
}
