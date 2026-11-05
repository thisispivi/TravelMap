import {
  Gallery,
  galleryPhotos,
  Image,
  ImageSchema,
  PublishedImage,
} from "@travelmap/core";

/**
 * Turns a manifest's module path into the key trips name it by.
 * @param {string} path - The module path Vite reports
 * @returns {string} The manifest key, relative to `data/photos` and without `.json`
 */
function manifestKey(path: string): string {
  return path.replace(/^.*\/data\/photos\//, "").replace(/\.json$/, "");
}

/**
 * Re-keys a Vite module map by manifest key.
 * @param {Record<string, T>} modules - Modules keyed by path
 * @returns {Record<string, T>} The same modules keyed by manifest key
 */
function byManifestKey<T>(modules: Record<string, T>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(modules).map(([path, value]) => [manifestKey(path), value]),
  );
}

/*
 * Each manifest's publish flags, built by the `photo-index` Vite plugin. This is
 * all the first page needs to count photos; it is raw data that `buildWorld`
 * validates.
 */
export const photoIndex: Record<string, unknown> = byManifestKey(
  import.meta.glob("../../../../data/photos/**/*.json", {
    eager: true,
    import: "default",
    query: "?photo-index",
  }),
);

/* Every full manifest is its own chunk, fetched only by the album that shows it. */
const manifests = byManifestKey(
  import.meta.glob<unknown>("../../../../data/photos/**/*.json", {
    import: "default",
  }),
);

/*
 * The lightbox re-runs its album's loader on every photo it moves to, so a
 * manifest is fetched and validated once and the promise is kept.
 */
const loaded = new Map<string, Promise<Image[]>>();

/**
 * Loads and validates the manifest a gallery points into. A lazily loaded
 * manifest never passed through `buildWorld`, so this is its trust boundary.
 * @param {string} path - The manifest key
 * @returns {Promise<Image[]>} The manifest, or nothing for a key with no file
 */
function loadManifest(path: string): Promise<Image[]> {
  let manifest = loaded.get(path);
  if (!manifest) {
    const load = manifests[path];
    manifest = load
      ? load().then((value) => ImageSchema.array().parse(value))
      : Promise.resolve([]);
    loaded.set(path, manifest);
  }
  return manifest;
}

/**
 * Loads a visit's photos: its part of the manifest, without the entries that
 * cannot be published yet. The result holds `gallery.count` photos.
 * @param {Gallery} gallery - The visit's part of a manifest
 * @returns {Promise<PublishedImage[]>} The visit's photos, in authored order
 */
export async function loadGallery(gallery: Gallery): Promise<PublishedImage[]> {
  return galleryPhotos(await loadManifest(gallery.path), gallery);
}
