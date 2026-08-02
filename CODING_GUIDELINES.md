# Coding Guidelines

How code in this repo is written, so that anything generated later — by a
human or an assistant — reads as if the same person wrote it. Every rule below
is either taken from the existing code (examples are real, lightly trimmed) or
flagged explicitly as a new convention, with the reason it's being introduced.

Two ideas run through everything:

1. **Write the least code that works, then explain _why_ it's shaped that
   way.** Comments carry rationale, not narration.
2. **Lean on the platform.** React Compiler, the standard library, and native
   browser features do the work before a dependency or an abstraction does.

Rules use `MUST` (required, enforced by lint or review), `SHOULD` (the
project-wide default — deviate only with a stated reason), and `MAY`
(context-dependent, use judgment).

---

## 1. Purpose and scope

This document is the canonical coding standard for the whole repository.
`CLAUDE.md`, `AGENTS.md`, and `.github/copilot-instructions.md` are thin
adapters that point here — keep shared rules only in this file.

Repository shape (pnpm workspace, see `pnpm-workspace.yaml`):

```
apps/
  travel-map/          The public site — React + TypeScript + Vite + SCSS
  travel-map-editor/   The authoring tool used to produce data/ content
packages/
  core/                @travelmap/core — shared domain model, no build step
data/                  Trip/city/country JSON + photos consumed by both apps
scripts/uploader/      Typed Python media uploader
logos/                 Source and exported brand assets
```

Sections 6–15 (React, hooks, state, styling, accessibility, performance) apply
wherever React/TypeScript is authored — today that's `apps/travel-map` and
`packages/core`. `apps/travel-map-editor` uses the same stack and the same
rules apply there, but it has not been part of this revision's audit; treat
its patterns as unverified until it gets the same pass. The universal
principles (§2, §17, §18) apply everywhere, including `scripts/uploader`.

Generated media, generated gallery JSON, third-party assets, and lockfiles
keep their generator's or upstream format — these rules don't apply to them.

---

## 2. Core engineering principles

- **Least code that works.** No interface for one implementation, no config
  for a value that never changes, no speculative extension point. A concrete,
  current-or-imminent use case justifies an abstraction; "we might need this
  later" doesn't.
- **Say why, not what.** The code should read clearly enough that comments
  don't need to narrate it. Comment the non-obvious: a constraint, a
  workaround, a rejected alternative, a domain fact a reader wouldn't know.
- **Lean on the platform first.** Reach for the standard library, a native
  browser API, or an already-installed dependency before writing new code or
  adding a package. `remeda` (already a dependency) covers most collection
  utilities (`unique`, etc.) — don't reinvent them.
- **Match the existing voice.** When a pattern already exists in the codebase
  (a hook shape, a JSDoc style, a naming scheme), extend it rather than
  introducing a competing one, even if you'd have designed it differently from
  scratch.
- **Existing deviations are not precedent.** If you find code that violates
  this document, fix it if it's in your diff's blast radius; don't copy it
  forward into new code.

---

## 3. Repository architecture

`apps/travel-map` is organized by **architectural layer**, not by feature or
route:

- **Atomic design** for UI (`components/atoms → molecules → organisms →
pages → templates`) — see §4.
- **One shared page-level context** (`HomeContext`, in
  `components/pages/Home/HomeContext.ts`) holds cross-cutting state (theme,
  map viewport, hover, selected trip, active panel). Everything under `Home`
  reads from it via `use(HomeContext)!`.
- **Domain model lives outside the app**, in the `@travelmap/core` workspace
  package (`packages/core`) — classes (`Trip`, `City`, `Country`, `Travel`,
  `Ferry`, `Flight`, `Color`), typings, a `schema/` module describing the raw
  JSON shapes, and `world/buildWorld.ts`, which is the single place that turns
  raw JSON into a linked object graph (see §9).
- **Routing is a persistent shell, not per-route pages.** `src/main.tsx`
  defines a `createHashRouter` tree where most routes resolve to
  `element: null` (`/trips`, `/trip/:tripId`, `/places`, `/places/:filter`) —
  `Home` stays mounted for all of them and reads the matched path itself via
  `hooks/location/location.ts` (a pathname classifier, not `useParams`) to
  decide which panel to show over the map. Only genuinely separate views
  (`Timeline`, `Stats`, `Gallery`, `Lightbox`) get a real routed `element`,
  and those are lazy-loaded. **When adding a new panel that lives inside the
  map shell, follow this pattern**: add the path with `element: null`, then
  extend `hooks/location/location.ts` and `Home` — don't give it its own
  routed page component. When adding a genuinely standalone view, follow the
  `Timeline`/`Stats` pattern (own lazy-loaded route element).
- **No client-server API.** There is no backend. All content is static JSON
  under `/data`, bundled at build time via `import.meta.glob` (see §9). `swr`
  is a dependency but is not currently used for remote data fetching in the
  audited code — if you introduce actual network requests, `swr` is the
  established choice; don't add a second data-fetching library.

This layered-by-role structure fits the app's current size well: ownership is
already unambiguous (a component's folder tells you what it is; `packages/core`
tells you where domain logic lives), and there's no evidence of the kind of
cross-feature entanglement that a feature-folder migration would fix. Don't
migrate to `src/features/*` speculatively — see §20 for what to do instead.

---

## 4. Folder structure

```
apps/travel-map/src/
  components/
    atoms/       Smallest reusable pieces (Marker, Button, Loading, EmptyState)
    molecules/   Small compositions of atoms (Cards, Row, Timeline)
    organisms/   Feature-level blocks (Map, TripBrowser, TripDetail, Gallery)
    pages/       Route-level containers (Home + HomeContext, Timeline, Stats)
    templates/   Page-level layout shells (templates/Home)
  data/          Loads /data JSON via import.meta.glob and calls buildWorld()
  hooks/         Reusable hooks, grouped by concern (image, language,
                 location, stats, style)
  i18n/          Translation setup and formatting functions
  utils/         Pure, dependency-free, domain-named helpers (trips.ts,
                 countries.ts, transport.ts, className.ts, keyboard.ts —
                 never a generic utils.ts/helpers.ts grab bag)
  styles/        Global SCSS: _variables.scss, _variables.module.scss, mixins
  assets/        Icons (SVG via svgr), JSON, flags

packages/core/src/
  classes/       Trip, City, Country, Travel, Ferry, Flight, Color
  typings/       Continent, Currency, FerryCompany, FlightCompany, Image, …
  schema/        Raw JSON shape typings
  world/         buildWorld.ts (the graph builder), date.ts
```

One component per folder, co-located with its `.scss`:
`Marker/Marker.tsx` + `Marker/Marker.scss`. No barrel (`index.ts`) files exist
anywhere in the app today — keep it that way; import from the concrete file.

**When a module belongs where:**

- A component used by exactly one organism stays a private sub-component in
  that organism's file (see §6) — it doesn't get its own folder just because
  it's a function.
- A helper used by exactly one component can live at the bottom of that
  component's file or as a same-folder sibling; once a second component needs
  it, promote it to `utils/` (app) or `packages/core` (if it's a domain
  concept, not a UI concern).
- Pure algorithmic logic that doesn't touch React (data reshaping, grouping,
  sorting) belongs in `utils/` even if only one component currently calls it
  — see the `Timeline`/`TripDetail` cleanup in §20 for why this matters in
  practice, not just in theory.
- Anything that operates on the raw JSON shape or the domain classes
  (`Trip`, `City`, …) belongs in `packages/core`, not duplicated in the app.

---

## 5. File and folder naming

| Thing                     | Convention                              | Example                                |
| ------------------------- | --------------------------------------- | -------------------------------------- |
| Component file & folder   | `PascalCase`, folder = file name        | `Marker/Marker.tsx`                    |
| Component stylesheet      | Same base name, `.scss`                 | `Marker/Marker.scss`                   |
| Hook file                 | `camelCase`, grouped by concern         | `hooks/style/theme.ts`                 |
| Domain-named utility file | `camelCase`, names the domain           | `utils/trips.ts`, `utils/transport.ts` |
| Domain class file (core)  | `PascalCase`, matches export            | `packages/core/src/classes/Trip.ts`    |
| Type/typings file (core)  | `PascalCase` for a single concept       | `typings/FlightCompany.ts`             |
| Test file (see §16)       | Colocated, `.test.ts`/`.test.tsx`       | `Trip.test.ts` next to `Trip.ts`       |
| SVG asset                 | `PascalCase.svg`, imported as component | `Calendar.svg` → `?react`              |

- `PascalCase` for anything that exports a component, class, or type as its
  primary export.
- `camelCase` for anything that exports functions/values (hooks, utils).
- Never name a file `utils.ts`, `helpers.ts`, `types.ts`, or `constants.ts` —
  every current utility file is named for the domain concept it covers
  (`trips.ts`, `countries.ts`, `continent.ts`, `timezone.ts`,
  `tripDetailTimeline.ts`); keep that precedent. If you're about to create a
  generic-named file, that's a signal the logic hasn't found its real home
  yet — find the domain name first.
- No barrel (`index.ts`) files. This repo's convention is direct imports from
  the concrete module; don't introduce barrels for "convenience" — they hide
  what's actually used (knip, the dead-code checker in `pnpm check`, works
  better against direct imports too).
- Folders are singular when they represent one concept (`Marker/`) and plural
  when they group a concern (`hooks/`, `atoms/`).

---

## 6. React component conventions

Named `function` declarations (never `const X = () =>` for components, never
default exports for components), explicit `ReactNode` return type, props
destructured **in the signature** with defaults only for meaningful fallbacks:

```tsx
interface MarkerProps {
  city: City;
  hoveredCity: City | null;
  onHoverCity: (city: City | null) => void;
  onSelectCity: (city: City) => void;
  variant?: MarkerVariant;
}

export function Marker({
  city,
  hoveredCity,
  onHoverCity,
  onSelectCity,
  variant = "visited",
}: MarkerProps): ReactNode {
  const isHovered = hoveredCity?.name === city.name;
  return (/* … */);
}
```

- **Props interface** is `<Component>Props`, declared directly above the
  component.
- **Optional props** use `?`. Give a signature default only when there's a
  meaningful fallback (`variant = "visited"`). When omission itself is the
  intended value, destructure without a default; never write
  `prop = undefined`.
- **Sub-components local to one organism** MUST live in the same file. Prefer
  putting them above the component that uses them (matches
  `organisms/Map/MapLayers.tsx`, where `MapLabels` precedes `MapLayers`), but
  a sub-component below the main one (as in
  `organisms/TimelineTrack/TimelineTrack.tsx`) is a style nit, not a
  correctness issue — fix it if you're already editing that file. Sub-
  components that are reused by more than one organism get their own file
  (this is why `MapMarkers` and the tooltip now live in their own files,
  `organisms/Map/MapMarkers.tsx` and `organisms/Tooltip/TooltipMap.tsx`,
  instead of inside `Map.tsx`). Never define a component inside another
  component's render body — `react/no-unstable-nested-components` forbids it.
- **Event handlers wired directly to a JSX/DOM event prop** (`onClick=
{handleClick}`) MUST be named `handleX`. **Action functions** that
  encapsulate a piece of business logic and are called from one or more
  handlers (`openGallery`, `selectYear`) MAY keep a plain verb name — they
  aren't handlers themselves, they're what a handler calls. Don't force
  `handle` onto every function that happens to run in response to user
  interaction.
- **Callback props** are named `onX` (`onHoverCity`, `onSelectCity`).
- **Conditional rendering** uses ternaries returning `null`, never `&&`
  (`react/jsx-no-leaked-render` enforces this):

  ```tsx
  {isLoaded ? <MapMarkers … /> : null}
  {showDates && travel?.sDate ? <DateRow … /> : null}   // guard first, then ternary
  ```

- **Conditional class names** go through the `classNames` util, not a
  template literal, for **any** conditional class — including a single
  condition. `Home.tsx` building a three-way class string by hand is the
  counter-example to fix, not a precedent to extend; `SegmentedControl.tsx`'s
  single-condition `classNames()` call is the pattern to follow everywhere.
- **List rendering** uses a stable, domain-derived key (a city name, trip id)
  — never the array index. The codebase already does this consistently;
  don't regress it.
- **JSX props are sorted alphabetically**, elements self-close when empty,
  every `<button>` declares `type="button"`, fragments use `<>` shorthand.
- **Icon-only actionable elements**: if it behaves like a button, make it a
  real `<button type="button">` wrapping the icon — that gets you focusability,
  keyboard activation, and a default accessible role for free, which is less
  code than reimplementing them. `atoms/Buttons/CloseButton.tsx`,
  `FloatingNav`'s logo, and `Gallery`'s play-icon overlay currently attach a
  bare `onClick` to an SVG with no role, no `tabIndex`, and no keyboard
  handler — none of them are reachable by keyboard. Fix by wrapping in
  `<button>`, not by adding `role`/`tabIndex`/`onKeyDown` by hand. Reserve the
  `role="button"` + `tabIndex={0}` + `isActivationKey` pattern (§13) for
  elements that have a real reason not to be a `<button>` — e.g. `Marker` and
  `CityCard`, which are non-rectangular map/photo surfaces with their own
  layout and hover semantics.

### When to split a component, when to leave it together

Split when a file mixes concerns that don't need to be adjacent to work: pure
data transformation, imperative DOM measurement, and JSX rendering are three
different jobs. `molecules/Timeline/Timeline.tsx` (606 lines) is the clearest
current example — `collapseTransportChains` and `buildDisplaySegments` are
pure functions with no JSX and no hooks; they belong in `utils/
tripDetailTimeline.ts` (which already exists and already holds related logic)
next to the component that renders the result, not inside it.
`organisms/TripDetail/TripDetail.tsx`'s `computeTripStats` is the same
problem in a different shape: it re-derives statistics that should be a
method on `Trip` in `packages/core`, not a one-off function in a component.

Don't split for its own sake: a 150-line component that's 150 lines of JSX
because it renders a genuinely complex layout doesn't need to be carved into
five files that all import each other. Split along a real seam (pure logic
vs. rendering, or "used elsewhere" vs. "used here"), not by line count alone.

---

## 7. Hooks and effects

- **Naming**: every hook is `useX` (`useLanguage`, `useResponsive`,
  `useStatsData`). Return an object with named fields, not a tuple or array —
  every hook in this codebase does this (`UseLanguageReturn`,
  `UseLocationReturn`, `ResponsiveType`), and it keeps call sites
  self-documenting (`const { isHovered, setHovered } = useX()` beats
  `const [a, b] = useX()`).
- **One responsibility per hook.** `hooks/location/location.ts` (classifies
  the current route into ~10 flags/strings from one pathname) is at the edge
  of this — it's one job ("what does this URL mean") with a wide surface, not
  ten jobs, so it's acceptable as-is, but don't add unrelated concerns to it.
- **Effects** have explicit dependency arrays and a cleanup return whenever
  they subscribe to anything. Grab the ref into a local first so the cleanup
  closes over a stable value:

  ```tsx
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new IntersectionObserver(/* … */, { rootMargin: "25%" });
    observer.observe(card);
    return () => observer.disconnect();
  }, [shouldLoadImage]);
  ```

- **The "latest ref" effect is an accepted idiom, not a lint dodge.** Several
  components (`TripBrowser`, `PlacesBrowser`, `StatsGrid`, `Gallery`,
  `TripDetail`) use a dependency-array-free
  `useEffect(() => { xRef.current = x; })` purely to keep a ref pointing at
  the latest value for a resize/measure callback that can't itself be an
  effect dependency. This is intentional — recognize it, don't "fix" it by
  adding a dependency array that would break it.
- **Don't use an effect to store what you can compute during render.** If a
  value can be derived from props/state/context synchronously, compute it
  inline (or in a `useMemo` per the rule below) instead of `useState` +
  `useEffect` that copies it. The one existing borderline case,
  `TripDetail.tsx` computing `trip` inline and then using an effect to push
  it into `selectedTrip` on the shared `HomeContext`, is not this
  anti-pattern — it's syncing a locally-derived value into
  ancestor-owned state so a trip reached by direct URL updates the shared
  context, which state can't do without an effect. Don't copy this shape for
  anything that isn't crossing a state-ownership boundary.
- **Don't use an effect for event-driven logic.** If something should happen
  because the user clicked or submitted, put it in the handler, not in an
  effect watching a state flag that the handler set.
- **Memoization is not the default.** React Compiler
  (`babel-plugin-react-compiler`, wired in `vite.config.ts`) handles
  render-to-render memoization — don't reach for `useMemo`/`useCallback` to
  "optimize" a component. The one legitimate use in this codebase is a
  genuinely expensive derived value keyed on something narrower than every
  render, e.g. building a MapLibre style object only when the theme changes:

  ```tsx
  const mapStyle = useMemo<StyleSpecification>(
    () => ({ version: 8 /* … */ }),
    [theme.ocean],
  );
  ```

  Before adding a `useMemo`, ask: is this expensive (not just "an object
  literal"), and does it need to survive renders where its inputs haven't
  changed for a reason the compiler can't already give you? If not, skip it.

- **Refs** (`useRef`) are for imperative handles (`mapRef`) and mutable
  non-render state (`hoverLeaveTimer`, `isTooltipInteracting`) — not as a
  substitute for state that should trigger a re-render.
- **Data-fetching/mutation hooks**: none exist in the audited code today (see
  §9) — there's no backend to fetch from. If you add one, give it the same
  shape as the rest: `useX` returning `{ data, error, isLoading }`-style
  named fields, and see §9 for where the fetching itself should live.

---

## 8. State management

Choose the narrowest scope that works, in this order:

1. **Local component state** (`useState`/`useReducer`) — the default for
   anything only one component (and its children via props) needs: open/closed
   toggles, scroll/overflow flags, local form state.
2. **Lifted state** — when two sibling components need the same value, lift it
   to their nearest common parent and pass it down. Don't reach for Context
   just to skip one level of prop passing.
3. **Context** — for state genuinely shared across a subtree with no single
   natural owner. `HomeContext` (`components/pages/Home/HomeContext.ts`) is
   the one context in the app: theme, map viewport, hover, selected trip, and
   panel visibility, provided once at `Home` and consumed everywhere below it
   via `use(HomeContext)!` — the non-null assertion is safe because `Home`
   guarantees the provider. Every new consumer should follow this exact
   pattern (`use`, not `useContext`; non-null assertion, not an optional
   chain). **Known gap**: `FloatingNav.tsx` calls `use(HomeContext)` without
   the assertion — align it with the rest rather than treating it as a second
   valid style.

   `HomeContext` bundles five unrelated concerns into one value, so any
   `dispatch` re-renders every consumer regardless of which field it reads.
   This isn't a problem worth a rewrite today — the app is small and the
   value is a small object — but if `HomeContext` grows further, split it by
   concern (e.g. a separate `ThemeContext`) before adding more fields to it,
   rather than after performance becomes visible.

4. **URL state** — for anything that should survive a refresh or be
   shareable: which trip/gallery/photo is open. The app already does this
   (route params for trip/gallery/photo ids, `useSearchParams` for
   `Gallery`'s `from` param). Prefer this over Context for "what's currently
   open" state that has a natural URL representation.
5. **Server state** — not applicable today (no backend). If it becomes
   applicable, don't store server data in `useState`/Context by hand; see §9.
6. **Persistent/global state** — not used and not needed at this scale. Don't
   add a global store (Redux/Zustand/etc.) speculatively; nothing in the
   current app has state that needs to outlive a page session or be accessed
   from truly unrelated subtrees.

**Never duplicate state that can be derived.** Compute derived values inline
or in a `useMemo` (only if expensive); don't `useState` + `useEffect` a copy
of something already available from props/context/a domain object's method.

---

## 9. Data fetching and API boundaries

There is no backend and no runtime network fetching in the audited code
(`apps/travel-map`, `packages/core`) — confirm this is still true before
copying "there's no data layer" as an assumption into new work.

**How data actually flows today:**

1. Raw JSON under `/data` (countries, cities, trips, site config, photos) is
   bundled at build time in `apps/travel-map/src/data/index.ts` via
   `import.meta.glob(..., { eager: true })` — no `fetch`, no loading state,
   because the data is part of the build, not a runtime request.
2. `packages/core/src/schema/index.ts` types the raw shapes (`CountryJson`,
   `CityJson`, `TripJson`, …) — TypeScript-only, no runtime validation.
3. `packages/core/src/world/buildWorld.ts` is the **single centralized
   transformation point**: it resolves id references between countries,
   cities, and trips (throwing via `requireReference()` if a reference
   doesn't resolve) and instantiates the domain classes (`Country`, `City`,
   `Trip`).
4. `apps/travel-map/src/data/index.ts` calls `buildWorld()` once and exports
   the results (`visitedTrips`, `visitedCities`, `visitedCountries`,
   `takenFlights`, `takenFerries`) as module-level constants that hooks and
   components import directly.

**Rules:**

- MUST keep transformation of raw JSON into domain objects inside
  `packages/core` (`buildWorld.ts` and the classes it builds). Don't add a
  second, component-local parser for data that `buildWorld` already produces
  — that's how duplicated/ad-hoc data transformation creeps in.
- MUST NOT fetch or transform data inside a component body. If a component
  needs a derived slice of the world data, that's a method on the relevant
  domain class or a function in `apps/travel-map/src/utils/`, not inline JSX
  logic.
- **Runtime validation is a real, currently-open gap, not a hypothetical
  one.** `requireReference()` catches broken id links, but nothing validates
  that a JSON file has the shape `CountryJson`/`CityJson`/`TripJson` claim —
  a malformed file fails wherever it's first used, not at the boundary. This
  matters more than it would in a typical internal app because `data/` is
  meant to be edited by the companion editor app and, per the project's
  fork-friendly design, by other people forking the template — trusting
  hand-authored JSON to always match the TypeScript shape is optimistic.
  SHOULD add a lightweight runtime check (e.g. a small hand-written
  validator, or `zod` if the checks get complex enough to want a schema
  language) at the `buildWorld()` boundary before this data source becomes
  less trusted than it is today. This is a `packages/core` change, not
  something to bolt onto individual components.
- If real network fetching is introduced later: `swr` is already a
  dependency of `apps/travel-map` — use it rather than adding a second
  fetching library or hand-rolling `useEffect` + `fetch`. Loading/error/empty
  states follow the same components used for the static-data case today
  (`EmptyState`, `Loading`) — don't invent new ones per feature.

---

## 10. TypeScript conventions

- **`interface`** for object shapes (props, data records, domain typings);
  **`type`** for unions and aliases.

  ```ts
  export type TransportMode =
    "ferry" | "plane" | "car" | "train" | "bus" | "taxi" | "walk";

  interface FlightLeg {
    company?: FlightCompany;
    number?: string; /* … */
  }
  ```

- **Coordinates are `[number, number]` tuples** (`[lng, lat]`), everywhere.
- **Prefer `as const`** for literal config tables so tuples stay narrow:

  ```ts
  const CITY_LABEL_TIERS = [
    { id: "major", minPopulation: 1_000_000, minZoom: 2 },
    // …
  ] as const;
  ```

- Numeric separators for large numbers: `1_000_000`.
- **No `any`.** `@typescript-eslint/recommended` is on; use `unknown` and
  narrow it if a value's shape genuinely isn't known yet (e.g. at a future
  runtime-validation boundary, see §9).
- **Casts are a last resort and get a reason.** Third-party escape hatches
  (e.g. MapLibre style expressions) use `as never` deliberately — an
  accepted pragmatic cast, not sloppiness. A cast with no comment explaining
  why it's safe is a review flag.
- **Non-null assertions** are allowed where a genuine invariant guarantees the
  value exists — the established example is `use(HomeContext)!`, safe because
  `Home` always provides it. Don't use `!` to silence a case that could
  actually be null; narrow it instead.
- **Enums vs. union types**: this codebase uses `enum` for closed,
  JSDoc-documented domain vocabularies (`TransportMode`) and plain string
  unions for everything else. Prefer a union type unless you specifically
  want the enum's namespacing and the extra JSDoc-per-value ceremony is
  earning its keep.
- **Discriminated unions and exhaustiveness**: when branching over a closed
  set of variants (transport modes, panel types), use a `switch` and let
  TypeScript flag missing cases; don't fall back to `if`/`else if` chains that
  silently do nothing on an unhandled variant.
- Function return types are written explicitly on named functions/components
  (`ReactNode`, `void`, a domain type) — this repo doesn't rely on inference
  for anything with a JSDoc `@returns`, since the two need to agree.

---

## 11. Imports and exports

Ordered by `simple-import-sort`, in groups separated by blank lines
(`pnpm lint:fix` sorts for you):

```tsx
import "./CityCard.scss"; // 1. Side-effect CSS first
import "maplibre-gl/dist/maplibre-gl.css";

import { ReactNode, useEffect, useRef } from "react"; // 2. External packages
import { useNavigate } from "react-router";

import CalendarIcon from "@/assets/icons/Calendar.svg?react"; // 3. @/ aliases
import { City, Travel } from "@travelmap/core"; // workspace package, sorts with externals
import { useLanguage } from "@/hooks/language/language";

import { Button } from "../../atoms/Buttons/Button"; // 4. Relative
```

- **Named exports only, everywhere.** Zero default exports for components,
  hooks, utils, or classes in the audited code — keep it that way. (`lazy()`
  aliases in `main.tsx` and route files are the one place a default export is
  consumed, because `React.lazy`/router `lazy` loaders require it structurally
  — that's importing a boundary, not a precedent for authoring new default
  exports.)
- **`@travelmap/core`** is the domain package — import from it like any other
  external dependency (`import { City, Travel } from "@travelmap/core"`), not
  via a `@/` alias; it's a separate workspace package, not part of the app's
  own source tree.
- Use the `@/` alias (mapped to `apps/travel-map/src` in both
  `tsconfig.json` and `vite.config.ts`) for anything outside the current
  feature; short relative paths (`../../../utils`) are still fine inside a
  feature. Prefer `@/` in new code — it survives file moves.
- SVGs import as React components via svgr: `import Icon from
"…/Icon.svg?react"`.
- Import React APIs and types directly from `react`, never a default `React`
  import or the `React.*` namespace:

  ```tsx
  import { MouseEvent, ReactNode, StrictMode, useEffect } from "react";
  ```

  Use the imported names in code and JSDoc (`MouseEvent`, `ReactNode`,
  `PropsWithChildren`, and so on) — never `React.ReactNode` in a JSDoc type.

- **No barrel files** (§5). Each module's public surface is just its named
  exports, imported directly.
- **No circular dependencies were found** in the audited code — keep the
  layering intentional so that stays true: `packages/core` never imports from
  `apps/travel-map`; `apps/travel-map/src/utils` and `hooks` don't import
  from `components`; components import from `utils`/`hooks`/`core`, not the
  reverse.

---

## 12. Styling (SCSS)

- **BEM**: `.block`, `.block__element`, `.block--modifier`, nested with `&`:

  ```scss
  .map-city-marker {
    --marker-color: #d50000;
    width: 1.25rem;

    &--future {
      --marker-color: #1565c0;
    }
    &--hovered,
    &:hover,
    &:focus-visible {
      transform: scale(1.22);
    }
  }
  ```

  Avoid chaining an element onto a modifier (`block__element--modifier__sub`)
  — `FilterByCountry.scss`'s `filter__option--select-all__icon` is the one
  current exception; don't extend that shape, restructure it to
  `filter__select-all-icon` or similar next time that file is touched.

- **`rem` units** for sizing/spacing, not `px` — consistently followed.
- **CSS custom properties** for values a modifier overrides (`--marker-color`).
- **Import shared SCSS with namespaces**, never `@import`:

  ```scss
  @use "../../../styles/variables" as v;
  @use "../../../styles/mixins" as m;

  color: v.$darkButtonContent;
  @include m.transition(background-color, 0.2s);
  ```

- **Theming is class-scoped**, not media-query-based: style under
  `.home--dark` and `.home--light` blocks, always provide both.

  ```scss
  .home--dark .map-container {
    /* … */
  }
  .home--light .map-container {
    background: v.$lightBackground;
  }
  ```

- **Respect `prefers-reduced-motion`** on every file that defines a
  transition or animation, not just the three that currently do
  (`TripCard.scss`, `TooltipMap.scss`, `Marker.scss`):

  ```scss
  @media (prefers-reduced-motion: reduce) {
    .map-city-marker {
      transition: none;
    }
  }
  ```

  Treat this as a checklist item (§19), not an opt-in — most `.scss` files
  with a `transition`/`animation` property don't have the carve-out yet.

- **Design tokens live in `_variables.scss`.** Before hardcoding a color,
  check whether an existing token already is that value — `Marker.scss`'s
  `--marker-color: #8a8ea4` duplicates `$darkAltTextDarker` by coincidence
  instead of referencing it, which is exactly what this rule exists to
  prevent. Values JavaScript needs (route/transport colors) are duplicated in
  `_variables.module.scss` and imported as a module:
  `import variables from "@/styles/_variables.module.scss"`.
- **Reuse the glass/blur mixins** (`glassmorphism-dark/light`,
  `floating-card-dark/light`, `full-panel-dark/light` in `_mixins.scss`)
  instead of hand-rolling a blur radius per file — about half the files that
  need this effect already use the mixins; the other half
  (`Home.scss`, `TripDetailHero.scss`, `TooltipMap.scss`, `Map.scss`,
  `Card.scss`, `TimelineTrack.scss`, `CityCard.scss`) each picked their own
  radius by hand. Converge new work on the mixins.
- `outline: none` MUST always be paired with a visible focus replacement
  (scale, ring, z-lift) in the same rule or file. `TripCard.scss`,
  `FilterByCountry.scss`, and `FloatingNav.scss` currently remove the outline
  with nothing standing in for it — that's a bug against this rule, not a
  style choice to preserve.

---

## 13. Accessibility

Not optional. The existing markers show the baseline:

- Prefer a native `<button type="button">` over reimplementing button
  semantics — see §6's "icon-only actionable elements" rule. Reach for the
  manual pattern below only when the element genuinely can't be a `<button>`.
- For elements that can't be a native control: `role="button"` +
  `tabIndex={0}` **and** keyboard activation via the `isActivationKey` helper
  (`utils/keyboard`), never a hand-rolled key check:

  ```tsx
  onKeyDown={(event) => isActivationKey(event) && openGallery()}
  ```

  `Marker` and `CityCard` do this correctly — use them as the reference.

- `aria-label` on interactive elements that don't have visible text (icon
  buttons, map markers); `aria-hidden="true"` on decorative SVG.
- Focus states are styled (`&:focus-visible`) with a replacement whenever
  `outline: none` is used (§12).
- **Overlays and dialogs** (`Lightbox`, `Gallery`, the map tooltip, dropdown
  panels like `FilterByCountry`): give the overlay `role="dialog"`/
  `aria-modal="true"` when it takes over the screen, support `Escape` to
  close (`FilterByCountry` already does), and return focus to the trigger
  element on close. The map tooltip (`Map.tsx`/`TooltipMap.tsx`) currently has
  no `Escape` handling — add it when next touching that file.
- **Image alt text**: use the photo's actual `alt` data when present
  (`Gallery.tsx` does this — `photo.alt ?? ""`); don't hardcode `alt=""`
  unconditionally the way `Lightbox.tsx` currently does — that silently
  discards real alt text the data provides.
- Don't leave a folder like `atoms/BottomSheet/` half-built with an unused
  mixin (`bottom-sheet()` in `_mixins.scss`) and no component — either finish
  it or delete it; dead a11y-relevant scaffolding is worse than no
  scaffolding because it looks implemented.

---

## 14. Error handling

- **Expected errors** (a referenced id that doesn't exist in `/data`, a route
  that doesn't match) fail loudly at build/parse time via
  `requireReference()` in `buildWorld.ts` and the router's `errorElement`
  (`Fallback`, wired in `main.tsx`) — keep failing loudly here. This is
  build-time data, not user input; there's no case where silently ignoring a
  bad reference is the right behavior.
- **Unexpected runtime errors** in the render tree should be caught by an
  error boundary at a sensible level (today, the router's `errorElement`
  covers routing-time failures; there's no component-level error boundary
  audited). If you add UI that can throw during render from unpredictable
  data, wrap it in a boundary rather than letting the whole app white-screen.
- **Never swallow a caught error silently.** If you catch something, either
  handle it meaningfully or don't catch it — an empty `catch {}` block is not
  acceptable.
- **User-facing messages** stay non-technical; use `EmptyState` (§6, §18) for
  "nothing to show" and a translated string for anything the user needs to
  read, not a raw error message or stack trace.
- Once real network fetching exists (§9), failed requests get the same
  `EmptyState`/error-state treatment as empty data, with a retry action if the
  underlying `swr` hook makes that trivial — don't build a bespoke
  retry system per feature.

---

## 15. Performance

- **Don't optimize speculatively.** React Compiler already removes the need
  for manual re-render memoization (§7) — profile before adding a `useMemo`,
  don't add one because a render "feels expensive."
- **Large lists**: none of the current lists (trips, countries, photos) are
  large enough to need virtualization; don't add a virtualization library
  ahead of an actual list that's slow to render.
- **Lazy loading / code splitting**: already used correctly for route-level
  views (`TimelinePage`, `StatsPage`, `Gallery`, `Lightbox` are all
  `lazy`-loaded in `main.tsx`). Extend this pattern to any new heavyweight,
  not-always-visible view rather than bundling it into the main chunk.
- **Map rendering**: MapLibre style objects are the one place `useMemo` is
  justified today (rebuild only when `theme` changes, not every render) — see
  §7. Keep marker/label rendering keyed on stable ids so MapLibre doesn't
  churn DOM nodes.
- **Images**: `CityCard` already lazy-loads background images via an
  `IntersectionObserver` and caches them through the service worker — follow
  that pattern for new image-heavy components rather than eagerly loading
  everything.
- **Bundle size**: `knip` (configured in `apps/travel-map/knip.json`, run via
  `pnpm check`) flags unused exports/files — treat its findings as real
  cleanup, not noise to silence. `vite.config.ts` does manual chunking by
  dependency group; don't fight it by importing a heavy dependency somewhere
  that pulls it into the main chunk unnecessarily.
- **Evidence over instinct**: if you're proposing a performance change,
  point at what's actually slow (a profiler flame graph, a bundle-analyzer
  entry, a measured re-render count) rather than a general sense that
  "this could be faster."

---

## 16. Testing

**Current state, stated plainly**: there is no test runner, no test
dependency, and no automated test in `apps/travel-map` or `packages/core`.
The single test file in the whole repository is
`apps/travel-map-editor/src/core/geo.test.ts`, run with
`node --experimental-strip-types` and no assertion library — not a pattern to
extend. `pnpm check` does not run any tests today.

This is a real gap, not a stylistic choice — `packages/core`'s domain
classes (`Trip`'s date/route derivation, `buildWorld`'s reference resolution)
are pure logic with no DOM dependency and are exactly the kind of code that's
cheap to test and expensive to get subtly wrong.

**When test infrastructure is added, do it minimally:**

- Vitest is the natural choice — this is already a Vite project, Vitest
  shares its config/transform pipeline, and it needs no separate bundler
  setup. Add `@testing-library/react` only once component tests are actually
  being written, not upfront.
- **Colocate tests** next to the file they test, matching the existing
  colocation convention for styles: `Trip.ts` → `Trip.test.ts`, not a
  separate `tests/`/`__tests__/` tree.
- **Priority order**, highest value first: `packages/core` domain classes and
  `buildWorld` (pure, high-consequence, zero DOM) → `apps/travel-map/src/
utils/*` pure functions (`collapseTransportChains`,
  `buildDisplaySegments` once extracted per §6) → component behavior tests
  for organisms with real interaction logic (`FilterByCountry`, `Gallery`)
  → skip pure-presentational atoms unless they have real conditional logic.
- **Test behavior, not implementation.** Assert on what a domain method
  returns or what a component renders/does in response to interaction, not
  on internal state shape or which private helper got called.
- **Mock at the real boundary.** Once `swr`/network fetching exists, mock the
  fetch layer, not the component using the hook.
- Accessibility assertions (e.g. `getByRole`) are a natural fit for
  `@testing-library/react` component tests and directly verify the §13 rules
  — prefer them over a separate a11y-testing tool until a concrete gap shows
  up that `getByRole` can't catch.
- A regression that was hard to catch by inspection (a broken reference in
  `buildWorld`, a timezone-math edge case) is a good candidate for a test
  even before broader test coverage exists — a targeted regression test is
  more valuable than waiting for "proper" coverage.

---

## 17. Comments and documentation

### JSDoc on every named declaration

Every named function, local handler, class, method, type alias, interface,
and enum gets a JSDoc block, regardless of whether it's exported. Inline
anonymous callbacks are the only exception. Components use the fuller form
with `@param` (typed, even though TS already types them — it's for the hover
tooltip) and `@returns`:

```tsx
/**
 * CityCard component
 * A photo card representing a single city visit. Lazily loads the background
 * image via an IntersectionObserver and caches it using the service worker.
 * Highlights the corresponding map marker on hover and, when clickable,
 * navigates to the photo gallery for that travel.
 * @component
 * @param {CityCardProps} props
 * @param {City} props.city - The city to display
 * @param {boolean} [props.isClickable=false] - Whether clicking opens the gallery
 * @returns {ReactNode} The city card
 */
```

Spacing rules (enforced by `eslint-plugin-jsdoc` and this repo's custom
`documentation/*` rules):

- Start with `/**` and end with `*/` on their own lines.
- One blank line before every JSDoc block, except when it starts a file or is
  the first statement immediately inside an opening block.
- One blank line between complete declarations. The JSDoc stays directly
  attached to the declaration it documents, no blank line between them.
- No blank `*` lines anywhere inside a JSDoc block.
- Keep the title, description, `@component`, every `@param`, and `@returns`
  contiguous.
- Document the props object first, then every prop in signature order, then
  the return value.
- Use `-` between a `@param`/`@property` name and its description.
- Keep JSDoc type names consistent with direct imports; never qualify with
  `React.*`.
- Every named function documents each parameter and its return value; use
  `@returns {void}` for functions that intentionally return nothing.
- Every object-shaped type/interface documents every field with `@property`.
  Unions and primitive aliases still need a description, no invented
  properties.
- Every class method and constructor documents its parameters;
  non-constructor methods also document their return value.

**A JSDoc block MUST describe what the thing actually does, not restate its
name with a period.** Lint checks structure, not content — it will happily
pass `/** Schedules . @returns {void} */` or `/** Check overflow. @returns
{void} */` (both exist in the current codebase, in `TripBrowser.tsx` and
`Gallery.tsx`). Treat a JSDoc block a reader couldn't use to understand the
function without also reading its body as incomplete, the same as a missing
one — this directly contradicts §2's "say why, not what," and passing lint
doesn't mean the comment did its job.

Pure helpers use a compact block describing what and why:

```ts
/**
 * Alpha-composites a country's translucent `hsla(…)` fill over the land tone so
 * the resulting fill is fully opaque. Translucent GeoJSON fills leak their
 * internal tile seams as faint hairlines, and opaque tones read cleaner in dark
 * mode.
 * @param {string} hsla - The translucent HSLA fill to composite
 * @param {string} baseHex - The opaque land tone to composite over
 * @returns {string} The resulting opaque fill in hex format
 */
function toOpaqueFill(hsla: string, baseHex: string): string {
  /* … */
}
```

Types/interfaces and enums get a brief block with `@property` per field/value
— see the examples in the previous revision of this document if you need the
exact shape; the pattern is unchanged.

### Inline comments explain WHY, never WHAT

Don't narrate the code — it should be clear enough to explain what it does.
Use comments for why a particular approach was taken, a non-obvious decision,
or context that isn't visible in the code itself. Never leave a comment that
just restates the code (`// set the zoom`).

### TODOs and workarounds

- A `// TODO:` comment MUST say what's missing and, where relevant, what would
  trigger doing it ("TODO: add pagination once trip count exceeds ~50") —
  not a bare `// TODO` with no context for the next reader.
- A workaround for someone else's bug (a library quirk, a browser
  inconsistency) gets a comment naming the actual constraint, not just "hack"
  — e.g. the existing `MAPLIBRE_MIN_ZOOM` comment explaining why `0` and not
  some other value, in §4's naming table.
- Remove stale comments in any file you're already editing — a comment
  describing behavior that no longer exists is worse than no comment.

---

## 18. Patterns to avoid

These are documented failure modes found in this codebase during this
review, each with where it lives — fix them opportunistically when you're
already in the file; none of them justify a standalone rewrite pass (see
§20).

- **Business/algorithmic logic inside a rendering file.**
  `Timeline.tsx` (segment-merging), `TripDetail.tsx` (`computeTripStats`),
  `PlacesBrowser.tsx` (inline country dedupe/sort) — extract to `utils/` or a
  domain-class method (§6).
- **Duplicated imperative measurement logic.** `TripBrowser.tsx` and
  `PlacesBrowser.tsx` each hand-roll a near-identical
  ResizeObserver+`requestAnimationFrame` panel-height measurement. This is a
  concrete case for a shared hook (e.g. `useMeasuredHeight`) — a real,
  observed duplication, not a speculative one.
- **Misplaced imports.** `packages/core/src/classes/Trip.ts` has two `import`
  statements after the class body (valid JS via hoisting, but violates
  `simple-import-sort/imports` and this doc's import-ordering rule) — move
  them to the top on next touch.
- **Inconsistent `use(HomeContext)` assertion.** `FloatingNav.tsx` omits the
  `!` that every other consumer uses (§8).
- **Bare-SVG click targets with no keyboard/role support.**
  `CloseButton`, `FloatingNav`'s logo, `Gallery`'s play-icon overlay (§6, §13).
- **`outline: none` with no visible-focus replacement.** `TripCard.scss`,
  `FilterByCountry.scss`, `FloatingNav.scss` (§12).
- **Hardcoded colors that duplicate an existing token by coincidence.**
  `Marker.scss`'s `#8a8ea4` (§12).
- **Inconsistent `alt` text handling.** `Lightbox.tsx` hardcodes `alt=""`
  where `Gallery.tsx` correctly uses the data's `alt` (§13).
- **Placeholder JSDoc that satisfies lint but says nothing.**
  `TripBrowser.tsx`, `TripDetail.tsx`, `Gallery.tsx` each have at least one
  (§17).
- **Half-finished scaffolding.** `atoms/BottomSheet/` (empty) and its unused
  `bottom-sheet()` mixin — finish or delete.
- **A kitchen-sink Context.** `HomeContext` bundling five concerns (§8) — not
  wrong at current scale, but don't grow it further without splitting.
- **Stale documentation paths.** `CLAUDE.md`, `AGENTS.md`, and
  `.github/copilot-instructions.md` referred to a `travel-map/` directory that
  no longer exists (the real path is `apps/travel-map/`) and didn't mention
  `apps/travel-map-editor` or `packages/core` at all — fixed alongside this
  document; if you find a doc still saying `travel-map/`, that doc is stale,
  not the code.

**Patterns explicitly checked for and NOT found** — worth stating so they
don't get "fixed" against a problem that doesn't exist: no default-export
inconsistency, no index-as-key list rendering, no circular dependencies, no
`any`, no `dangerouslySetInnerHTML`, no components defined inside another
component's render body, no generic `utils.ts`/`helpers.ts` grab-bag files,
no barrel-file sprawl (there are none at all).

---

## 19. Pull-request checklist

Before opening or approving a PR touching `apps/travel-map` or
`packages/core`:

- [ ] **Placement**: new files live where §4/§5 say they should (component
      folder co-located with its `.scss`; pure logic in `utils/` or
      `packages/core`, not inside a component file).
- [ ] **Naming**: files, components, hooks, handlers, and CSS classes follow
      §5/§6 conventions; no new generic `utils.ts`/`helpers.ts`/`types.ts`.
- [ ] **Component responsibility**: no new god-component mixing data
      transformation, DOM measurement, and rendering (§6); JSX doesn't hide
      business logic that belongs in `utils/`/`packages/core`.
- [ ] **State ownership**: state lives at the narrowest scope that works
      (§8); nothing is duplicated that could be derived; no new state added
      to `HomeContext` without considering whether it should split first.
- [ ] **Effects**: every subscribing effect has a dependency array and a
      cleanup; no effect added just to sync derivable state (§7).
- [ ] **Types**: no new `any`; casts and non-null assertions are justified;
      new object shapes are `interface`s with full `@property` JSDoc.
- [ ] **Data boundary**: new data transformation lives in `packages/core`,
      not duplicated in a component (§9).
- [ ] **Loading/empty/error states**: any new list/panel that can be empty
      uses `EmptyState`; failures don't get swallowed silently (§14).
- [ ] **Accessibility**: new interactive elements are a real `<button>` where
      possible, or `role="button"`+`tabIndex`+`isActivationKey` where not; new
      icon-only controls have `aria-label`; `outline: none` never appears
      without a visible replacement (§13).
- [ ] **Tests**: if you touched `packages/core` domain logic and test
      infrastructure exists at review time, it has a test; if it doesn't
      exist yet, this PR isn't blocked on adding it single-handedly (§16).
- [ ] **Documentation**: every new named function/component/type/class has a
      real (non-placeholder) JSDoc block (§17); stale comments in touched
      files are removed.
- [ ] `pnpm check` passes from the repository root (or `apps/travel-map`) —
      see §20 for what that covers.

---

## 20. Migration notes

Prioritized, incremental — none of this is a rewrite, and nothing here
should be done as a single sweeping PR.

**Immediate documentation corrections** (do these first, they're pure
accuracy fixes with no code risk):

- Fixed in this revision: `CLAUDE.md`, `AGENTS.md`, and
  `.github/copilot-instructions.md` referenced a `travel-map/` directory that
  no longer exists; the real path is `apps/travel-map/`, and none of them
  mentioned `apps/travel-map-editor` or `packages/core`. All three now point
  at the real layout and at running `pnpm check`/`pnpm build` from the
  repository root (the root `package.json` already defines these as
  workspace-aware scripts — `pnpm -r typecheck`, `pnpm -r lint`, plus
  `travel-map`-specific `format:check`/`knip`/`react:doctor`).
- This document's own `core/` references were updated to `packages/core` /
  `@travelmap/core`; the old `import { City, Travel } from "@/core"` example
  was wrong post-restructure — the real import is
  `from "@travelmap/core"` (a workspace package, sorted as an external, not
  aliased).

**Low-risk cleanup** (safe to do opportunistically, one file at a time, no
behavior change):

- Move the two misplaced imports in `packages/core/src/classes/Trip.ts` to
  the top of the file.
- Add the missing `!` to `FloatingNav.tsx`'s `use(HomeContext)` call.
- Rewrite the placeholder JSDoc blocks in `TripBrowser.tsx`, `TripDetail.tsx`,
  and `Gallery.tsx` to actually describe what those functions do.
- Fix `Lightbox.tsx`'s hardcoded `alt=""` to use the photo's real `alt` data,
  matching `Gallery.tsx`.
- Add the missing visible-focus replacement everywhere `outline: none` is
  used without one (`TripCard.scss`, `FilterByCountry.scss`,
  `FloatingNav.scss`).
- Reference `$darkAltTextDarker` from `Marker.scss` instead of repeating its
  hex value.
- Delete `atoms/BottomSheet/` and the unused `bottom-sheet()` mixin, or
  finish the component — don't leave it in limbo.
- Wrap `CloseButton`, `FloatingNav`'s logo, and `Gallery`'s play-icon overlay
  in real `<button type="button">` elements.

**Medium-size refactors** (worth a dedicated, reviewable PR each):

- Extract `Timeline.tsx`'s `collapseTransportChains`/`buildDisplaySegments`
  into `utils/tripDetailTimeline.ts`, leaving `Timeline.tsx` as rendering
  only.
- Move `TripDetail.tsx`'s `computeTripStats` into a method on `Trip`
  (`packages/core`), and have the component call it instead of re-deriving
  the numbers locally.
- Factor `TripBrowser.tsx`'s and `PlacesBrowser.tsx`'s duplicated
  ResizeObserver+rAF measurement into one shared hook.
- Consolidate the seven files hand-rolling glass/blur values onto the
  existing `glassmorphism-*`/`floating-card-*`/`full-panel-*` mixins.
- Add `prefers-reduced-motion` carve-outs to the `.scss` files that define
  transitions/animations but don't have one yet.

**Larger, sequenced changes** (real investment, do only when there's a
concrete trigger, not preemptively):

- Introduce Vitest + colocated tests, starting with `packages/core` (§16).
  Trigger: before the next non-trivial change to `Trip`/`buildWorld`, or
  after the next regression that a test would have caught.
- Add a lightweight runtime shape check at the `buildWorld()` boundary (§9).
  Trigger: before `data/` starts accepting content from people other than
  the current maintainer, or after the first real malformed-JSON incident.
- Split `HomeContext` by concern if it gains more fields or a measured
  re-render cost becomes visible (§8). Not a trigger today — the context is
  still small.
- Run this same audit pass against `apps/travel-map-editor`, which shares the
  stack but wasn't in scope for this revision.

**Explicitly not recommended**: migrating `apps/travel-map` from
atomic-design layers to a feature-folder (`src/features/*`) structure. The
app's real problems today are localized (a few oversized files, one
kitchen-sink context, some accessibility gaps) — a structural reorg would
touch nearly every import in the app to fix problems that don't need it, and
nothing in the current codebase shows the cross-feature coupling that a
feature-folder structure is meant to solve.
