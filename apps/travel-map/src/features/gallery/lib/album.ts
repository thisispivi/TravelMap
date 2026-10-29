import { PublishedImage } from "@travelmap/core";

import { Album, AlbumSection } from "@/data/albums";

/**
 * One photo of an album with the visit it belongs to, which the lightbox
 * captions it with.
 * @property {PublishedImage} photo - The photo
 * @property {AlbumSection} section - The visit it was taken on
 */
export interface AlbumPhoto {
  photo: PublishedImage;
  section: AlbumSection;
}

/**
 * Flattens an album into the single sequence the lightbox walks.
 * @param {Album} album - The album
 * @returns {AlbumPhoto[]} Every photo, in album order
 */
export function albumPhotos(album: Album): AlbumPhoto[] {
  return album.sections.flatMap((section) =>
    section.photos.map((photo) => ({ photo, section })),
  );
}
