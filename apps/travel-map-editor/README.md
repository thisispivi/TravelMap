# Travel Map editor

The editor is the local authoring surface for the JSON documents under
`data/`. It runs beside the public map and writes through Vite's local-only
middleware; it is not intended to be deployed.

## Navigation and routes

The persistent navigation keeps the dashboard, trip archive, places,
transport companies, and settings reachable from every screen. On narrow
viewports it becomes a bottom navigation while the brand and theme control
remain at the top.

| Route                   | Purpose                                                           |
| ----------------------- | ----------------------------------------------------------------- |
| `/`                     | Bento dashboard with trips grouped by year, places, and companies |
| `/trip/:id`             | Trip itinerary, map, inspector, and validation workspace          |
| `/places/cities/:id`    | City document editor                                              |
| `/places/countries/:id` | Country document editor                                           |
| `/companies`            | Transport-company catalogue and logo management                   |
| `/settings`             | Site, locale, map, backup, and dataset settings                   |

## Shared visual system

The editor resolves `@app/*` to `apps/travel-map/src/*` and places the public
app's styles on Sass's load path. Both apps therefore use the same theme
tokens, typography, mixins, icons, and theme preference rather than keeping a
second editor palette.

Country flags have one authoritative asset pack:
`apps/travel-map/public/flags/`. The public app's `CountryFlag` component is
also used by the editor. The editor imports URLs from that pack through Vite
because its development server has a different public directory. The
`world-countries` dependency supplies country metadata only; it does not
provide flag artwork.

## Action feedback

`ToastProvider` lives above the routes so confirmations survive navigation.
Autosave accepts an `onSaved` reaction, allowing trip, place, settings, and
company screens to confirm successful disk writes without duplicating save
logic. Create, delete, backup, restore, and logo-upload actions use the same
toast host. Inline save status remains available for longer-running or failed
writes.

## Responsive behavior

Dashboard panels collapse from the twelve-column bento layout to a single
column, trip cards move from four columns to one, and place lists retain their
own compact pagination. Document screens stay scrollable. The trip workspace
reduces from three panes to an itinerary-over-map layout, with the inspector
kept as an off-canvas panel and room reserved for the mobile navigation.

## Verification

From the repository root, run `pnpm check` after editor changes. Run
`pnpm build` whenever shared tokens, public assets, dependencies,
configuration, or production output may be affected.
