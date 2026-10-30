/**
 * The part of a trip the timeline places.
 * @property {Date} sDate - Its first day
 * @property {() => number} getDurationInDays - How many days it lasted
 */
interface Dated {
  sDate: Date;
  getDurationInDays: () => number;
}

/**
 * The trips that started in one year.
 * @property {number} year - The year
 * @property {T[]} trips - Its trips, newest first
 * @property {number} days - Days spent travelling on those trips
 */
export interface TimelineYear<T extends Dated> {
  year: number;
  trips: T[];
  days: number;
}

/**
 * Where the route passes through a stop, in pixels from the route's corner.
 * @property {number} x - Across the route
 * @property {number} y - Down the route
 */
export interface RoutePoint {
  x: number;
  y: number;
}

/**
 * Where the scroll puts a stop's card.
 * @property {number} opacity - From 0, unseen, to 1
 * @property {number} x - Sideways shift in rem
 * @property {number} y - Downward shift in rem
 * @property {number} rotate - Tilt in degrees
 * @property {number} scale - Size, where 1 is its own
 */
interface StopPose {
  opacity: number;
  x: number;
  y: number;
  rotate: number;
  scale: number;
}

/**
 * The measurements a stop's pose depends on.
 * @property {number} scroll - How far the page has scrolled, in pixels
 * @property {number} top - The stop's top within the scrolling content
 * @property {number} height - The stop's height
 * @property {number} viewport - The height of the scrolling area
 * @property {boolean} isLeft - Whether the card sits left of the line
 * @property {boolean} isReduced - Whether the reader asked for less motion
 */
interface StopPoseInput {
  scroll: number;
  top: number;
  height: number;
  viewport: number;
  isLeft: boolean;
  isReduced: boolean;
}

/**
 * The measurements the visible stretch of line depends on.
 * @property {number} scroll - How far the page has scrolled, in pixels
 * @property {number} maxScroll - How far it can scroll
 * @property {number} viewport - The height of the scrolling area
 * @property {number} routeTop - The route's top within the scrolling content
 * @property {number} routeHeight - The route's height
 */
interface LineWindowInput {
  scroll: number;
  maxScroll: number;
  viewport: number;
  routeTop: number;
  routeHeight: number;
}

/**
 * The stretch of line to draw, as shares of its length.
 * @property {number} tip - Where it ends, the leading end
 * @property {number} tail - Where it begins, the end already passed
 */
interface LineWindow {
  tip: number;
  tail: number;
}

/* Radians between stops: never a whole turn, so the swings do not look periodic. */
const SWAY_STEP = 1.25;
/* The shortest swing, as a share of the longest, so the line never runs straight. */
const MIN_SWING = 0.6;
/* How far a card travels from the line as it enters, and rises as it leaves. */
const ENTER_SHIFT_REM = 3;
const LEAVE_RISE_REM = 2.5;
const ENTER_TILT_DEG = 5;
const ENTER_SHRINK = 0.2;
const LEAVE_SHRINK = 0.12;
/* Where the tip of the line sits on the page, as a share of its height. */
const TIP_SHARE = 0.85;

/**
 * Keeps a value between 0 and 1.
 * @param {number} value - The value
 * @returns {number} The value, held to that range
 */
function unit(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

/**
 * Tells which side of the line a stop's card sits on. Wider screens alternate; a
 * phone keeps every card to the right of the line in its gutter.
 * @param {number} index - The stop's position along the route
 * @param {boolean} isCompact - Whether the line keeps to a phone's gutter
 * @returns {boolean} Whether the card sits left of the line
 */
export function isLeftOfLine(index: number, isCompact: boolean): boolean {
  return !isCompact && index % 2 === 0;
}

/**
 * Places a card by the scroll alone, so scrolling back plays it in reverse. It
 * enters while it rises into the page, whole by the time its bottom edge is on
 * screen, which the last card can reach, and leaves as it passes the top. The
 * entrance eases out, so it arrives gently rather than stopping dead.
 * @param {StopPoseInput} input - The measurements
 * @param {number} input.scroll - How far the page has scrolled, in pixels
 * @param {number} input.top - The stop's top within the scrolling content
 * @param {number} input.height - The stop's height
 * @param {number} input.viewport - The height of the scrolling area
 * @param {boolean} input.isLeft - Whether the card sits left of the line
 * @param {boolean} input.isReduced - Whether the reader asked for less motion
 * @returns {StopPose} Where the card goes
 */
export function stopPose({
  scroll,
  top,
  height,
  viewport,
  isLeft,
  isReduced,
}: StopPoseInput): StopPose {
  const enter = unit((scroll + viewport - top) / height);
  const leave = unit((scroll - top) / height);
  const remaining = (1 - enter) ** 3;
  const motion = isReduced ? 0 : 1;
  return {
    opacity: (1 - remaining) * (1 - leave),
    rotate: remaining * (isLeft ? -ENTER_TILT_DEG : ENTER_TILT_DEG) * motion,
    scale: 1 - (remaining * ENTER_SHRINK + leave * LEAVE_SHRINK) * motion,
    x: remaining * (isLeft ? ENTER_SHIFT_REM : -ENTER_SHIFT_REM) * motion,
    y: (remaining * ENTER_SHIFT_REM - leave * LEAVE_RISE_REM) * motion,
  };
}

/**
 * Finds how much of the line lies above a given height. A wide swing spends far
 * more of the line's length than it descends, so the two are not in proportion,
 * and the tip would otherwise fall behind the stops it should be reaching.
 * @param {number[]} heights - How far down the line is at even steps along it
 * @param {number} y - The height, in pixels from the route's top
 * @returns {number} The share of the line's length above it, from 0 to 1
 */
export function lengthShareAt(heights: number[], y: number): number {
  const next = heights.findIndex((height) => height >= y);
  if (next < 0) return 1;
  if (next === 0) return 0;
  const before = heights[next - 1] ?? 0;
  const after = heights[next] ?? before;
  const within = after > before ? (y - before) / (after - before) : 0;
  return (next - 1 + within) / (heights.length - 1);
}

/**
 * Works out which stretch of line is on screen. The tip runs from its place on
 * the page at the top to the very end of the line at the bottom, since the end
 * of the route can never rise as high as the tip.
 * @param {LineWindowInput} input - The measurements
 * @param {number} input.scroll - How far the page has scrolled, in pixels
 * @param {number} input.maxScroll - How far it can scroll
 * @param {number} input.viewport - The height of the scrolling area
 * @param {number} input.routeTop - The route's top within the scrolling content
 * @param {number} input.routeHeight - The route's height
 * @returns {LineWindow} The stretch to draw
 */
export function lineWindow({
  scroll,
  maxScroll,
  viewport,
  routeTop,
  routeHeight,
}: LineWindowInput): LineWindow {
  const start = (viewport * TIP_SHARE - routeTop) / routeHeight;
  const progress = maxScroll > 0 ? scroll / maxScroll : 1;
  return {
    tail: unit((scroll - routeTop) / routeHeight),
    tip: unit(start + (1 - start) * progress),
  };
}

/**
 * Groups trips by the year they started, newest year and newest trip first. A
 * trip over New Year counts wholly towards the year it started.
 * @param {T[]} trips - The trips
 * @returns {TimelineYear<T>[]} The years with trips, newest first
 */
export function buildTimeline<T extends Dated>(trips: T[]): TimelineYear<T>[] {
  const sorted = trips.toSorted(
    (first, second) => second.sDate.getTime() - first.sDate.getTime(),
  );
  const years: TimelineYear<T>[] = [];

  for (const trip of sorted) {
    const year = trip.sDate.getFullYear();
    const days = trip.getDurationInDays();
    const current = years.at(-1);
    if (current?.year === year) {
      current.trips.push(trip);
      current.days += days;
    } else years.push({ days, trips: [trip], year });
  }

  return years;
}

/**
 * Places a stop across the route, on the same side of the centre as its card and
 * swinging out by an uneven amount, so the line winds like a road.
 * @param {number} index - The stop's position along the route
 * @param {number} centre - The middle of the sway, in pixels
 * @param {number} sway - How far it reaches to either side, in pixels
 * @returns {number} The stop's distance across the route
 */
export function routeX(index: number, centre: number, sway: number): number {
  const swing =
    MIN_SWING + (1 - MIN_SWING) * Math.abs(Math.sin(index * SWAY_STEP));
  return centre + (index % 2 === 0 ? -1 : 1) * swing * sway;
}

/**
 * Draws the line through the stops as one SVG path, leaving each stop straight
 * downwards so the curves join without a kink.
 * @param {RoutePoint[]} points - The stops, in order
 * @returns {string} The path, or nothing without any stops
 */
export function routePath(points: RoutePoint[]): string {
  const [first] = points;
  if (!first) return "";
  const curves = points.slice(1).map(({ x, y }, index) => {
    const from = points[index] ?? first;
    const middle = (from.y + y) / 2;
    return `C${from.x} ${middle} ${x} ${middle} ${x} ${y}`;
  });
  return [`M${first.x} 0 L${first.x} ${first.y}`, ...curves].join(" ");
}
