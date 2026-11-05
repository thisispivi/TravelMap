import { PublishedImage } from "@travelmap/core";

import { LoadedAlbum, LoadedAlbumSection } from "@/data/albums";

/**
 * One photo of an album with the visit it belongs to, which the lightbox
 * captions it with.
 * @property {PublishedImage} photo - The photo
 * @property {LoadedAlbumSection} section - The visit it was taken on
 */
export interface AlbumPhoto {
  photo: PublishedImage;
  section: LoadedAlbumSection;
}

/**
 * Flattens an album into the single sequence the lightbox walks.
 * @param {LoadedAlbum} album - The album, with its photos
 * @returns {AlbumPhoto[]} Every photo, in album order
 */
export function albumPhotos(album: LoadedAlbum): AlbumPhoto[] {
  return album.sections.flatMap((section) =>
    section.photos.map((photo) => ({ photo, section })),
  );
}
