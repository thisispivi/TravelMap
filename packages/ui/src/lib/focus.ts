/**
 * Lists the controls inside an element that Tab can reach, in order.
 * @param {HTMLElement | null} root - The element to search
 * @returns {HTMLElement[]} Its enabled buttons, links, fields and frames
 */
export function focusablesIn(root: HTMLElement | null): HTMLElement[] {
  return root
    ? [
        ...root.querySelectorAll<HTMLElement>(
          "button:not(:disabled), [href], input:not(:disabled), iframe",
        ),
      ]
    : [];
}

/**
 * Keeps Tab cycling inside an overlay that owns focus, as a modal dialog
 * must: past the last control it wraps to the first, and Shift+Tab from the
 * first, or from the overlay itself, wraps to the last. Keys pressed while
 * focus is elsewhere are left alone.
 * @param {Pick<KeyboardEvent, "key" | "shiftKey" | "preventDefault">} event - The key press
 * @param {HTMLElement | null} root - The overlay
 * @returns {void}
 */
export function keepTabWithin(
  event: Pick<KeyboardEvent, "key" | "shiftKey" | "preventDefault">,
  root: HTMLElement | null,
): void {
  const active = document.activeElement;
  if (event.key !== "Tab" || !root?.contains(active)) return;
  const focusables = focusablesIn(root);
  const first = focusables[0];
  const last = focusables.at(-1);
  if (!first || !last) return;
  const isLeaving = event.shiftKey
    ? active === first || active === root
    : active === last;
  if (!isLeaving) return;
  event.preventDefault();
  (event.shiftKey ? last : first).focus();
}
