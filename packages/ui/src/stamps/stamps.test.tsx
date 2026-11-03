import { Continent } from "@travelmap/core";
import { renderToStaticMarkup } from "react-dom/server";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { describe, expect, it } from "vitest";

import countriesTopologyJson from "../assets/json/countries-50m.json";
import { STAMP_CATALOGUE, stampName } from "./catalogue";
import { COVER_NAMES, passportCoverOf } from "./covers";
import { EmblemSet, loadEmblems } from "./emblems";
import { fitName, FRAME_GEOMETRY, STAMP_FRAMES, stampTilt } from "./frames";
import { contrastOn, inkFor } from "./ink";
import { Stamp, StampEmblem } from "./Stamp";

const EMBLEM_BYTES = 2048;
const ALLOWED_TAGS = new Set([
  "svg",
  "path",
  "line",
  "circle",
  "ellipse",
  "polyline",
  "polygon",
  "g",
]);

const topology = countriesTopologyJson as unknown as Topology<{
  countries: GeometryCollection<{ name: string }>;
}>;
const collection = feature(topology, topology.objects.countries);
const featureNames = collection.features.flatMap(
  ({ properties }) => properties?.name ?? [],
);

const emblemSets = await Promise.all(
  Object.values(Continent).map(async (continent) => ({
    continent,
    emblems: await loadEmblems(continent),
  })),
);
const emblemsOf = new Map<Continent, EmblemSet>(
  emblemSets.map(({ continent, emblems }) => [continent, emblems]),
);
const entries = Object.entries(STAMP_CATALOGUE);

describe("the catalogue", () => {
  it("covers every country of the map and nothing else", () => {
    expect(featureNames).toHaveLength(241);
    expect(Object.keys(STAMP_CATALOGUE).toSorted()).toEqual(
      featureNames.toSorted(),
    );
  });

  it("has a drawing for every country, in its continent's own module", () => {
    for (const [name, { continent, emblem }] of entries)
      expect(emblemsOf.get(continent)?.[emblem], name).toBeTruthy();
  });

  it("gives every country its own drawing and leaves none unused", () => {
    const used = entries.map(([, { emblem }]) => emblem);
    const drawn = new Set(
      emblemSets.flatMap(({ emblems }) => Object.keys(emblems)),
    );
    expect(new Set(used).size).toBe(used.length);
    expect(new Set(used)).toEqual(drawn);
  });

  it("keeps any one frame to at most 15% of the countries", () => {
    for (const frame of STAMP_FRAMES) {
      const uses = entries.filter(([, entry]) => entry.frame === frame).length;
      expect(uses, frame).toBeGreaterThan(0);
      expect(uses / entries.length, frame).toBeLessThanOrEqual(0.15);
    }
  });

  it("varies the frames within each continent", () => {
    for (const continent of Object.values(Continent)) {
      const frames = entries.flatMap(([, entry]) =>
        entry.continent === continent ? [entry.frame] : [],
      );
      expect(new Set(frames).size, continent).toBeGreaterThanOrEqual(
        Math.min(frames.length, 12),
      );
    }
  });

  it("offers at least fourteen frames", () => {
    expect(STAMP_FRAMES.length).toBeGreaterThanOrEqual(14);
  });

  it("names a country in the reader's language", () => {
    expect(stampName("Germany", "it-IT")).toBe("Germania");
    expect(stampName("N. Cyprus", "it-IT")).toBe("Cipro del Nord");
    expect(stampName("Somaliland", "en-US")).toBe("Somaliland");
  });
});

describe("passportCoverOf", () => {
  it("knows every country it names by the map's own name", () => {
    for (const name of COVER_NAMES)
      expect(STAMP_CATALOGUE[name], name).toBeTruthy();
    expect(new Set(COVER_NAMES).size).toBe(COVER_NAMES.length);
  });

  it("gives each passport its real cover, and burgundy to the rest", () => {
    expect(passportCoverOf("Italy")).toBe("red");
    expect(passportCoverOf("Croatia")).toBe("blue");
    expect(passportCoverOf("UnitedStatesOfAmerica")).toBe("blue");
    expect(passportCoverOf("Mexico")).toBe("green");
    expect(passportCoverOf("NewZealand")).toBe("black");
    expect(passportCoverOf("Somewhere")).toBe("red");
  });
});

describe("every emblem", () => {
  const drawings = emblemSets.flatMap(({ emblems }) => Object.entries(emblems));

  it.each(drawings)("%s is a clean line drawing", (_name, drawing) => {
    const markup = renderToStaticMarkup(<StampEmblem drawing={drawing} />);
    const host = new DOMParser().parseFromString(markup, "text/html").body;
    const elements = [...host.querySelectorAll("*")];

    expect(host.querySelector("svg")?.getAttribute("viewBox")).toBe(
      "0 0 64 64",
    );
    expect(markup.length).toBeLessThan(EMBLEM_BYTES);
    expect(/<(script|image|text|foreignObject)\b|\son\w+=/i.test(markup)).toBe(
      false,
    );
    for (const element of elements) {
      expect(ALLOWED_TAGS).toContain(element.tagName.toLowerCase());
      const fill = element.getAttribute("fill");
      if (fill) expect(["none", "currentColor"]).toContain(fill);
    }
  });

  it.each(drawings)("%s stays on its 64×64 canvas", (_name, drawing) => {
    const absolute = [
      ...drawing.matchAll(/([MLHVCA])([^MLHVCAmlhvca Zz]*[^A-Za-z]*)/g),
    ];
    for (const [, command, args] of absolute) {
      const numbers = (args ?? "").match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
      /* Arc commands mix flags and radii with their end point; only that is a place. */
      const places = command === "A" ? numbers.slice(-2) : numbers;
      for (const place of places) {
        expect(place).toBeGreaterThanOrEqual(0);
        expect(place).toBeLessThanOrEqual(64);
      }
    }
  });
});

describe("the frames", () => {
  it("wraps a long name on a straight frame, and keeps a short one whole", () => {
    const frame = FRAME_GEOMETRY.rectangle;
    expect(fitName("Bosnia and Herzegovina", frame, "caps").lines).toEqual([
      "Bosnia and",
      "Herzegovina",
    ]);
    expect(fitName("Italy", frame, "caps").lines).toEqual(["Italy"]);
  });

  it("shrinks a long name on a curved frame rather than wrapping it", () => {
    const frame = FRAME_GEOMETRY.circle;
    const short = fitName("Peru", frame, "curved");
    const long = fitName("Bosnia and Herzegovina", frame, "curved");
    expect(long.lines).toHaveLength(1);
    expect(long.size).toBeLessThanOrEqual(short.size);
  });

  it("tilts a stamp the same way every time, within six degrees", () => {
    for (const [name] of entries) {
      expect(stampTilt(name)).toBe(stampTilt(name));
      expect(Math.abs(stampTilt(name))).toBeLessThanOrEqual(6);
    }
    expect(
      new Set(entries.map(([name]) => stampTilt(name))).size,
    ).toBeGreaterThan(100);
  });
});

describe("inkFor", () => {
  const PALE = "#f7f1e1";
  const DARK = "#2a2823";

  it.each([
    { h: 48, l: 50, s: 95 },
    { h: 84, l: 44, s: 81 },
    { h: 330, l: 70, s: 70 },
    { h: 0, l: 50, s: 100 },
    { h: 195, l: 90, s: 85 },
    { h: 240, l: 8, s: 60 },
  ])("reaches AA on both papers from %o", (color) => {
    expect(contrastOn(inkFor(color, PALE), PALE)).toBeGreaterThanOrEqual(4.5);
    expect(contrastOn(inkFor(color, DARK), DARK)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the hue of the country's colour", () => {
    expect(inkFor({ h: 48, l: 50, s: 95 }, PALE).h).toBe(48);
  });
});

describe("Stamp", () => {
  it("prints the name and the lines as live text", () => {
    const markup = renderToStaticMarkup(
      <Stamp
        color={{ h: 84, l: 44, s: 81 }}
        emblem="M4 4h56"
        frame="circle"
        id="Italy"
        lines={["11 Jun 2016", "Rome"]}
        name="Italia"
        textStyle="curved"
      />,
    );
    for (const text of ["Italia", "11 Jun 2016", "Rome"])
      expect(markup).toContain(text);
    expect(markup).toContain("textPath");
  });
});
