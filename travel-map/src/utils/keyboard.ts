/**
 * isActivationKey
 *
 * Checks whether a keyboard event should activate a button-like control.
 *
 * @param {Pick<KeyboardEvent, "key">} event - Keyboard event to inspect
 * @returns {boolean} True for Enter and Space
 */
export function isActivationKey(event: Pick<KeyboardEvent, "key">): boolean {
  return event.key === "Enter" || event.key === " ";
}
