# Travel Map editor

The editor is the local authoring surface for the JSON documents under
`data/`. It runs beside the public map and writes through Vite's local-only
middleware; it is not intended to be deployed.

## Navigation and routes

One floating pill carries everything: the brand, the five destinations, the
autosave status, and the theme control. It is the public map's own navigation —
a centred, glass, fully rounded bar — so both apps read as one product. It is
sticky rather than fixed, because the workspace fills the viewport and a bar
floating over it would cover the trip's own header.

It sheds what does not fit as the viewport narrows: below `66rem` the tab
labels go and the icons carry the destinations alone (each tab keeps its
`aria-label`), and below `42.5rem` the pill drops to the bottom of the screen
as a five-across bar with the labels back, while status and theme pin
themselves to the top-right corner — status is not navigation, and the bottom
bar's width belongs to the destinations. The mobile bar also drops its blur:
`backdrop-filter` would make it the containing block for the fixed status
pill and trap it inside.

`NAV_TABS` and `activeTabId` in `EditorNav.tsx` are the whole routing story.
The dashboard keeps trips, places, and operators on one route, so below it the
hash is what separates them from the dashboard as a whole.

| Route                   | Purpose                                                           |
| ----------------------- | ----------------------------------------------------------------- |
| `/`                     | Bento dashboard with trips grouped by year, places, and companies |
| `/trip/:id`             | Trip itinerary, map, inspector, and validation workspace          |
| `/places/cities/:id`    | City document editor                                              |
| `/places/countries/:id` | Country document editor                                           |
| `/companies`            | Transport-company catalogue and logo management                   |
| `/settings`             | Site, locale, map, backup, and dataset settings                   |

The dashboard leads with its content rather than a title block: creating a
trip belongs to the trip card, managing operators belongs to the operator
card, and settings belongs to the navigation. Document screens are introduced
by a breadcrumb (`Home › City`) instead of an uppercase eyebrow.

## Shared visual system

The editor resolves `@app/*` to `apps/travel-map/src/*` and places the public
app's styles on Sass's load path. Both apps therefore use the same theme
tokens, typography, mixins, icons, logo, and theme preference rather than
keeping a second editor palette.

The one place the editor cannot use a public-app token directly is the brand
accent: `$accentPrimary` is legible on light surfaces but reads at 3.7:1 on
`$darkBackground`. `App.scss` therefore declares `--editor-accent`,
`--editor-accent-strong`, `--editor-accent-soft`, and `--editor-accent-ink` on
`:root` and re-declares the dark values under the `body--dark` theme class.
Authored styles use those custom properties and never `$accentPrimary`
directly. They are declared on the document rather than on `.editor` so
portalled menus, date pickers, and toasts inherit them too.

Country flags have one authoritative asset pack:
`apps/travel-map/public/flags/`. The public app's `CountryFlag` component is
also used by the editor. The editor imports URLs from that pack through Vite
because its development server has a different public directory. The
`world-countries` dependency supplies country metadata only; it does not
provide flag artwork. The pack draws each flag as a landscape rectangle inside
a square viewBox, so frames that show one are landscape too — a circular frame
clips the flag's left and right edges.

Browser icons are the exception to "one copy": `index.html` needs them served
from the editor's own public directory in development, so
`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, and
`apple-touch-icon.png` are copied from `apps/travel-map/public/`. Replace both
copies when the brand changes.

## Maps

`features/map/lib/worldPolygons.ts` builds the country geometry once and
`features/map/components/WorldLayers` renders the land and border layers that
both the trip map and the coordinate picker sit on. The geometry is split at
the antimeridian with the public app's `splitGeometryAtAntimeridian`, without
which the countries that cross it fill as bands stretched across the whole
map. Both maps also disable world copies, rotation, and pitch, matching the
public map. Labels are still not drawn: they would need the app's SDF glyphs,
which the editor does not serve.

## Action feedback

`ToastProvider` lives above the routes so confirmations survive navigation.
Autosave accepts an `onSaved` reaction, allowing trip, place, settings, and
company screens to confirm successful disk writes without duplicating save
logic. Create, delete, backup, restore, and logo-upload actions use the same
toast host.

Save status is published rather than rendered per screen: `useAutosave` writes
its status into `SaveStatusContext` and `EditorNav` renders the one `SaveChip`,
including the retry action after a failed write. Screens therefore keep their
headers for what is specific to them.

## Day trips

A day trip is stored as one `roundTrip` transport followed by its destination
stop. The transport returns the traveller's logical location to its departure
city, so the next leg starts from the base even though the excursion stop is
the closest preceding stop in the array.

The stop inspector's **Add day trip from this stay** action inserts both steps
before the existing onward leg. This is deliberately different from appending
a normal place and dragging it backwards: legs retain their authored details
by route position during a reorder, so using an explicit insertion prevents an
existing flight or ferry from being repurposed as the excursion. The leg
inspector also exposes the flag for imported or older itineraries, and endpoint
realignment uses the traveller's logical post-excursion location.

Selecting the excursion destination and choosing **Add next stop** converts a
compact round trip into an explicit multi-city loop. The conversion adds the
return leg and a layover stop at the base; later insertions split the route
before that return, matching the structure used by the Romania itinerary.

The editor navigation includes its own locale selector. Browser detection still
chooses the initial locale, while the selector uses the same i18next preference
mechanism as the public app so authors can verify translated fields and controls
directly.

## Layout and responsive behavior

`.editor` is the scroll container: a flex column of a definite height, so a
full-height screen claims exactly the space the navigation leaves instead of
subtracting the bar's height by hand. The workspace is a flex column for the
same reason — its recovery banner and bulk bar are conditional, and the fixed
grid rows it used before handed the flexible row to whichever child happened
to land in it, which collapsed the validation tray.

Dashboard panels collapse from the twelve-column bento layout to a single
column, trip cards move from four columns to one, and place lists retain their
own compact pagination. The place and operator cards share a grid row, so
their rows are sized alike: a taller operator row is what would force the place
lists to pad themselves out below their last entry. Operator cards on
`/companies` are half-width, with the name field above the logo dropzone.
Document screens stay scrollable. The trip workspace reduces from three panes
to an itinerary-over-map layout, with the inspector kept as an off-canvas panel
and room reserved for the mobile navigation.

## Verification

From the repository root, run `pnpm check` after editor changes. Run
`pnpm build` whenever shared tokens, public assets, dependencies,
configuration, or production output may be affected.
