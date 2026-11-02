import { useSyncExternalStore } from "react";

import { createStoredChoice } from "../lib/storage";

/* What a reader can ask of the motion, beyond what their system asks. */
export const MOTION_PREFERENCES = ["system", "reduce"] as const;

/** Whether motion follows the system or is always reduced. */
export type MotionPreference = (typeof MOTION_PREFERENCES)[number];

/**
 * Motion state returned by `useMotionPreference`.
 * @property {MotionPreference} motionPreference - The reader's choice
 * @property {(next: MotionPreference) => void} setMotionPreference - Changes it
 * @property {"user" | "always"} reducedMotion - The matching `MotionConfig` value
 */
export type MotionPreferenceState = {
  motionPreference: MotionPreference;
  setMotionPreference: (next: MotionPreference) => void;
  reducedMotion: "user" | "always";
};

const motionChoice = createStoredChoice("motion", MOTION_PREFERENCES, "system");

/**
 * Marks the root for the global reduced-motion rule in `_global.scss`.
 * @param {MotionPreference} preference - The reader's choice
 * @returns {void}
 */
function markRoot(preference: MotionPreference): void {
  document.documentElement.dataset.motion = preference;
}

/**
 * Applies the remembered choice before the first render, so a reader who reduced
 * motion never sees the page animate in.
 * @returns {void}
 */
export function applyStoredMotion(): void {
  markRoot(motionChoice.read());
}

/**
 * Tells whether motion is reduced, by the system or by the reader, for what
 * neither the global rule nor `MotionConfig` reaches.
 * @returns {boolean} Whether motion is reduced
 */
export function isMotionReduced(): boolean {
  return (
    motionChoice.read() === "reduce" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Holds the reader's motion preference, shared by everything that reads it.
 * @returns {MotionPreferenceState} The preference and its setter
 */
export function useMotionPreference(): MotionPreferenceState {
  const motionPreference = useSyncExternalStore(
    motionChoice.subscribe,
    motionChoice.read,
  );

  /**
   * Remembers a new preference and applies it to the root at once.
   * @param {MotionPreference} next - The new preference
   * @returns {void}
   */
  const setMotionPreference = (next: MotionPreference): void => {
    markRoot(next);
    motionChoice.write(next);
  };

  return {
    motionPreference,
    setMotionPreference,
    reducedMotion: motionPreference === "reduce" ? "always" : "user",
  };
}
