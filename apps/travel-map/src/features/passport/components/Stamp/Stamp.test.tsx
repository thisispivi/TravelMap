import { readdirSync } from "node:fs";

import { COUNTRIES, findCountry } from "@travelmap/core";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
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
    expect(markup).toContain("/stamp-emblems/IT.webp");
  });

  it("prints a drawing through its alpha, in the stamp's ink", () => {
    const markup = renderToStaticMarkup(
      <StampEmblem drawing="/stamp-emblems/IT.webp" />,
    );
    expect(markup).toContain('href="/stamp-emblems/IT.webp"');
    expect(markup).toContain("mask-type:alpha");
    expect(markup).toContain('fill="currentColor"');
  });
});

describe("the shipped drawings", () => {
  const files = readdirSync(EMBLEMS);

  it.each(files)("%s is a country's transparent 256 px WebP", async (file) => {
    expect(COUNTRIES.has(file.replace(/\.webp$/, "")), file).toBe(true);
    const { format, hasAlpha, height, width } = await sharp(
      `${EMBLEMS}/${file}`,
    ).metadata();
    expect(format).toBe("webp");
    /* The stamp prints the drawing through its alpha. */
    expect(hasAlpha).toBe(true);
    /* A stamp prints its drawing about 60 px wide; 256 px stays sharp on a 3x screen. */
    expect([width, height]).toEqual([256, 256]);
  });
});
