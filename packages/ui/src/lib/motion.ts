import type { Transition, Variants } from "framer-motion";

/*
 * One motion vocabulary for the app. Panels and sheets move on a critically
 * damped spring, so they settle fast without a bounce; content fades and rises
 * a few pixels on an ease-out curve. Everything finishes inside ~300ms.
 */

/** The spring panels, sheets and indicators move on. */
export const panelSpring: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 46,
  mass: 0.9,
};

/** The curve content fades in on. */
export const easeOut: Transition = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1],
};

/** A list whose children reveal one after another. */
export const staggerList: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035, delayChildren: 0.04 } },
};

/** One child of a `staggerList`. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: easeOut },
};
