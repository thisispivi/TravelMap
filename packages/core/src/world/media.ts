import type { Gallery } from "../classes/Trip";
import { hasSource, Image, PhotoRange, PublishedImage } from "../schema";

/**
 * Resolves an authored media path against the fork's configured media root.
 * `VITE_CDN_PATH` is the only build-time value this package reads, and it is
 * optional on purpose: a fork that has not set it yet serves media from paths
 * relative to the site instead of interpolating `undefined` into every URL.
 * @param {string} path - Authored media path, as stored in the dataset
 * @returns {string} A browser-ready media URL
 */
export function mediaUrl(path: string): string {
  return `${import.meta.env.VITE_CDN_PATH ?? ""}${path}`;
}

/**
 * Cuts out the part of a manifest, or of its publishable index, that one visit
 * owns. Ranges are numbered from 1 and include both ends, as the author writes
 * them, and a missing end runs to the last entry.
 * @param {T} items - The manifest entries, or their index string
 * @param {PhotoRange} [range] - The visit's part, or the whole manifest when absent
 * @returns {T} The visit's entries
 */
export function sliceRange<
  T extends { slice(start?: number, end?: number): T },
>(items: T, range?: PhotoRange): T {
  return items.slice((range?.from ?? 1) - 1, range?.to);
}

/**
 * Resolves a visit's photos from its loaded manifest: its range, without the
 * videos still waiting for a YouTube id, which would render an empty embed.
 * The result has exactly `gallery.count` entries when the manifest is the one
 * the count was taken from.
 * @param {Image[]} images - The validated manifest
 * @param {Gallery} gallery - The visit's part of it
 * @returns {PublishedImage[]} The publishable photos, in authored order
 */
export function galleryPhotos(
  images: Image[],
  gallery: Gallery,
): PublishedImage[] {
  return sliceRange(images, gallery.range).filter(hasSource);
}
