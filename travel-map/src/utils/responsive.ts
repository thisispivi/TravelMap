import { isMobile, isTablet } from "mobile-device-detect";

/**
 * Detect whether the current device should be treated as mobile/tablet.
 *
 * This is used to disable some desktop-only UI affordances.
 */
export function mobileAndTabletCheck(): boolean {
  if (window.innerWidth <= window.innerHeight) return true;
  return isMobile || isTablet;
}
