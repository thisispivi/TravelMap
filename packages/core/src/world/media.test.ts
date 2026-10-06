import { describe, expect, it, vi } from "vitest";

import { mediaUrl } from "./media";

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
