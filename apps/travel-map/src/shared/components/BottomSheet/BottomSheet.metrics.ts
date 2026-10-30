/*
 * The sheet's resting geometry, shared with the map camera so a framed trip
 * lands in the part of the map the sheet leaves visible.
 */

/** How much of a collapsed sheet stays on screen, in rem: its handle and title. */
export const SHEET_PEEK_REM = 4.75;

/** The share of its height a half-open sheet slides below the screen. */
export const SHEET_HALF_HIDDEN_SHARE = 0.48;

/** The gap above a full sheet in rem, mirrored by `top` in `BottomSheet.scss`. */
export const SHEET_TOP_REM = 4.5;
