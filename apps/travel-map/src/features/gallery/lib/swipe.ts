/* A swipe this far, or this fast, turns the page. */
const SWIPE_DISTANCE_PX = 80;
const SWIPE_VELOCITY = 500;

/* How hard an end of the album resists being pulled past. */
const RUBBER_BAND = 0.55;

/**
 * A released swipe.
 * @property {number} count - How many photos the album has
 * @property {number} index - The photo the swipe started on
 * @property {number} offset - How far the finger travelled, in pixels
 * @property {number} velocity - The finger's speed at release, in pixels a second
 */
interface SwipeRelease {
  count: number;
  index: number;
  offset: number;
  velocity: number;
}

/**
 * Decides which photo a released swipe lands on. A fast release goes the way
 * the finger was moving when it let go, even against the drag so far, so a
 * change of mind is respected; a slow one is judged by the distance.
 * @param {SwipeRelease} release - The released swipe
 * @param {number} release.count - How many photos the album has
 * @param {number} release.index - The photo the swipe started on
 * @param {number} release.offset - How far the finger travelled, in pixels
 * @param {number} release.velocity - The finger's speed at release, in pixels a second
 * @returns {number} The index of the photo to settle on
 */
export function swipeTarget({
  count,
  index,
  offset,
  velocity,
}: SwipeRelease): number {
  const isFlick = Math.abs(velocity) > SWIPE_VELOCITY;
  const isLong = Math.abs(offset) > SWIPE_DISTANCE_PX;
  if (!isFlick && !isLong) return index;

  const direction = isFlick ? -Math.sign(velocity) : -Math.sign(offset);
  return Math.min(count - 1, Math.max(0, index + direction));
}

/**
 * A drag in progress, in units of one slide width.
 * @property {number} count - How many photos the album has
 * @property {number} grabbedAt - The track's position when the drag began
 * @property {number} index - The photo in the centre of the mounted slides
 * @property {number} moved - How far the track has been pulled, along its axis
 */
interface SwipeDrag {
  count: number;
  grabbedAt: number;
  index: number;
  moved: number;
}

/**
 * Works out where the track sits under the finger: exactly where it was
 * pulled, except past the album's first and last photo, where it resists more
 * the further it goes, and no further than the neighbours that are mounted.
 * @param {SwipeDrag} drag - The drag in progress
 * @param {number} drag.count - How many photos the album has
 * @param {number} drag.grabbedAt - The track's position when the drag began
 * @param {number} drag.index - The photo in the centre of the mounted slides
 * @param {number} drag.moved - How far the track has been pulled, along its axis
 * @returns {number} The track's position, in slides
 */
export function dragPosition({
  count,
  grabbedAt,
  index,
  moved,
}: SwipeDrag): number {
  const position = Math.min(index + 1, Math.max(index - 1, grabbedAt + moved));
  const last = count - 1;
  if (position < 0) return -rubberBand(-position);
  if (position > last) return last + rubberBand(position - last);
  return position;
}

/**
 * The curve iOS scroll views overshoot on: close to the finger at first, and
 * never reaching a full slide however far it is pulled.
 * @param {number} overshoot - How far past the end the finger is, in slides
 * @returns {number} How far past the end the track goes, in slides
 */
function rubberBand(overshoot: number): number {
  return 1 - 1 / (overshoot * RUBBER_BAND + 1);
}
