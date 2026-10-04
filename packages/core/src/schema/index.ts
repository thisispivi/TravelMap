import { z } from "zod";

import { Continent } from "../typings/Continent.ts";
import { Currency } from "../typings/Currency.ts";

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

/**
 * Reports whether the runtime recognises an IANA time zone. `Intl` throws a
 * bare RangeError on an unknown name, which would otherwise surface far from
 * the city that carries it.
 * @param {string} timeZone - Candidate zone name
 * @returns {boolean} Whether `Intl` can format dates in that zone
 */
function isKnownTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** An IANA time zone the date maths can actually use. */
const TimeZoneSchema = z
  .string()
  .trim()
  .min(1)
  .refine(isKnownTimeZone, "Expected an IANA time zone such as Europe/Rome.");

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
  timeZone: TimeZoneSchema,
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
  )
  .pipe(
    z.union([z.iso.date(), z.iso.datetime({ local: true, precision: -1 })]),
  );

/** A calendar day, read in the city where it happens. */
export const CalendarDateSchema = z.iso.date();

/** Gallery row overrides for a visit's photos. */
const RowConstraintsSchema = z.strictObject({
  maxPhotos: finiteNumberSchema.int().positive().optional(),
  minPhotos: finiteNumberSchema.int().positive().optional(),
});

/**
 * One ride from wherever the traveller stands to `toId`. A leg never names its
 * departure city: it starts where the previous leg ended, at its stay, or at the
 * trip's origin, so a chain of legs can never disagree with itself. `depart` is
 * the wall clock in the departure city and `arrive` in the arrival city.
 */
export const TripLegJsonSchema = z.strictObject({
  arrive: LocalDateSchema.optional(),
  depart: LocalDateSchema.optional(),
  distanceInKm: finiteNumberSchema.nonnegative().optional(),
  durationMinutes: finiteNumberSchema.nonnegative().optional(),
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
  mode: TransportModeSchema,
  photoPath: z.string().trim().min(1).optional(),
  rowConstraints: RowConstraintsSchema.optional(),
  targetRowHeight: finiteNumberSchema.positive().optional(),
  toId: idSchema,
  viaIds: z.array(idSchema).optional(),
  visited: z.literal(true).optional(),
});

/** A non-empty chain of legs. */
const LegsSchema = z.array(TripLegJsonSchema).min(1);

/** A day trip that leaves a stay and comes back to it on the same date. */
export const TripOutingJsonSchema = z.strictObject({
  date: CalendarDateSchema,
  legs: LegsSchema,
});

/**
 * A place the traveller slept. Nights are `checkOut - checkIn`, so a stay is
 * the one thing that answers "where did I sleep on the 24th".
 */
export const TripStayJsonSchema = z
  .strictObject({
    checkIn: CalendarDateSchema,
    checkOut: CalendarDateSchema,
    cityId: idSchema,
    outings: z.array(TripOutingJsonSchema).optional(),
    photoPath: z.string().trim().min(1).optional(),
    rowConstraints: RowConstraintsSchema.optional(),
    targetRowHeight: finiteNumberSchema.positive().optional(),
    type: z.literal("stay"),
  })
  .refine((stay) => stay.checkOut >= stay.checkIn, {
    error: "A stay cannot check out before it checks in.",
    path: ["checkOut"],
  });

/** Getting from one stay to the next, possibly through changes and stopovers. */
export const TripMoveJsonSchema = z.strictObject({
  legs: LegsSchema,
  type: z.literal("move"),
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
  sDate: LocalDateSchema,
  steps: z.array(
    z.discriminatedUnion("type", [TripStayJsonSchema, TripMoveJsonSchema]),
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

/** One ride inside a move or a day trip. */
export type TripLegJson = z.infer<typeof TripLegJsonSchema>;

/** A day trip from a stay. */
export type TripOutingJson = z.infer<typeof TripOutingJsonSchema>;

/** A place the traveller slept. */
export type TripStayJson = z.infer<typeof TripStayJsonSchema>;

/** Getting from one stay to the next. */
export type TripMoveJson = z.infer<typeof TripMoveJsonSchema>;

/** One element of a trip's itinerary. */
export type TripStepJson = TripJson["steps"][number];

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
