import { readStoredString, writeStoredString } from "@travelmap/ui/lib/storage";
import { z } from "zod";

import { AlbumSection, tripAlbums } from "@/data/albums";

/* The choices the settings offer, so a stored value outside them is refused. */
export const IDLE_MINUTES = ["1", "2", "5", "10"] as const;
export const PHOTO_SECONDS = ["5", "10", "20"] as const;
export const SLIDE_ORDERS = ["shuffle", "trips"] as const;
export const TRIP_SELECTIONS = ["all", "selected"] as const;

/*
 * localStorage is untrusted (an older shape, a hand edit), so each field falls
 * back to its default on its own rather than discarding every preference.
 */
const KioskSettingsSchema = z.object({
  hasCaptions: z.boolean().catch(true),
  hasTransitions: z.boolean().catch(true),
  idleMinutes: z.enum(IDLE_MINUTES).catch("2"),
  isFullscreen: z.boolean().catch(false),
  order: z.enum(SLIDE_ORDERS).catch("shuffle"),
  photoSeconds: z.enum(PHOTO_SECONDS).catch("10"),
  restoresOnReload: z.boolean().catch(false),
  selection: z.enum(TRIP_SELECTIONS).catch("all"),
  tripIds: z.array(z.string()).catch([]),
  wasEnabled: z.boolean().catch(false),
});

/** How the slideshow runs on this device, remembered between visits. */
export type KioskSettings = z.infer<typeof KioskSettingsSchema>;

/**
 * Everything the kiosk host and the settings section share.
 * @property {KioskSettings} settings - The remembered preferences
 * @property {boolean} isEnabled - Whether idleness brings the slideshow back
 * @property {boolean} isShowing - Whether the slideshow covers the app now
 * @property {boolean} hasNoPhotos - Whether the last slideshow found nothing it could show
 */
export interface KioskState {
  settings: KioskSettings;
  isEnabled: boolean;
  isShowing: boolean;
  hasNoPhotos: boolean;
}

const STORAGE_KEY = "kiosk";

/**
 * Reads the remembered preferences, every unreadable field at its default.
 * @returns {KioskSettings} The preferences
 */
function readSettings(): KioskSettings {
  let stored: unknown = {};
  try {
    stored = JSON.parse(readStoredString(STORAGE_KEY) ?? "{}");
  } catch {
    /* Text that is not JSON reads as nothing remembered. */
  }
  return KioskSettingsSchema.parse(
    typeof stored === "object" && stored !== null ? stored : {},
  );
}

const initialSettings = readSettings();
/* A fresh visit starts with kiosk mode off unless the operator asked otherwise. */
let state: KioskState = {
  hasNoPhotos: false,
  isEnabled: initialSettings.restoresOnReload && initialSettings.wasEnabled,
  isShowing: false,
  settings: initialSettings,
};
const listeners = new Set<() => void>();

/**
 * Replaces the state, remembers the preferences, and tells every subscriber.
 * @param {Partial<KioskState>} patch - The fields that change
 * @returns {void}
 */
function update(patch: Partial<KioskState>): void {
  const next = { ...state, ...patch };
  state = {
    ...next,
    settings: { ...next.settings, wasEnabled: next.isEnabled },
  };
  writeStoredString(STORAGE_KEY, JSON.stringify(state.settings));
  listeners.forEach((listener) => listener());
}

/**
 * The kiosk state as a store for `useSyncExternalStore`, shared by the
 * settings section and the host that runs the slideshow.
 */
export const kioskStore = {
  /**
   * Reads the current state.
   * @returns {KioskState} The state
   */
  read: (): KioskState => state,

  /**
   * Follows changes until the returned function runs.
   * @param {() => void} listener - Called after every change
   * @returns {() => void} Stops following
   */
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * Changes some preferences.
   * @param {Partial<KioskSettings>} patch - The preferences that change
   * @returns {void}
   */
  setSettings: (patch: Partial<KioskSettings>): void =>
    update({ settings: { ...state.settings, ...patch } }),

  /**
   * Turns kiosk mode on and starts the slideshow at once.
   * @returns {void}
   */
  enable: (): void =>
    update({ hasNoPhotos: false, isEnabled: true, isShowing: true }),

  /**
   * Turns kiosk mode off, which also stops the idle timer.
   * @returns {void}
   */
  disable: (): void => update({ isEnabled: false, isShowing: false }),

  /**
   * Shows or hides the slideshow while kiosk mode stays on.
   * @param {boolean} isShowing - Whether the slideshow covers the app
   * @returns {void}
   */
  setShowing: (isShowing: boolean): void => update({ isShowing }),

  /**
   * Stops a slideshow that went through every photo without showing one, so
   * the app stays usable and the settings can say why.
   * @returns {void}
   */
  reportNoPhotos: (): void =>
    update({ hasNoPhotos: true, isEnabled: false, isShowing: false }),
};

/**
 * One photo's place in the slideshow: which visit it belongs to and its
 * position there. Positions are cheap, so the order is settled up front and a
 * visit's photos load only when one of them comes up.
 * @property {AlbumSection} section - The visit
 * @property {number} index - The photo's position within the visit
 */
export interface SlidePosition {
  section: AlbumSection;
  index: number;
}

/**
 * Lists every photo position of the chosen visits, in travel order or
 * shuffled.
 * @param {AlbumSection[]} sections - The visits, in travel order
 * @param {(typeof SLIDE_ORDERS)[number]} order - Whether to shuffle
 * @param {() => number} [random=Math.random] - A source of numbers in [0, 1)
 * @returns {SlidePosition[]} The order the photos are shown in
 */
export function buildSlideOrder(
  sections: AlbumSection[],
  order: (typeof SLIDE_ORDERS)[number],
  random: () => number = Math.random,
): SlidePosition[] {
  const positions = sections.flatMap((section) =>
    Array.from({ length: section.gallery.count }, (_unused, index) => ({
      index,
      section,
    })),
  );
  if (order === "trips") return positions;

  /* Fisher–Yates: every order equally likely. */
  for (let last = positions.length - 1; last > 0; last--) {
    const pick = Math.floor(random() * (last + 1));
    [positions[last], positions[pick]] = [positions[pick]!, positions[last]!];
  }
  return positions;
}

/**
 * Lists the visits the slideshow draws from: every trip's, or only the
 * selected trips'.
 * @param {KioskSettings} settings - The kiosk preferences
 * @returns {AlbumSection[]} The visits, in travel order
 */
export function chosenSections(settings: KioskSettings): AlbumSection[] {
  const chosen = new Set(settings.tripIds);
  return tripAlbums
    .filter(({ trip }) => settings.selection === "all" || chosen.has(trip.id))
    .flatMap(({ album }) => album.sections);
}
