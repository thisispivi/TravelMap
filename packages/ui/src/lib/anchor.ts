/**
 * Which side of its trigger a floating menu opens on, and how tall it may grow
 * there.
 * @property {boolean} opensUp - Whether it opens above the trigger
 * @property {number} room - The height available on that side, in pixels
 */
interface VerticalFit {
  opensUp: boolean;
  room: number;
}

/**
 * Decides whether a menu opens below its trigger or above it. It opens below
 * unless the room there is less than it wants and there is more above, so a
 * trigger low on a phone never pushes its list off the screen.
 * @param {DOMRect} anchor - The trigger's box
 * @param {number} gap - The space kept between the menu and the trigger or window edge, in pixels
 * @param {number} wanted - The height the menu would like, in pixels
 * @returns {VerticalFit} The side and the room on it
 */
export function fitVertically(
  anchor: DOMRect,
  gap: number,
  wanted: number,
): VerticalFit {
  const below = window.innerHeight - anchor.bottom - gap * 2;
  const above = anchor.top - gap * 2;
  const opensUp = below < wanted && above > below;
  return { opensUp, room: Math.max(0, opensUp ? above : below) };
}
