import { readdirSync, readFileSync } from "node:fs";

import { COUNTRIES, findCountry } from "@travelmap/core";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Stamp, StampEmblem } from "./Stamp";

const EMBLEMS = `${import.meta.dirname}/../../../../../public/stamp-emblems`;

/* The catalogue always holds Italy; the catalogue's own tests say so. */
const italy = findCountry("IT")!;

describe("Stamp", () => {
  it("prints the name and the lines as live text", () => {
    const markup = renderToStaticMarkup(
      <Stamp country={italy} lines={["11 Jun 2016", "Rome"]} name="Italia" />,
    );
    for (const text of ["Italia", "11 Jun 2016", "Rome"])
      expect(markup).toContain(text);
    expect(markup).toContain("/stamp-emblems/IT.png");
  });

  it("prints a drawing through its alpha, in the stamp's ink", () => {
    const markup = renderToStaticMarkup(
      <StampEmblem drawing="/stamp-emblems/IT.png" />,
    );
    expect(markup).toContain('href="/stamp-emblems/IT.png"');
    expect(markup).toContain("mask-type:alpha");
    expect(markup).toContain('fill="currentColor"');
  });
});

describe("the shipped drawings", () => {
  const files = readdirSync(EMBLEMS);

  it.each(files)("%s is a country's transparent square PNG", (file) => {
    expect(COUNTRIES.has(file.replace(/\.png$/, "")), file).toBe(true);
    const png = readFileSync(`${EMBLEMS}/${file}`);
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(png.readUInt32BE(16)).toBe(png.readUInt32BE(20));
    /* Colour type 6 is RGBA: the stamp prints the drawing through its alpha. */
    expect(png[25]).toBe(6);
  });
});
