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

`apps/travel-map` is organized by **feature ownership** with explicit
dependency direction:

- `app` owns route composition, the persistent map shell, and global hosts.
- `features` owns the UI and logic for gallery, map, navigation, places,
  stats, timeline, and trips.
- `shared` owns technical primitives and narrow cross-feature contracts.
- Dependencies flow `app → features → shared`; `shared` never imports `app`
  or `features`, and one feature never imports another feature's internals.
- The shell provides `MapInteractionContext` and `PanelContext` from
  `shared/context`. Features consume their hooks instead of importing app
  composition modules.
- **Domain model lives outside the app**, in the `@travelmap/core` workspace
  package (`packages/core`) — classes (`Trip`, `City`, `Country`, `Travel`,
  `Ferry`, `Flight`, `Color`), typings, a `schema/` module describing the raw
  JSON shapes, and `world/buildWorld.ts`, which is the single place that turns
  raw JSON into a linked object graph (see §9).
- **Routing is a persistent shell, not per-route pages.**
  `app/routing/router.tsx` defines a `createHashRouter` tree where most routes resolve to
  `element: null` (`/trips`, `/trip/:tripId`, `/places`, `/places/:filter`) —
  `MapShell` stays mounted for all of them and reads the matched path via
  `app/routing/useAppLocation.ts` (a pathname classifier, not `useParams`) to
  decide which panel to show over the map. Only genuinely separate views
  (`Timeline`, `Stats`, `Gallery`, `Lightbox`) get a real routed `element`,
  and those are lazy-loaded. **When adding a new panel that lives inside the
  map shell, follow this pattern**: add the path with `element: null`, then
  extend `useAppLocation.ts` and `MapShell` — don't give it its own
  routed page component. When adding a genuinely standalone view, follow the
  `Timeline`/`Stats` pattern (own lazy-loaded route element).
- **No client-server API.** There is no backend. All content is static JSON
  under `/data`, bundled at build time via `import.meta.glob` (see §9). `swr`
  is a dependency but is not currently used for remote data fetching in the
  audited code — if you introduce actual network requests, `swr` is the
  established choice; don't add a second data-fetching library.

The feature boundary is architectural, not a reason to add abstraction.
Features use only the `components`, `lib`, and `loaders` subfolders they need,
and imports always target concrete modules without barrels.

---

## 4. Folder structure

```
apps/travel-map/src/
  app/           Routing, persistent shell, and app-global hosts
  features/      User capabilities with owned components, loaders, and logic
  shared/        Cross-feature components, contexts, hooks, and technical logic
  data/          world.ts loads JSON and calls buildWorld() exactly once
  i18n/          Translation setup and formatting functions
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

- A component used by exactly one owner stays private to that feature or app
  composer; it does not move to `shared` merely because its name is generic.
- A helper used by exactly one component can live at the bottom of that
  component's file or as a same-folder sibling; once a second component needs
  it, promote it to the owning feature's `lib/`, `shared/lib/`, or
  `packages/core` according to its semantics.
- Pure algorithmic logic that doesn't touch React (data reshaping, grouping,
  sorting) belongs in the owning feature's `lib/` even if only one component
  currently calls it.
- Anything that operates on the raw JSON shape or the domain classes
  (`Trip`, `City`, …) belongs in `packages/core`, not duplicated in the app.

---

## 5. File and folder naming

| Thing                           | Convention                               | Example                             |
| ------------------------------- | ---------------------------------------- | ----------------------------------- |
| Primary component file & folder | `PascalCase`, folder = file name         | `Marker/Marker.tsx`                 |
| Component stylesheet            | Same base name, `.scss`                  | `Marker/Marker.scss`                |
| Component companion module      | `<Owner>.<lowercase-role>.ts`/`.tsx`     | `MapShell.context.ts`               |
| Hook file                       | `camelCase`, grouped by owner            | `shared/hooks/useResponsive.ts`     |
| Domain-named library file       | `camelCase`, names the domain            | `features/trips/lib/trips.ts`       |
| Domain class file (core)        | `PascalCase`, matches export             | `packages/core/src/classes/Trip.ts` |
| Type/typings file (core)        | `PascalCase` for a single concept        | `typings/FlightCompany.ts`          |
| Test file (see §16)             | Colocated, `<Owner>.test.ts`/`.test.tsx` | `Trip.test.ts` next to `Trip.ts`    |
| SVG asset                       | `PascalCase.svg`, imported as component  | `Calendar.svg` → `?react`           |

- `PascalCase` for anything that exports a component, class, or type as its
  primary export.
- `camelCase` for anything that exports functions/values (hooks, utils).
- **Use dot-qualified filenames for modules owned by a primary component or
  concept.** Keep the owner name first and add one lowercase responsibility:
  `MapShell.context.ts`, `MapShell.layout.tsx`, `MapShell.state.ts`,
  `Gallery.loader.ts`, and `Trip.test.ts`. This keeps companion files adjacent
  in directory listings and makes ownership visible without another folder.
  The primary component remains `MapShell.tsx`, not `MapShell.component.tsx`.
  A role suffix describes the whole module; do not stack roles such as
  `MapShell.context.types.ts` or use vague roles such as `.helpers.ts`.
- A standalone module that is not subordinate to an owner keeps its normal
  domain name (`trips.ts`, `useResponsive.ts`). Do not add a dot suffix merely
  to imitate the pattern.
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
  {showDates && travel?.sDate ? <DateRow … /> : null}
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
different jobs. Trip-detail timeline transformations belong in
`features/trips/lib/tripDetailTimeline.ts`, next to the component that renders
the result, not inside it. `features/trips/components/TripDetail/TripDetail.tsx`'s
`computeTripStats` is the same
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
  it into `selectedTrip` through `useMapInteraction`, is not this
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
   feature owner. `MapInteractionContext` coordinates map viewport, hover,
   and selected trip; `PanelContext` owns route-panel visibility. Both are
   defined under `shared/context`, provided once by `MapShell`, and consumed
   through `useMapInteraction` or `usePanel`. Context hooks MUST throw a clear
   error outside their provider; consumers never import a raw context or use
   non-null assertions. Split a new contract by actual consumer set rather
   than adding unrelated fields to either existing value.

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
4. `apps/travel-map/src/data/world.ts` calls `buildWorld()` once and exports
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
  domain class, the owning feature's `lib/`, or `shared/lib/`, not inline JSX.
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
    /* … */
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
  value exists. Shared context hooks enforce their provider invariant by
  throwing, so feature consumers do not assert context values. Don't use `!`
  to silence a case that could actually be null; narrow it instead.
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
import "./CityCard.scss";
import "maplibre-gl/dist/maplibre-gl.css";

import { City, Travel } from "@travelmap/core";
import { ReactNode, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

import CalendarIcon from "@/assets/icons/Calendar.svg?react";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { CityCard } from "../CityCard/CityCard";
```

The groups are, in order: side-effect imports, external/workspace packages,
`@/` aliases, then relative imports. Do not label groups with comments; the
blank lines and import paths make them self-evident.

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
  `tsconfig.json` and `vite.config.ts`) for `shared`, `data`, `i18n`, and
  assets. Use relative imports inside one feature. App composition may import
  concrete feature entry components through `@/features/*`; feature modules
  may not import that alias or another feature's private path.
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
  dependency direction intentional so that stays true: `packages/core` never
  imports from either app; `shared` never imports `app` or `features`; and a
  feature never imports another feature's internals.

### Vertical spacing

Vertical whitespace communicates structure and MUST be deterministic:

- Use exactly one blank line between import groups and no blank lines within a
  group. Leave exactly one blank line after the final import.
- Use exactly one blank line between complete top-level declarations. A JSDoc
  block belongs to its declaration, so there is no blank line between the
  closing `*/` and the declaration.
- Never put a blank line immediately after an opening `{`, `(`, or `[` or
  immediately before its closing counterpart merely for visual padding.
- Never use two or more consecutive blank lines.
- Inside a function, keep statements that perform one step contiguous. Use one
  blank line when responsibility changes: setup to derived data, derived data
  to effects, effects to handlers, or handlers to the returned JSX.
- Keep consecutive hooks of the same kind together. Separate a group of hooks
  from derived values or handler declarations with one blank line. Do not put a
  blank line between every hook.
- Keep related guard clauses contiguous. Add one blank line after the final
  guard before the main path. Do not force a blank line before a `return` when
  the function consists only of that return or when the return is the direct
  body of a branch.
- In object and array literals, do not insert blank lines between ordinary
  members. If a literal needs visual sections, that is usually a signal to
  extract a named value rather than format an implicit grouping.
- In JSX, use one blank line only between major sibling regions of a large
  component. Never add blank lines as the first or last child, and do not space
  every sibling element apart.
- In SCSS, keep declarations contiguous, then insert one blank line before the
  first nested selector, modifier, element, or at-rule. Put exactly one blank
  line between sibling BEM branches. Do not insert blank lines between related
  declarations.
- Formatting tools establish the baseline, but passing Prettier does not excuse
  arbitrary logical spacing that violates these rules.

---

## 12. Styling (SCSS)

- **BEM is mandatory for every authored UI class selector.** Use a kebab-case
  `.block`, `.block__element`, and `.block--modifier`, nested with Sass `&`:

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

  Apply these constraints everywhere, including pages, layouts, loading states,
  and one-off controls:

  - One owning component or cohesive feature block per component stylesheet by
    default. A `MapShell` stylesheet uses `.map-shell`; a `FallbackPage`
    stylesheet uses `.fallback-page`.
  - Generic classes such as `.centered`, `.active`, `.dark`, `.loading`, or
    `.container` are forbidden in authored UI. Name the ownership explicitly,
    such as `.map-shell__loading` or `.trip-card--active`.
  - A modifier never replaces its base class in JSX. Render
    `class="trip-card trip-card--selected"`, not only
    `class="trip-card--selected"`.
  - Elements belong directly to the block in naming, even when markup is
    nested. Use `.trip-card__title`, not
    `.trip-card__content__header__title`.
  - Never chain an element after a modifier
    (`block__element--modifier__sub`). Restructure it as a direct element such
    as `block__select-all-icon`, with a separate modifier where state is needed.
  - Use a modifier for visual/component state instead of ad-hoc `is-*` or
    utility classes.
  - Use `&__element` and `&--modifier` within the block. Keep block-specific
    media queries inside the block so the parent selector remains visible.
  - Do not increase specificity by writing `.block .block__element` unless a
    modifier or external integration genuinely scopes the element. The element
    selector is independently meaningful.
  - Styling owned child markup by tag (`p`, `svg path`) is allowed only when the
    child cannot receive a class or is deliberately part of the element's
    private markup. Prefer a BEM class whenever the markup is controlled here.

  Global platform selectors (`html`, `body`, `#root`, `:root`, pseudo-elements),
  vendor selectors (`::-webkit-scrollbar`), and third-party classes that cannot
  be renamed (`.react-tooltip`) are the only BEM exceptions. Scope third-party
  selectors beneath the owning BEM block whenever possible. Existing IDs used
  as integration hooks are tolerated, but new authored UI styling MUST use BEM
  classes.

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
  `.map-shell--dark` and `.map-shell--light` modifiers, always provide both.

  ```scss
  .map-shell {
    &--dark {
      .map__canvas {
        background: v.$darkBackground;
      }
    }

    &--light {
      .map__canvas {
        background: v.$lightBackground;
      }
    }
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
  (`MapShell.scss`, `TripDetailHero.scss`, `TooltipMap.scss`, `Map.scss`,
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
  (`shared/lib/keyboard`), never a hand-rolled key check:

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
  `buildWorld` (pure, high-consequence, zero DOM) → feature/shared `lib/`
  pure functions (`collapseTransportChains`,
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

- Multiline JSDoc starts with `/**` and ends with `*/` on their own lines.
- A simple primitive, literal-union, tuple, or direct alias type MUST use a
  mandatory single-line JSDoc immediately above it. The single-line form is
  reserved for aliases that need only one sentence and have no fields to
  document:

  ```ts
  /** The panel currently displayed beside the map. */
  export type ActiveView = "trips" | "places" | null;
  ```

  Do not expand a simple alias into a ceremonial multiline block. Object-shaped
  aliases, interfaces, conditional/mapped types that need explanation, and all
  declarations with tags continue to use multiline JSDoc.

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
  Unions and primitive aliases use the mandatory single-line form above, with
  no invented properties.
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

Object-shaped types/interfaces and enums get a block with `@property` per
field/value. Simple aliases use the mandatory one-line JSDoc form above.

### Inline comments explain WHY, never WHAT

Don't narrate the code — it should be clear enough to explain what it does.
Use comments for why a particular approach was taken, a non-obvious decision,
or context that isn't visible in the code itself.

Human-authored `//` line comments are forbidden, both on their own line and
after a statement. Trailing comments of any kind are forbidden: a comment never
shares a line with code. When rationale is genuinely necessary, put a block
comment on its own line immediately before the smallest relevant statement:

```ts
/* MapLibre renders internal tile seams when this fill remains translucent. */
const fill = toOpaqueFill(color, landColor);
```

Do not use block comments to preserve narration that should be deleted. The
comment above is justified by a constraint invisible in the statement; a
comment such as `/* Set the map fill. */` is forbidden because it repeats the
code.

The only `//` exceptions are syntax consumed by tooling and unavailable in
another form: `// @ts-expect-error` with its required reason,
`// eslint-disable-next-line` with the narrow rule and reason, TypeScript
triple-slash directives, and generated/upstream files. Tooling directives must
sit on their own line directly above the affected code and are not permission
for prose line comments.

### TODOs and workarounds

- A TODO uses an own-line block comment and MUST say what's missing and, where
  relevant, what would trigger doing it:

  ```ts
  /* TODO: Add pagination once trip count exceeds approximately 50. */
  const visibleTrips = trips;
  ```

  A bare TODO with no context for the next reader is forbidden.

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
  Feature components should not absorb calculations that belong in their
  feature `lib/`, `shared/lib/`, or a domain-class method (§6).
- **Duplicated imperative measurement logic.** `TripBrowser.tsx` and
  `PlacesBrowser.tsx` each hand-roll a near-identical
  ResizeObserver+`requestAnimationFrame` panel-height measurement. This is a
  concrete case for a shared hook (e.g. `useMeasuredHeight`) — a real,
  observed duplication, not a speculative one.
- **Misplaced imports.** `packages/core/src/classes/Trip.ts` has two `import`
  statements after the class body (valid JS via hoisting, but violates
  `simple-import-sort/imports` and this doc's import-ordering rule) — move
  them to the top on next touch.
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
- **A kitchen-sink context.** Do not recombine the narrow
  `MapInteractionContext` and `PanelContext` contracts into one shell context.
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
      folder co-located with its `.scss`; pure logic in the owning `lib/`,
      `shared/lib`, or `packages/core`, not inside a component file).
- [ ] **Naming**: files, components, hooks, handlers, and CSS classes follow
      §5/§6 conventions; companion modules use dot-qualified owner names; no
      new generic `utils.ts`/`helpers.ts`/`types.ts`.
- [ ] **BEM**: every authored UI class belongs to a named BEM block; state uses
      modifiers; no generic utility/state class or chained element hierarchy
      was introduced (§12).
- [ ] **Vertical spacing**: import groups, declarations, function phases, JSX,
      and SCSS branches follow §11; there are no doubled or decorative blank
      lines.
- [ ] **Component responsibility**: no new god-component mixing data
      transformation, DOM measurement, and rendering (§6); JSX doesn't hide
      business logic that belongs in a `lib/` module or `packages/core`.
- [ ] **State ownership**: state lives at the narrowest scope that works
      (§8); nothing is duplicated that could be derived; shared state uses a
      narrow contract rather than growing an unrelated context.
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
      real (non-placeholder) JSDoc (§17); simple aliases use mandatory one-line
      JSDoc; stale comments in touched files are removed; no human-authored
      `//` or trailing comment remains.
- [ ] `pnpm check` passes from the repository root (or `apps/travel-map`) —
      see §20 for what that covers.

---

## 20. Migration notes

The public app's feature-based migration is defined by
`FEATURE_BASED_REFACTOR_MIGRATION_GUIDE.md`. New work must preserve its final
dependency boundaries; the remaining items below are independent follow-up
work, not reasons to weaken feature ownership.

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
- Rewrite the placeholder JSDoc blocks in `TripBrowser.tsx`, `TripDetail.tsx`,
  and `Gallery.tsx` to actually describe what those functions do.
- Fix `Lightbox.tsx`'s hardcoded `alt=""` to use the photo's real `alt` data,
  matching `Gallery.tsx`.
- Add the missing visible-focus replacement everywhere `outline: none` is
  used without one (`TripCard.scss`, `FilterByCountry.scss`,
  `FloatingNav.scss`).
- Reference `$darkAltTextDarker` from `Marker.scss` instead of repeating its
  hex value.
- Wrap `CloseButton`, `FloatingNav`'s logo, and `Gallery`'s play-icon overlay
  in real `<button type="button">` elements.

**Medium-size refactors** (worth a dedicated, reviewable PR each):

- Keep trip-detail timeline calculations in
  `features/trips/lib/tripDetailTimeline.ts`, leaving `TripTimeline.tsx` as
  rendering only.
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
- Keep map interaction and panel visibility in their existing narrow shared
  contexts; add another contract only for a concrete cross-feature consumer
  set (§8).
- Run this same audit pass against `apps/travel-map-editor`, which shares the
  stack but wasn't in scope for this revision.

The feature-folder migration is complete when the definition of done in the
migration guide passes. Do not reintroduce the legacy `components`, `hooks`,
or `utils` roots.
