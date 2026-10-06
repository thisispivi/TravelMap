import { z } from "zod";

/*
 * History state survives reloads and back/forward navigation across deploys,
 * so an entry may predate the current shape. `fromPath` is navigated to, so it
 * must stay an in-app path.
 */
const NavigationStateSchema = z.object({
  fromPath: z.string().startsWith("/").optional(),
  mapOnly: z.boolean().optional(),
});

/**
 * The router history state the app's own navigations attach.
 * @property {string} [fromPath] - The in-app path a gallery should return to
 * @property {boolean} [mapOnly] - Whether the root route should show the bare map instead of redirecting to trips
 */
export type NavigationState = z.infer<typeof NavigationStateSchema>;

/**
 * Reads router history state, treating anything that does not match the shape
 * the app writes as no state at all.
 * @param {unknown} state - `location.state` as the router hands it over
 * @returns {NavigationState} The recognised fields, or an empty state
 */
export function readNavigationState(state: unknown): NavigationState {
  return NavigationStateSchema.safeParse(state).data ?? {};
}
