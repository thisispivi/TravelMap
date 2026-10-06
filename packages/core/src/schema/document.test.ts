import { describe, expect, it } from "vitest";

import { DatasetDocumentSchema, DatasetPathSchema } from "./document";

describe("dataset document boundary", () => {
  it.each([
    "../site.config.json",
    "/site.config.json",
    "photos/../../outside.json",
    "photos/a\\b.json",
    "photos/C:escape.json",
    ".hidden.json",
    "trips/nested/trip.json",
  ])("rejects nonportable or unowned paths: %s", (path) => {
    expect(DatasetPathSchema.safeParse(path).success).toBe(false);
  });

  it("normalizes a valid document and rejects contents for the wrong path", () => {
    expect(
      DatasetDocumentSchema.parse({
        path: "site.config.json",
        value: { site: { name: " Map " } },
      }),
    ).toEqual({ path: "site.config.json", value: { site: { name: "Map" } } });
    expect(
      DatasetDocumentSchema.safeParse({ path: "trips/trip.json", value: {} })
        .success,
    ).toBe(false);
    expect(
      DatasetDocumentSchema.safeParse({
        path: "photos/Italy/Rome/trip.json",
        value: [],
      }).success,
    ).toBe(true);
  });
});
