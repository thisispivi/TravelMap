/**
 * Checks whether a keyboard event should activate a button-like control.
 * @param {Pick<KeyboardEvent, "key">} event - Keyboard event to inspect
 * @returns {boolean} True for Enter and Space
 */
export function isActivationKey(event: Pick<KeyboardEvent, "key">): boolean {
  return event.key === "Enter" || event.key === " ";
}

/**
 * Picks the option an arrow key moves a radio group to, the way native radio
 * buttons behave: Right and Down go forward, Left and Up back, wrapping at
 * either end, and Home and End jump to the first and last.
 * @param {Pick<KeyboardEvent, "key">} event - Keyboard event to inspect
 * @param {number} index - The selected option's position
 * @param {number} count - How many options the group holds
 * @returns {number | undefined} The option to select, or nothing for any other key
 */
export function radioTarget(
  event: Pick<KeyboardEvent, "key">,
  index: number,
  count: number,
): number | undefined {
  switch (event.key) {
    case "ArrowRight":
    case "ArrowDown":
      return (index + 1) % count;
    case "ArrowLeft":
    case "ArrowUp":
      return (index - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return undefined;
  }
}
