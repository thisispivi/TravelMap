import { City, Gallery, PublishedImage, Trip } from "@travelmap/core";

import { loadGallery } from "./photos";
import { visitedTrips } from "./world";

/**
 * The photos of one visit: a stay, or a place seen on a day trip or along the
 * way.
 * @property {string} key - A stable id for the visit
 * @property {City} city - Where the photos were taken
 * @property {Trip} trip - The trip the visit belongs to
 * @property {Date} sDate - When the visit started
 * @property {Date} eDate - When it ended
 * @property {Gallery} gallery - The part of a manifest holding the visit's photos
 * @property {number} offset - The index of the visit's first photo in its album
 * @property {{ minPhotos?: number; maxPhotos?: number }} [rowConstraints] - Gallery row overrides
 * @property {number} [targetRowHeight] - Gallery row height override
 */
export interface AlbumSection {
  key: string;
  city: City;
  trip: Trip;
  sDate: Date;
  eDate: Date;
  gallery: Gallery;
  offset: number;
  rowConstraints?: { minPhotos?: number; maxPhotos?: number };
  targetRowHeight?: number;
}

/**
 * Every photo of a trip or a place, grouped by visit. The lightbox walks the
 * album as one sequence, so each section records where it starts in it.
 * @property {"trip" | "place"} kind - Whether the album gathers a trip or a place
 * @property {string} id - The trip or city id
 * @property {AlbumSection[]} sections - The visits, in travel order
 * @property {number} count - Photos in the whole album
 */
export interface Album {
  kind: "trip" | "place";
  id: string;
  sections: AlbumSection[];
  count: number;
}

/**
 * A visit with its photos loaded.
 * @property {PublishedImage[]} photos - The visit's photos, in order
 */
export interface LoadedAlbumSection extends AlbumSection {
  photos: PublishedImage[];
}

/**
 * An album whose photos have loaded, which only the gallery and the lightbox
 * need; everything else reads the counts.
 * @property {LoadedAlbumSection[]} sections - The visits, with their photos
 */
export interface LoadedAlbum extends Album {
  sections: LoadedAlbumSection[];
}

/**
 * Gives each visit its starting position in the album.
 * @param {Omit<AlbumSection, "offset">[]} visits - The visits, in order
 * @returns {AlbumSection[]} The visits with offsets
 */
function withOffsets(visits: Omit<AlbumSection, "offset">[]): AlbumSection[] {
  let offset = 0;
  return visits.map((visit) => {
    const section = { ...visit, offset };
    offset += visit.gallery.count;
    return section;
  });
}

/**
 * Lists a trip's photographed visits, optionally only those in one city.
 * Two visits can point at the same photo folder — Sydney before and after
 * Cairns, Toulon either side of New Year — and showing the folder twice would
 * double every photo, so a repeated folder joins the first visit instead and
 * stretches its dates to cover both. A folder is one manifest and range.
 * @param {Trip} trip - The trip
 * @param {City} [city] - Restricts the visits to this city
 * @returns {Omit<AlbumSection, "offset">[]} The visits with photos
 */
function visitsOf(trip: Trip, city?: City): Omit<AlbumSection, "offset">[] {
  const byFolder = new Map<string, Omit<AlbumSection, "offset">>();
  const visits: Omit<AlbumSection, "offset">[] = [];
  for (const destination of trip.destinations) {
    const { gallery, city: place } = destination;
    if (!gallery?.count || (city && place.id !== city.id)) continue;
    const folder = `${place.id}:${gallery.path}:${gallery.range?.from}-${gallery.range?.to}`;
    const earlier = byFolder.get(folder);
    if (earlier) {
      earlier.eDate = destination.eDate;
      continue;
    }
    const visit = {
      city: place,
      eDate: destination.eDate,
      gallery,
      key: `${trip.id}-${place.id}-${destination.travelIdx}`,
      rowConstraints: destination.rowConstraints,
      sDate: destination.sDate,
      targetRowHeight: destination.targetRowHeight,
      trip,
    };
    byFolder.set(folder, visit);
    visits.push(visit);
  }
  return visits;
}

/**
 * Builds an album from its visits.
 * @param {Album["kind"]} kind - What the album gathers
 * @param {string} id - The trip or city id
 * @param {Omit<AlbumSection, "offset">[]} visits - The visits, in order
 * @returns {Album} The album
 */
function albumOf(
  kind: Album["kind"],
  id: string,
  visits: Omit<AlbumSection, "offset">[],
): Album {
  const sections = withOffsets(visits);
  return {
    count: sections.reduce((sum, section) => sum + section.gallery.count, 0),
    id,
    kind,
    sections,
  };
}

/** Trips with at least one photo, newest first, each with its album. */
export const tripAlbums: { trip: Trip; album: Album }[] = visitedTrips
  .map((trip) => ({ album: albumOf("trip", trip.id, visitsOf(trip)), trip }))
  .filter(({ album }) => album.count > 0)
  .toSorted(
    (first, second) => second.trip.sDate.getTime() - first.trip.sDate.getTime(),
  );

/**
 * Finds a trip's album.
 * @param {string} tripId - The trip id
 * @returns {Album | undefined} The album, when the trip has photos
 */
export function findTripAlbum(tripId: string): Album | undefined {
  return tripAlbums.find(({ trip }) => trip.id === tripId)?.album;
}

/** Photos per city id across every trip, read off the trip albums once. */
const PLACE_PHOTO_COUNTS = tripAlbums
  .flatMap(({ album }) => album.sections)
  .reduce(
    (counts, { city, gallery }) =>
      counts.set(city.id, (counts.get(city.id) ?? 0) + gallery.count),
    new Map<string, number>(),
  );

/**
 * Counts the photos taken in a city, the same total its album would hold,
 * without building the album.
 * @param {City} city - The city
 * @returns {number} Its photos across every trip
 */
export function placePhotoCount(city: City): number {
  return PLACE_PHOTO_COUNTS.get(city.id) ?? 0;
}

/**
 * Gathers every photo taken in a city, across all trips, oldest visit first.
 * @param {City} city - The city
 * @returns {Album} The city's album, possibly empty
 */
export function placeAlbum(city: City): Album {
  return albumOf(
    "place",
    city.id,
    visitedTrips
      .flatMap((trip) => visitsOf(trip, city))
      .toSorted(
        (first, second) => first.sDate.getTime() - second.sDate.getTime(),
      ),
  );
}

/**
 * Loads the photos of every visit in an album, each manifest once however many
 * visits share it.
 * @param {Album} album - The album, counted but not loaded
 * @returns {Promise<LoadedAlbum>} The same album with its photos
 */
export async function loadAlbum(album: Album): Promise<LoadedAlbum> {
  const sections = await Promise.all(
    album.sections.map(async (section) => ({
      ...section,
      photos: await loadGallery(section.gallery),
    })),
  );
  return { ...album, sections };
}
