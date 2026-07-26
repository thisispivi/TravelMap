let isVisible = false;

/**
 * Reports whether a panel skeleton is currently mounted. Replacement panels
 * use this to avoid replaying an entrance animation already shown by the
 * skeleton.
 * @returns {boolean} Whether a panel skeleton is mounted
 */
export function isPanelLoadingVisible(): boolean {
  return isVisible;
}

/**
 * Updates the shared panel-skeleton visibility without coupling consumers to
 * the fallback component.
 * @param {boolean} value - Whether the skeleton is mounted
 */
export function setPanelLoadingVisible(value: boolean): void {
  isVisible = value;
}
