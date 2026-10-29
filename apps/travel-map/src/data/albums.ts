import { City, PublishedImage, Trip } from "@travelmap/core";

import { visitedTrips } from "./world";

/**
 * The photos of one visit: a stay, or a place seen on a day trip or along the
 * way.
 * @property {string} key - A stable id for the visit
 * @property {City} city - Where the photos were taken
 * @property {Trip} trip - The trip the visit belongs to
 * @property {Date} sDate - When the visit started
 * @property {Date} eDate - When it ended
 * @property {PublishedImage[]} photos - The visit's photos, in order
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
  photos: PublishedImage[];
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
 * Gives each visit its starting position in the album.
 * @param {Omit<AlbumSection, "offset">[]} visits - The visits, in order
 * @returns {AlbumSection[]} The visits with offsets
 */
function withOffsets(visits: Omit<AlbumSection, "offset">[]): AlbumSection[] {
  let offset = 0;
  return visits.map((visit) => {
    const section = { ...visit, offset };
    offset += visit.photos.length;
    return section;
  });
}

/**
 * Lists a trip's photographed visits, optionally only those in one city.
 * Two visits can point at the same photo folder — Sydney before and after
 * Cairns, Toulon either side of New Year — and showing the folder twice would
 * double every photo, so a repeated folder joins the first visit instead and
 * stretches its dates to cover both.
 * @param {Trip} trip - The trip
 * @param {City} [city] - Restricts the visits to this city
 * @returns {Omit<AlbumSection, "offset">[]} The visits with photos
 */
function visitsOf(trip: Trip, city?: City): Omit<AlbumSection, "offset">[] {
  const byFolder = new Map<string, Omit<AlbumSection, "offset">>();
  const visits: Omit<AlbumSection, "offset">[] = [];
  for (const destination of trip.destinations) {
    const { photos, city: place } = destination;
    if (!photos?.length || (city && place.id !== city.id)) continue;
    /* A folder is identified by its first file and its size. */
    const folder = `${place.id}:${photos[0].original}:${photos.length}`;
    const earlier = byFolder.get(folder);
    if (earlier) {
      earlier.eDate = destination.eDate;
      continue;
    }
    const visit = {
      city: place,
      eDate: destination.eDate,
      key: `${trip.id}-${place.id}-${destination.travelIdx}`,
      photos,
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
    count: sections.reduce((sum, section) => sum + section.photos.length, 0),
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
