import { Image, ImageSchema } from "@travelmap/core";
import { z } from "zod";

import {
  ErrorResponseSchema,
  parseJsonResponse,
} from "../../../shared/lib/httpResponse";

/** How far one file has got. */
type UploadStatus = "waiting" | "uploading" | "processing" | "done" | "failed";

/**
 * One file in the upload panel.
 * @property {string} id - Stable key for the row
 * @property {File} file - The chosen file
 * @property {UploadStatus} status - How far it has got
 * @property {number} progress - Bytes sent, from 0 to 1
 * @property {string} [error] - Why it failed, in words the author can act on
 * @property {Image} [image] - The manifest entry once the server has made it
 */
export interface UploadItem {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  image?: Image;
}

/**
 * Where uploads for one visit go.
 * @property {string} country - The visit's country id
 * @property {string} city - The visit's city id
 * @property {"local" | "bunny"} target - Local media folder or Bunny Storage
 */
export interface UploadDestination {
  country: string;
  city: string;
  target: "local" | "bunny";
}

/** What the editor's server can do with media, so the panel offers only that. */
const MediaConfigSchema = z.strictObject({
  bunny: z.boolean(),
  ffmpeg: z.boolean(),
  mediaRoot: z.string(),
});

/** What the editor's server can do with media. */
export type MediaConfig = z.infer<typeof MediaConfigSchema>;

/* Three keeps a home connection busy without starving the encoder. */
export const UPLOAD_CONCURRENCY = 3;

/**
 * Sends one file to the editor's server, reporting bytes sent as it goes.
 * XHR rather than fetch because fetch still cannot report upload progress.
 * @param {File} file - The file
 * @param {UploadDestination} destination - Where it goes
 * @param {(progress: number) => void} onProgress - Called with 0–1 as bytes leave
 * @returns {Promise<Image>} The manifest entry the server made
 */
export function uploadFile(
  file: File,
  destination: UploadDestination,
  onProgress: (progress: number) => void,
): Promise<Image> {
  const query = new URLSearchParams({ ...destination, name: file.name });
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `/__media/upload?${query}`);
    request.setRequestHeader("Content-Type", "application/octet-stream");
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    request.onerror = () =>
      reject(new Error("The connection to the editor was lost."));
    request.onload = () => {
      let body: unknown;
      try {
        body = JSON.parse(request.responseText);
      } catch {
        reject(new Error("The editor sent back something unreadable."));
        return;
      }
      if (request.status === 200) {
        const image = ImageSchema.safeParse(body);
        if (image.success) resolve(image.data);
        else
          reject(new Error("The editor sent back an invalid gallery entry."));
        return;
      }
      const error = ErrorResponseSchema.safeParse(body);
      reject(
        new Error(
          error.success
            ? error.data.error
            : `Upload failed (${request.status}).`,
        ),
      );
    };
    request.send(file);
  });
}

/**
 * Adds freshly uploaded entries to a gallery. New entries are ordered by when
 * each photo was taken, as far as the browser knows; an entry replacing one
 * with the same thumbnail keeps its old place, so re-uploading a photo fixes
 * it instead of duplicating it.
 * @param {Image[]} existing - The gallery as it is
 * @param {{ image: Image; takenAt: number }[]} added - New entries and their file times
 * @returns {Image[]} The gallery to write
 */
export function nextManifest(
  existing: Image[],
  added: { image: Image; takenAt: number }[],
): Image[] {
  const byThumbnail = new Map(
    added.map(({ image }) => [image.thumbnail, image]),
  );
  const kept = existing.map(
    (image) => byThumbnail.get(image.thumbnail) ?? image,
  );
  const known = new Set(existing.map((image) => image.thumbnail));
  const fresh = new Map(
    added
      .filter(({ image }) => !known.has(image.thumbnail))
      .toSorted((first, second) => first.takenAt - second.takenAt)
      .map(({ image }) => [image.thumbnail, image]),
  );
  return [...kept, ...fresh.values()];
}

/**
 * Asks the editor's server what it can do with media.
 * @returns {Promise<MediaConfig>} Whether Bunny and ffmpeg are available, and the media root
 */
export async function fetchMediaConfig(): Promise<MediaConfig> {
  return parseJsonResponse(await fetch("/__media/config"), MediaConfigSchema);
}
