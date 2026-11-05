import { describe, expect, it, vi } from "vitest";

import { galleryPhotos, mediaUrl } from "./media";

const photos = [1, 2, 3, 4].map((n) => ({
  height: 2,
  original: `/Italy/Rome/00${n}c.webp`,
  thumbnail: `/Italy/Rome/00${n}t.webp`,
  width: 3,
}));

describe("galleryPhotos", () => {
  it("gives a visit only its own part of a shared manifest", () => {
    expect(
      galleryPhotos(photos, { count: 2, path: "p", range: { from: 2, to: 3 } }),
    ).toEqual([photos[1], photos[2]]);
  });

  it("runs an open-ended range to the last entry", () => {
    expect(
      galleryPhotos(photos, { count: 1, path: "p", range: { from: 4 } }),
    ).toEqual([photos[3]]);
  });

  it("leaves a video out until it has a YouTube id", () => {
    const unfinishedVideo = {
      height: 9,
      original: "",
      thumbnail: "/Italy/Rome/005t.webp",
      width: 16,
      youtube: true,
    };

    expect(
      galleryPhotos([photos[0]!, unfinishedVideo], { count: 1, path: "p" }),
    ).toEqual([photos[0]]);
  });
});

describe("mediaUrl", () => {
  it("prefixes an authored path with the configured media root", () => {
    vi.stubEnv("VITE_CDN_PATH", "https://cdn.example.com");

    expect(mediaUrl("/Trips/rome.webp")).toBe(
      "https://cdn.example.com/Trips/rome.webp",
    );

    vi.unstubAllEnvs();
  });

  it("leaves the path relative rather than interpolating undefined", () => {
    vi.stubEnv("VITE_CDN_PATH", undefined);

    expect(mediaUrl("/Trips/rome.webp")).toBe("/Trips/rome.webp");

    vi.unstubAllEnvs();
  });
});
