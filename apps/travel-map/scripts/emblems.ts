import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

import sharp from "sharp";

/* Full-size drawings as an image generator delivers them, one `<CODE>.png` each. */
const ORIGINALS = "emblem-originals";
const OUTPUT = "public/stamp-emblems";

/* A stamp prints its drawing about 60 px wide; 256 px stays sharp on a 3x screen. */
const SIZE = 256;

/* Room left around the drawing, as a share of its longer side. */
const MARGIN = 0.02;

/* How opaque a pixel must be to count as ink rather than the generator's haze. */
const INK_ALPHA = 8;

/**
 * The box a drawing's ink fills.
 * @property {number} left - Its first column
 * @property {number} top - Its first row
 * @property {number} width - Its width
 * @property {number} height - Its height
 */
interface InkBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Finds the box a drawing's ink fills, read from its alpha channel. Sharp's own
 * `trim()` compares colours, which a black drawing on a transparent background
 * defeats.
 * @param {string} file - The original's path
 * @returns {Promise<InkBox>} The box
 */
async function inkBoxOf(file: string): Promise<InkBox> {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let [left, top, right, bottom] = [info.width, info.height, 0, 0];
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++)
      if ((data[(y * info.width + x) * 4 + 3] ?? 0) > INK_ALPHA) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
  if (right < left) throw new Error(`${file} has no ink.`);
  return { height: bottom - top + 1, left, top, width: right - left + 1 };
}

/**
 * Turns one original into the drawing the site ships: cropped to its ink,
 * centred on a square with a thin margin so every drawing fills its stamp
 * alike, scaled down, and saved as lossless WebP, which keeps the alpha the
 * stamp prints through.
 * @param {string} code - The country's code, which names both files
 * @returns {Promise<void>} Done once the drawing is written
 */
async function convert(code: string): Promise<void> {
  const file = join(ORIGINALS, `${code}.png`);
  const box = await inkBoxOf(file);
  const side = Math.ceil(Math.max(box.width, box.height) * (1 + MARGIN * 2));
  const left = Math.floor((side - box.width) / 2);
  const top = Math.floor((side - box.height) / 2);
  /* Sharp resizes before it extends within one pipeline, so the square is made first. */
  const square = await sharp(file)
    .ensureAlpha()
    .extract(box)
    .extend({
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      bottom: side - box.height - top,
      left,
      right: side - box.width - left,
      top,
    })
    .png()
    .toBuffer();
  await sharp(square)
    .resize(SIZE, SIZE)
    .webp({ lossless: true })
    .toFile(join(OUTPUT, `${code}.webp`));
  rmSync(join(OUTPUT, `${code}.png`), { force: true });
}

if (!existsSync(ORIGINALS)) mkdirSync(ORIGINALS);
const codes = readdirSync(ORIGINALS)
  .filter((name) => /^[A-Z]{2}\.png$/.test(name))
  .map((name) => name.slice(0, 2));
for (const code of codes) await convert(code);
console.log(
  codes.length > 0
    ? `Converted ${codes.join(", ")} into ${OUTPUT}.`
    : `No <CODE>.png in ${ORIGINALS}/ to convert.`,
);
