/* Every frame shares a 120×120 canvas, so any stamp fits any slot of a page. */
export const STAMP_FRAMES = [
  "arch",
  "banner",
  "circle",
  "clipped",
  "diamond",
  "doubleRing",
  "hexagon",
  "octagon",
  "oval",
  "pentagon",
  "postage",
  "rectangle",
  "rounded",
  "seal",
  "shield",
  "ticket",
] as const;

/** One of the shapes a stamp can be struck in. */
export type StampFrame = (typeof STAMP_FRAMES)[number];

/** How a stamp sets its country's name. */
export type StampTextStyle = "curved" | "caps" | "tracked" | "title";

/**
 * Where a line of small text sits inside a frame.
 * @property {number} y - Its baseline
 * @property {number} width - The room it has, centred on the canvas
 */
interface FrameLine {
  y: number;
  width: number;
}

/**
 * A curve the name runs along, on the round frames.
 * @property {string} path - The path, drawn left to right
 * @property {number} length - Its length, the room the name has
 */
interface FrameArc {
  path: string;
  length: number;
}

/**
 * The geometry of one frame.
 * @property {string} outline - The outer rule
 * @property {string} [inner] - A second rule inside it
 * @property {"dashed" | "dotted"} [innerBorder] - How the second rule is broken
 * @property {FrameArc} [arc] - The curve a curved name runs along
 * @property {boolean} [keepsOneLine] - Whether a straight name has no room for a second line
 * @property {number} nameY - The baseline of a straight name
 * @property {number} nameWidth - The room a straight name has
 * @property {number} emblemY - The top of the emblem
 * @property {number} emblemSize - The emblem's width and height
 * @property {boolean} emblemGrows - Whether the emblem may use the room of missing lines
 * @property {FrameLine[]} lines - The date, city and arrival lines, top to bottom
 */
export interface FrameGeometry {
  outline: string;
  inner?: string;
  innerBorder?: "dashed" | "dotted";
  arc?: FrameArc;
  keepsOneLine?: boolean;
  nameY: number;
  nameWidth: number;
  emblemY: number;
  emblemSize: number;
  emblemGrows: boolean;
  lines: FrameLine[];
}

/**
 * How a name or a line of text fits the room it has.
 * @property {number} size - Its font size
 * @property {string[]} lines - The text, in as many lines as it takes
 * @property {boolean} isCompressed - Whether it has to be squeezed even at the smallest size
 */
export interface FittedText {
  size: number;
  lines: string[];
  isCompressed: boolean;
}

/**
 * Traces a circle as a path, so every frame is one `d` string.
 * @param {number} radius - The circle's radius, centred on the canvas
 * @returns {string} The path
 */
function ring(radius: number): string {
  return `M${60 - radius} 60a${radius} ${radius} 0 1 0 ${2 * radius} 0a${radius} ${radius} 0 1 0 ${-2 * radius} 0Z`;
}

/**
 * Traces the arc a round frame's name runs along: from the lower left, over the
 * top, to the lower right, so a long name can run down the sides.
 * @param {number} radius - The arc's radius, centred on the canvas
 * @returns {FrameArc} The arc
 */
function ringArc(radius: number): FrameArc {
  const x = (radius * Math.sqrt(3)) / 2;
  return {
    length: (radius * 4 * Math.PI) / 3,
    path: `M${(60 - x).toFixed(1)} ${60 + radius / 2}A${radius} ${radius} 0 1 1 ${(60 + x).toFixed(1)} ${60 + radius / 2}`,
  };
}

/**
 * Traces the toothed edge of a seal: a circle whose rim steps in and out.
 * @param {number} teeth - How many teeth go round
 * @param {number} outer - The radius at a tooth's tip
 * @param {number} inner - The radius between teeth
 * @returns {string} The path
 */
function toothedRing(teeth: number, outer: number, inner: number): string {
  const points = Array.from({ length: teeth * 2 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = (index * Math.PI) / teeth;
    return `${(60 + radius * Math.sin(angle)).toFixed(1)} ${(60 - radius * Math.cos(angle)).toFixed(1)}`;
  });
  return `M${points.join("L")}Z`;
}

/**
 * Traces a postage stamp's perforated edge: a square whose sides are rows of
 * small bites.
 * @param {number} margin - The distance from the canvas edge
 * @param {number} perforations - How many bites each side holds
 * @returns {string} The path
 */
function perforatedSquare(margin: number, perforations: number): string {
  const side = 120 - 2 * margin;
  const step = side / perforations;
  const bite = (step / 2).toFixed(2);

  /**
   * Repeats one bite along a side.
   * @param {number} dx - The horizontal step
   * @param {number} dy - The vertical step
   * @returns {string} The side's path commands
   */
  const edge = (dx: number, dy: number): string =>
    `a${bite} ${bite} 0 0 0 ${(dx * step).toFixed(2)} ${(dy * step).toFixed(2)}`.repeat(
      perforations,
    );
  return `M${margin} ${margin}${edge(1, 0)}${edge(0, 1)}${edge(-1, 0)}${edge(0, -1)}Z`;
}

/* The name above the emblem, three lines below: the frames with square shoulders. */
const BOXED = {
  emblemGrows: true,
  emblemSize: 44,
  emblemY: 27,
  lines: [
    { width: 92, y: 81 },
    { width: 92, y: 91 },
    { width: 80, y: 102 },
  ],
  nameWidth: 94,
  nameY: 24,
};

/* The emblem in the point, the name at the widest part: the frames with a peak. */
const PEAKED = {
  emblemGrows: false,
  emblemSize: 36,
  emblemY: 15,
  nameY: 62,
};

export const FRAME_GEOMETRY: Record<StampFrame, FrameGeometry> = {
  arch: {
    ...BOXED,
    arc: { length: 129, path: "M24 66V58a36 36 0 0 1 72 0v8" },
    emblemSize: 40,
    emblemY: 28,
    inner: "M14 110V58a46 46 0 0 1 92 0V110Z",
    outline: "M10 114V58a50 50 0 0 1 100 0V114Z",
  },
  banner: {
    ...BOXED,
    keepsOneLine: true,
    emblemSize: 42,
    emblemY: 29,
    lines: [
      { width: 80, y: 80 },
      { width: 80, y: 90 },
      { width: 72, y: 101 },
    ],
    nameWidth: 84,
    nameY: 21,
    outline: "M3 7H117L109 17L117 27H3L11 17ZM14 27V112H106V27",
  },
  circle: {
    ...BOXED,
    arc: ringArc(42),
    emblemSize: 40,
    emblemY: 26,
    inner: ring(53),
    innerBorder: "dotted",
    lines: [
      { width: 84, y: 76 },
      { width: 72, y: 86 },
      { width: 52, y: 97 },
    ],
    outline: ring(57),
  },
  clipped: {
    ...BOXED,
    inner: "M21 10H99L110 21V99L99 110H21L10 99V21Z",
    nameWidth: 86,
    outline: "M20 6H100L114 20V100L100 114H20L6 100V20Z",
  },
  diamond: {
    ...PEAKED,
    emblemSize: 30,
    emblemY: 22,
    lines: [
      { width: 72, y: 73 },
      { width: 56, y: 82 },
      { width: 38, y: 92 },
    ],
    nameWidth: 82,
    outline: "M60 2L118 60L60 118L2 60Z",
  },
  doubleRing: {
    ...BOXED,
    arc: ringArc(41),
    emblemSize: 38,
    emblemY: 27,
    inner: ring(54),
    lines: [
      { width: 80, y: 75 },
      { width: 70, y: 85 },
      { width: 52, y: 96 },
    ],
    outline: ring(58),
  },
  hexagon: {
    ...PEAKED,
    inner: "M60 9L106 35V85L60 111L14 85V35Z",
    innerBorder: "dashed",
    lines: [
      { width: 88, y: 73 },
      { width: 78, y: 83 },
      { width: 60, y: 94 },
    ],
    nameWidth: 86,
    outline: "M60 4L110 32V88L60 116L10 88V32Z",
  },
  octagon: {
    ...BOXED,
    emblemSize: 40,
    emblemY: 30,
    inner: "M40 9H80L111 40V80L80 111H40L9 80V40Z",
    lines: [
      { width: 96, y: 80 },
      { width: 82, y: 90 },
      { width: 52, y: 101 },
    ],
    nameWidth: 68,
    nameY: 29,
    outline: "M38 4H82L116 38V82L82 116H38L4 82V38Z",
  },
  oval: {
    ...BOXED,
    arc: { length: 150, path: "M21.9 75.5A44 31 0 1 1 98.1 75.5" },
    emblemSize: 32,
    emblemY: 34,
    emblemGrows: false,
    lines: [
      { width: 84, y: 74 },
      { width: 74, y: 83 },
      { width: 56, y: 93 },
    ],
    outline: "M2 60a58 47 0 1 0 116 0a58 47 0 1 0-116 0Z",
    inner: "M6 60a54 43 0 1 0 108 0a54 43 0 1 0-108 0Z",
    innerBorder: "dashed",
  },
  pentagon: {
    ...PEAKED,
    emblemSize: 38,
    emblemY: 16,
    lines: [
      { width: 100, y: 78 },
      { width: 100, y: 89 },
      { width: 90, y: 101 },
    ],
    nameWidth: 96,
    nameY: 66,
    outline: "M60 3L116 44V114H4V44Z",
  },
  postage: {
    ...BOXED,
    inner: "M12 12H108V108H12Z",
    nameWidth: 84,
    nameY: 27,
    outline: perforatedSquare(5, 11),
  },
  rectangle: {
    ...BOXED,
    inner: "M10 10H110V110H10Z",
    outline: "M6 6H114V114H6Z",
  },
  rounded: {
    ...BOXED,
    inner:
      "M22 10H98A12 12 0 0 1 110 22V98A12 12 0 0 1 98 110H22A12 12 0 0 1 10 98V22A12 12 0 0 1 22 10Z",
    innerBorder: "dashed",
    outline:
      "M22 6H98A16 16 0 0 1 114 22V98A16 16 0 0 1 98 114H22A16 16 0 0 1 6 98V22A16 16 0 0 1 22 6Z",
  },
  seal: {
    ...BOXED,
    arc: ringArc(40),
    emblemSize: 38,
    emblemY: 27,
    lines: [
      { width: 78, y: 75 },
      { width: 68, y: 85 },
      { width: 50, y: 96 },
    ],
    outline: toothedRing(28, 59, 54),
  },
  shield: {
    ...BOXED,
    emblemSize: 40,
    emblemY: 27,
    inner: "M16 12H104V62C104 85 82 100 60 111C38 100 16 85 16 62Z",
    lines: [
      { width: 80, y: 76 },
      { width: 64, y: 86 },
      { width: 40, y: 97 },
    ],
    nameWidth: 84,
    outline: "M12 8H108V62C108 88 84 104 60 116C36 104 12 88 12 62Z",
  },
  ticket: {
    ...BOXED,
    inner:
      "M21 11H99A11 11 0 0 0 109 21V99A11 11 0 0 0 99 109H21A11 11 0 0 0 11 99V21A11 11 0 0 0 21 11Z",
    innerBorder: "dotted",
    nameWidth: 84,
    outline:
      "M18 6H102A12 12 0 0 0 114 18V102A12 12 0 0 0 102 114H18A12 12 0 0 0 6 102V18A12 12 0 0 0 18 6Z",
  },
};

/* The average width of a character, in ems, by how the text is set. */
const CHAR_EM: Record<StampTextStyle, number> = {
  caps: 0.66,
  curved: 0.68,
  title: 0.58,
  tracked: 0.86,
};

const NAME_MAX = 11;
const NAME_MIN = 6;
const NAME_WRAP_BELOW = 8.5;

/**
 * Splits a name at the space nearest its middle.
 * @param {string} name - The name
 * @returns {string[]} One line, or two when it has a space to break at
 */
function wrapInTwo(name: string): string[] {
  const spaces = [...name.matchAll(/ /g)].map((match) => match.index);
  if (spaces.length === 0) return [name];
  const [split] = spaces.toSorted(
    (first, second) =>
      Math.abs(first - name.length / 2) - Math.abs(second - name.length / 2),
  );
  return [name.slice(0, split), name.slice(split + 1)];
}

/**
 * Sizes a line of text to the room it has, from the width its characters are
 * expected to take; no layout is measured, so the result is the same for every
 * renderer. Text too long even at the smallest size is flagged, for the renderer
 * to squeeze it into the room rather than let it cross the frame.
 * @param {string} text - The text
 * @param {number} width - The room it has
 * @param {number} max - The size it would like
 * @param {number} min - The smallest it may be
 * @param {StampTextStyle} style - How it is set
 * @returns {FittedText} Its size and lines
 */
export function fitLine(
  text: string,
  width: number,
  max: number,
  min: number,
  style: StampTextStyle = "caps",
): FittedText {
  const fit = width / (text.length * CHAR_EM[style]);
  return {
    isCompressed: fit < min,
    lines: [text],
    size: Math.max(min, Math.min(max, fit)),
  };
}

/**
 * Fits a country's name to a frame: along the curve on a round frame, on one line
 * when it stays legible and on two otherwise on the others.
 * @param {string} name - The name
 * @param {FrameGeometry} frame - The frame
 * @param {StampTextStyle} style - How the name is set
 * @returns {FittedText} The name's size and lines
 */
export function fitName(
  name: string,
  frame: FrameGeometry,
  style: StampTextStyle,
): FittedText {
  if (frame.arc) return fitLine(name, frame.arc.length, NAME_MAX, NAME_MIN);

  const single = fitLine(name, frame.nameWidth, NAME_MAX, NAME_MIN, style);
  if (frame.keepsOneLine || single.size >= NAME_WRAP_BELOW) return single;

  const lines = wrapInTwo(name);
  const longest = lines.reduce((sum, line) => Math.max(sum, line.length), 0);
  const fit = fitLine(
    "x".repeat(longest),
    frame.nameWidth,
    NAME_MAX,
    NAME_MIN,
    style,
  );
  return { ...fit, lines };
}

/**
 * Tilts a stamp as a hand would, the same way on every visit: the angle is a hash
 * of the country's id, so a reload never reshuffles the page.
 * @param {string} id - The country's id
 * @returns {number} The angle in degrees, within ±6
 */
export function stampTilt(id: string): number {
  let hash = 2_166_136_261;
  for (const char of id)
    hash = Math.imul(hash ^ char.charCodeAt(0), 16_777_619);
  return (((hash >>> 0) % 1201) - 600) / 100;
}
