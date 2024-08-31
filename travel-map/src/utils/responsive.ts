import MobileDetect from "mobile-detect";

/**
 * Check if the device is a mobile or tablet
 * @returns {boolean} true if the device is a mobile or tablet, false otherwise
 */
export function mobileAndTabletCheck(): boolean {
  if (window.innerWidth <= window.innerHeight) return true;
  const detector = new MobileDetect(window.navigator.userAgent);
  if (detector.mobile() || detector.tablet() || detector.phone()) return true;
  return false;
}
