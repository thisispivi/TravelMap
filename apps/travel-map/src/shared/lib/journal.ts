import { NavTabId } from "@/shared/context/AppRoute.context";
import { ResponsiveType } from "@/shared/hooks/useResponsive";

/*
 * The pages that look back over the whole archive. They have their own tabs when
 * the navigation has room, and share one Journal tab, with a switcher on each
 * page, when it does not. A new page needs one line here.
 */
export const JOURNAL_PAGES = [
  { id: "stats", path: "/stats" },
  { id: "timeline", path: "/timeline" },
  { id: "passport", path: "/passport" },
] as const satisfies readonly { id: NavTabId; path: string }[];

/* Trips, places and gallery always have a tab; on a phone, so do the settings. */
const RAIL_FIXED_TABS = 3;
const BAR_FIXED_TABS = 4;

/* Below this a bar tab's longest label, Italian `Statistiche`, starts to collide. */
const BAR_TAB_MIN_PX = 72;
const BAR_PADDING_PX = 16;

const RAIL_TAB_PX = 59;
/* The logo, the settings at the rail's foot, the rail's padding and the shell's gaps. */
const RAIL_CHROME_PX = 180;

/**
 * Decides whether the journal pages share one tab. It works from the window
 * rather than measuring the rendered navigation, whose size depends on this very
 * answer and could otherwise flip back and forth at the edge.
 * @param {ResponsiveType} viewport - The current viewport
 * @returns {boolean} Whether there is too little room for a tab per page
 */
export function groupsJournal(viewport: ResponsiveType): boolean {
  const pages = JOURNAL_PAGES.length;
  return viewport.isCompact
    ? (BAR_FIXED_TABS + pages) * BAR_TAB_MIN_PX + BAR_PADDING_PX >
        viewport.window.width
    : (RAIL_FIXED_TABS + pages) * RAIL_TAB_PX + RAIL_CHROME_PX >
        viewport.window.height;
}
