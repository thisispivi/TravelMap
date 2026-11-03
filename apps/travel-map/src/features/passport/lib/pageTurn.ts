/**
 * A point on a page, in pixels from its top left.
 * @property {number} x - Pixels from the left edge
 * @property {number} y - Pixels from the top edge
 */
export interface Point {
  x: number;
  y: number;
}

/** The corner of the page's free edge a turn lifts. */
export type Lift = "top" | "bottom";

/**
 * A page's size in pixels.
 * @property {number} width - Its width
 * @property {number} height - Its height
 */
export interface PageSize {
  width: number;
  height: number;
}

/**
 * How to draw one moment of a paper page's turn, as CSS for the three pages
 * involved: the one turning, its back folded over it, and the one it uncovers.
 * Every value is in the turning page's own box, except the back's, which is in
 * the back page's box before its transform places it.
 * @property {number} progress - How far the turn has gone, from 0 to 1
 * @property {string} frontClip - The `clip-path` of what still lies flat
 * @property {string} frontShade - The shadow the fold casts on it
 * @property {string} backClip - The `clip-path` of the back page
 * @property {string} backTransform - The `transform` that lays the back page over the fold
 * @property {string} backShade - The curl's shading on the back
 * @property {string} underShade - The shadow the fold casts on the page beneath
 */
export interface SoftTurnFrame {
  progress: number;
  frontClip: string;
  frontShade: string;
  backClip: string;
  backTransform: string;
  backShade: string;
  underShade: string;
}

/**
 * How to draw one moment of a board's turn: covers do not curl, they swing.
 * @property {string} frontTransform - The `transform` of the board's outside
 * @property {string} backTransform - The `transform` of its inside
 * @property {string} origin - The `transform-origin` of both, on the spine
 * @property {string} backOrigin - The inside's `transform-origin`, on the spine
 * @property {string} shade - The shadow on whichever face is in view
 */
export interface HardTurnFrame {
  frontTransform: string;
  backTransform: string;
  origin: string;
  backOrigin: string;
  shade: string;
}

/* How far a button's turn lifts its corner off the edge, as a share of the height. */
const BUTTON_ARC = 0.07;

/**
 * Keeps a lifted corner where paper bound at its spine can reach: no further
 * from either end of the spine than the page's own edges, and level with the
 * book, so a page never tears loose or swings out past its top and bottom.
 * The spine is the left edge, at `x = 0`; a page turning the other way is
 * mirrored before it gets here.
 * @param {Point} corner - Where the reader would put the corner
 * @param {Lift} lift - The corner being lifted
 * @param {PageSize} size - The page's size
 * @returns {Point} Where the corner can go
 */
export function reachableCorner(
  corner: Point,
  lift: Lift,
  size: PageSize,
): Point {
  const { width, height } = size;
  const edgeY = lift === "top" ? 0 : height;
  const level = { x: corner.x, y: Math.min(height, Math.max(0, corner.y)) };
  const near = limitToCircle(level, { x: 0, y: edgeY }, width);
  return limitToCircle(
    near,
    { x: 0, y: height - edgeY },
    Math.hypot(width, height),
  );
}

/**
 * Moves a point onto a circle's edge when it lies outside the circle.
 * @param {Point} point - The point
 * @param {Point} centre - The circle's centre
 * @param {number} radius - The circle's radius
 * @returns {Point} The point, or the nearest point inside the circle
 */
function limitToCircle(point: Point, centre: Point, radius: number): Point {
  const distance = Math.hypot(point.x - centre.x, point.y - centre.y);
  if (distance <= radius) return point;
  const scale = radius / distance;
  return {
    x: centre.x + (point.x - centre.x) * scale,
    y: centre.y + (point.y - centre.y) * scale,
  };
}

/**
 * Finds where a button's turn puts the corner partway through: across the page
 * and past the spine, rising off the edge in an arc so the fold leans as a hand
 * would make it.
 * @param {number} progress - How far the turn has gone, from 0 to 1
 * @param {Lift} lift - The corner being lifted
 * @param {PageSize} size - The page's size
 * @returns {Point} The corner
 */
export function cornerAlongTurn(
  progress: number,
  lift: Lift,
  size: PageSize,
): Point {
  const { width, height } = size;
  const rise = Math.sin(Math.PI * progress) * height * BUTTON_ARC;
  return {
    x: width - 2 * width * progress,
    y: lift === "top" ? rise : height - rise,
  };
}

/**
 * Reads how far a turn has gone from where its corner is.
 * @param {Point} corner - The lifted corner
 * @param {PageSize} size - The page's size
 * @returns {number} The progress, from 0 at rest to 1 turned over
 */
export function turnProgress(corner: Point, size: PageSize): number {
  const { width } = size;
  return Math.min(1, Math.max(0, (width - corner.x) / (2 * width)));
}

/**
 * Keeps the part of a polygon on one side of a line, by Sutherland–Hodgman
 * clipping against a single edge.
 * @param {Point[]} polygon - The polygon
 * @param {(point: Point) => number} side - Positive on the side to keep
 * @returns {Point[]} The part kept
 */
function clipPolygon(
  polygon: Point[],
  side: (point: Point) => number,
): Point[] {
  return polygon.flatMap((point, index) => {
    const next = polygon[(index + 1) % polygon.length] ?? point;
    const here = side(point);
    const there = side(next);
    const kept = here >= 0 ? [point] : [];
    if (here >= 0 === there >= 0) return kept;
    const share = here / (here - there);
    return [
      ...kept,
      {
        x: point.x + (next.x - point.x) * share,
        y: point.y + (next.y - point.y) * share,
      },
    ];
  });
}

/**
 * Writes a polygon as a `clip-path`.
 * @param {Point[]} polygon - The polygon
 * @returns {string} The CSS value
 */
function toClipPath(polygon: Point[]): string {
  if (polygon.length < 3) return "polygon(0 0, 0 0, 0 0)";
  return `polygon(${polygon.map(({ x, y }) => `${x}px ${y}px`).join(", ")})`;
}

/**
 * Draws a shadow that is darkest along a line and fades away from it to one
 * side, as a gradient for a box of the given size.
 * @param {Point} through - A point on the line
 * @param {Point} away - The unit direction the shadow fades in
 * @param {PageSize} size - The box's size
 * @param {number} band - How far the shadow reaches, in pixels
 * @param {number} alpha - How dark it is at the line
 * @returns {string} The CSS `background`
 */
function shadeFrom(
  through: Point,
  away: Point,
  size: PageSize,
  band: number,
  alpha: number,
): string {
  const { width, height } = size;
  const angle = (Math.atan2(away.x, -away.y) * 180) / Math.PI;
  const length = Math.abs(width * away.x) + Math.abs(height * away.y);
  const start =
    (through.x - width / 2) * away.x +
    (through.y - height / 2) * away.y +
    length / 2;
  return `linear-gradient(${angle}deg, transparent ${start - 1}px, rgb(0 0 0 / ${alpha}) ${start}px, transparent ${start + band}px)`;
}

/**
 * Works out one moment of a paper page's turn. The corner is lifted to a point
 * and the page folds along the line halfway between where the corner was and
 * where it is; the part beyond that line lies over the page reflected in it,
 * showing the page's back.
 * @param {Point} corner - The lifted corner, with the spine on the left
 * @param {Lift} lift - The corner being lifted
 * @param {PageSize} size - The page's size
 * @param {boolean} isMirrored - Whether the spine is on the page's right, for a page turning rightwards
 * @returns {SoftTurnFrame} The CSS for that moment
 */
export function softTurnFrame(
  corner: Point,
  lift: Lift,
  size: PageSize,
  isMirrored: boolean,
): SoftTurnFrame {
  const { width, height } = size;
  const rest = { x: width, y: lift === "top" ? 0 : height };
  const progress = turnProgress(corner, size);
  const reach = Math.hypot(rest.x - corner.x, rest.y - corner.y);
  const normal =
    reach > 0
      ? { x: (rest.x - corner.x) / reach, y: (rest.y - corner.y) / reach }
      : { x: 1, y: 0 };
  const middle = { x: (rest.x + corner.x) / 2, y: (rest.y + corner.y) / 2 };

  /**
   * Measures how far a point lies past the fold, towards the lifted corner.
   * @param {Point} point - The point
   * @returns {number} Positive past the fold, negative before it
   */
  const pastFold = (point: Point): number =>
    reach > 0
      ? (point.x - middle.x) * normal.x + (point.y - middle.y) * normal.y
      : -1;
  const page = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];

  /**
   * Turns the spine-on-the-left drawing into the page's own, and back.
   * @param {Point} point - A point
   * @returns {Point} The point mirrored when the page turns rightwards
   */
  const own = (point: Point): Point =>
    isMirrored ? { x: width - point.x, y: point.y } : point;

  /**
   * Reads the back of the page where the front shows a point: the back is the
   * page seen from behind, its left and right swapped.
   * @param {Point} point - A point on the front
   * @returns {Point} The same spot on the back
   */
  const behind = (point: Point): Point => ({ x: width - point.x, y: point.y });

  /**
   * Places a point of the back page where the fold lays it.
   * @param {Point} point - A point on the back page
   * @returns {Point} Where it shows
   */
  const laid = (point: Point): Point => {
    const front = own(behind(point));
    const distance = pastFold(front);
    return own({
      x: front.x - 2 * distance * normal.x,
      y: front.y - 2 * distance * normal.y,
    });
  };
  const origin = laid({ x: 0, y: 0 });
  const xAxis = laid({ x: 1, y: 0 });
  const yAxis = laid({ x: 0, y: 1 });
  const lifted = clipPolygon(page, pastFold).map(own);
  const flat = clipPolygon(page, (point) => -pastFold(point)).map(own);
  const strength = Math.sin(Math.PI * progress);
  const fold = own(middle);
  const towardsCorner = { x: isMirrored ? -normal.x : normal.x, y: normal.y };

  return {
    backClip: toClipPath(lifted.map(behind)),
    backShade: shadeFrom(
      behind(fold),
      { x: -towardsCorner.x, y: towardsCorner.y },
      size,
      width * 0.2,
      0.22 * strength,
    ),
    backTransform: `matrix(${xAxis.x - origin.x}, ${xAxis.y - origin.y}, ${yAxis.x - origin.x}, ${yAxis.y - origin.y}, ${origin.x}, ${origin.y})`,
    frontClip: toClipPath(flat),
    frontShade: shadeFrom(
      fold,
      { x: -towardsCorner.x, y: -towardsCorner.y },
      size,
      width * 0.08,
      0.18 * strength,
    ),
    progress,
    underShade: shadeFrom(
      fold,
      towardsCorner,
      size,
      width * 0.3,
      0.4 * strength,
    ),
  };
}

/**
 * Works out one moment of a board's turn: it swings on the spine, the outside
 * going away as the inside comes round.
 * @param {number} progress - How far the turn has gone, from 0 to 1
 * @param {PageSize} size - The board's size
 * @param {boolean} isMirrored - Whether the spine is on the board's right
 * @returns {HardTurnFrame} The CSS for that moment
 */
export function hardTurnFrame(
  progress: number,
  size: PageSize,
  isMirrored: boolean,
): HardTurnFrame {
  const { width } = size;
  const turn = isMirrored ? 1 : -1;
  /* Far enough that the board barely grows as it swings towards the reader. */
  const perspective = `perspective(${width * 8}px)`;
  return {
    backOrigin: isMirrored ? "0 50%" : "100% 50%",
    backTransform: `${perspective} rotateY(${turn * 180 * (progress - 1)}deg)`,
    frontTransform: `${perspective} rotateY(${turn * 180 * progress}deg)`,
    origin: isMirrored ? "100% 50%" : "0 50%",
    shade: `rgb(0 0 0 / ${0.3 * Math.sin(Math.PI * progress)})`,
  };
}
