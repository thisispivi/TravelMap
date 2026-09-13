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
docker/                Nginx image and Compose configuration for the built site
docs/                  The user-facing guide
```

Sections 6–16 (React, hooks, state, data boundaries, styling, accessibility,
performance, testing) apply wherever React or TypeScript is authored: both apps
and `packages/core`. The universal principles (§2, §17, §18) apply everywhere,
including `scripts/uploader`. Where `apps/travel-map-editor` differs is recorded
in §20's known gaps rather than left to guesswork — its feature boundaries are
not yet enforced, so read them as a naming convention.

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
- The shell provides `MapInteractionContext`, `PanelContext`, and
  `AppRouteContext` from `shared/context`. Features consume their hooks instead
  of importing app composition modules. Lint enforces this direction; see §20.
- `data` owns everything derived from the dataset itself: `world.ts` builds the
  graph, `logos.ts` resolves bundled logo files, and `companies.ts` joins an
  operator id to the name and logo the site configuration gives it. A feature
  reads `data`; `data` reads only static JSON and `@travelmap/core`.
- **Domain model lives outside the app**, in the `@travelmap/core` workspace
  package (`packages/core`) — classes (`Trip`, `City`, `Country`, `Travel`,
  `Ferry`, `Flight`, `Color`), typings, a `schema/` module holding the Zod
  contracts for the authored JSON, and `world/buildWorld.ts`, the single place
  that validates raw JSON and turns it into a linked object graph (see §9).
- **Routing is a persistent shell, not per-route pages.**
  `app/routing/router.tsx` defines a `createHashRouter` tree where most routes
  resolve to `element: null` (`/trips`, `/trip/:tripId`, `/places`,
  `/places/:filter`) — `MapShell` stays mounted for all of them and reads the
  matched path through `app/routing/useAppLocation.ts` (a pathname classifier,
  not `useParams`) to decide which panel to show over the map. Only genuinely
  separate views (`Timeline`, `Stats`, `Gallery`, `Lightbox`) get a real routed
  `element`, and those are lazy-loaded. **When adding a new panel that lives
  inside the map shell, follow this pattern**: add the path with
  `element: null`, then extend `useAppLocation.ts` and `MapShell` — don't give it
  its own routed page component. When adding a genuinely standalone view, follow the
  `Timeline`/`Stats` pattern (own lazy-loaded route element).
- **No client-server API.** There is no backend. All content is static JSON
  under `data/`, bundled at build time via `import.meta.glob` (see §9). The only
  runtime requests are photo loads, which go through `swr` and Cache Storage in
  `features/places/lib/useImageCache.ts`. If you add application-level
  fetching, use `swr`; do not add a second data-fetching library.

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
  typings/       Continent, Currency, Localized, Travel
  schema/        Zod contracts for the authored JSON, and the types inferred
                 from them
  validation/    Dataset and trip checks the editor reports to the author
  world/         buildWorld.ts (the graph builder), date.ts, distance.ts,
                 derive.ts, media.ts
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
| Component companion module      | `<Owner>.<lowercase-role>.ts`/`.tsx`     | `MapShell.state.ts`                 |
| Hook file                       | `camelCase`, grouped by owner            | `shared/hooks/useResponsive.ts`     |
| Domain-named library file       | `camelCase`, names the domain            | `features/trips/lib/trips.ts`       |
| Domain class file (core)        | `PascalCase`, matches export             | `packages/core/src/classes/Trip.ts` |
| Type/typings file (core)        | `PascalCase` for a single concept        | `typings/Continent.ts`              |
| Test file (see §16)             | Colocated, `<Owner>.test.ts`/`.test.tsx` | `Trip.test.ts` next to `Trip.ts`    |
| SVG asset                       | `PascalCase.svg`, imported as component  | `Calendar.svg` → `?react`           |

- `PascalCase` for anything that exports a component, class, or type as its
  primary export.
- `camelCase` for anything that exports functions/values (hooks, utils).
- **Use dot-qualified filenames for modules owned by a primary component or
  concept.** Keep the owner name first and add one lowercase responsibility:
  `MapShell.layout.tsx`, `MapShell.state.ts`, `Panel.context.ts`,
  `Gallery.loader.ts`, and `Trip.test.ts`. This keeps companion files adjacent
  in directory listings and makes ownership visible without another folder.
  The primary component remains `MapShell.tsx`, not `MapShell.component.tsx`.
  A role suffix describes the whole module; do not stack roles such as
  `Panel.context.types.ts` or use vague roles such as `.helpers.ts`.
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
  when they group a concern (`hooks/`, `components/`, `lib/`).

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
- **Sub-components used by exactly one component** MUST live in that
  component's file. Prefer putting them above their consumer (as `MapLabels`
  precedes `MapLayers` in `features/map/components/Map/MapLayers.tsx`, and
  `CompanyRows` precedes `CompaniesCard`); one placed below is a style nit, not
  a correctness issue — fix it if you are already editing that file. A
  sub-component a second component needs gets its own file, which is why
  `MapMarkers` and the map tooltip live in
  `features/map/components/Map/MapMarkers.tsx` and
  `features/map/components/Tooltip/TooltipMap.tsx` rather than inside
  `Map.tsx`. Never define a component inside another component's render body —
  `react/no-unstable-nested-components` forbids it.
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

- **Conditional class names** go through the `classNames` util
  (`shared/lib/classNames.ts`), not a template literal, for **any** conditional
  class — including a single condition, and including a `className` prop merged
  into a base class. A template literal is only correct where the class _name_
  itself is computed and no condition is involved, as in
  `` `timeline-card--${side}` ``.
- **List rendering** uses a stable, domain-derived key (a city name, trip id)
  — never the array index. The codebase already does this consistently;
  don't regress it.
- **JSX props are sorted alphabetically**, elements self-close when empty,
  every `<button>` declares `type="button"`, fragments use `<>` shorthand.
- **Icon-only actionable elements**: if it behaves like a button, make it a
  real `<button type="button">` wrapping the icon — that gets you focusability,
  keyboard activation, and a default accessible role for free, which is less
  code than reimplementing them. `CloseButton`, `FloatingNav`'s logo, and
  `Gallery`'s play overlay are the reference: a real button with an
  `aria-label` and an `aria-hidden` icon inside. Reserve the `role="button"` +
  `tabIndex={0}` + `isActivationKey` pattern (§13) for elements with a real
  reason not to be a `<button>` — `Marker` and `CityCard`, which are
  non-rectangular map and photo surfaces with their own layout and hover
  semantics.

### When to split a component, when to leave it together

Split when a file mixes concerns that don't need to be adjacent to work: pure
data transformation, imperative DOM measurement, and JSX rendering are three
different jobs. Trip-detail timeline transformations live in
`features/trips/lib/tripDetailTimeline.ts`, next to the component that renders
the result rather than inside it; `TripTimeline.tsx` only renders. Presentation
data that comes from the dataset — an operator's name and logo, for instance —
belongs in `data/`, where `resolveCompany` owns it, so no component keeps its
own table of names that a fork cannot change.

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
- **One responsibility per hook.** `app/routing/useAppLocation.ts` (classifies
  the current pathname into the flags and ids the shell needs) is at the edge of
  this — it is one job, "what does this URL mean", with a wide surface rather
  than ten jobs, so it stands as it is; do not add unrelated concerns to it.
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

- **The "latest ref" effect is an accepted idiom, not a lint dodge.** A
  dependency-array-free `useEffect(() => { xRef.current = x; })` keeps a ref
  pointing at the latest closure for a callback that cannot itself be an effect
  dependency — `useResizeMeasurement` and `MapTooltip` do this. It is
  intentional: recognise it rather than "fixing" it with a dependency array that
  would break it. Panel height measurement in particular is already factored
  into `shared/hooks/useResizeMeasurement.ts`; use that hook rather than
  hand-rolling another `ResizeObserver` plus `requestAnimationFrame` pair.
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
- **Data-fetching hooks**: `useCachedImageSource` is the only one, because there
  is no backend (§9). A new one takes the same shape as every other hook here —
  `useX` returning named fields — and the fetching itself lives in the owning
  `lib/`, not in the component.

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
   feature owner. There are three, each a narrow contract:
   `MapInteractionContext` coordinates map viewport, hover, and selected trip;
   `PanelContext` owns route-panel visibility; `AppRouteContext` publishes what
   the current route means so features need not re-classify the pathname. All
   three live under `shared/context`, are provided once by `MapShell`, and are
   consumed through their hook. Context hooks MUST throw a clear error outside
   their provider; consumers never import a raw context or use a non-null
   assertion. Split a new contract by its actual consumer set rather than
   adding unrelated fields to an existing one.

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

## 9. Data boundaries and runtime validation

There is no backend and no application API. Every piece of content is static
JSON under `data/`, compiled into the bundle at build time. The only runtime
network traffic is image loading: `features/places/lib/useImageCache.ts` fetches
photos through `swr` and Cache Storage.

**How data flows:**

1. `apps/travel-map/src/data/world.ts` collects the raw JSON with
   `import.meta.glob(..., { eager: true })` — no `fetch`, no loading state,
   because the data is part of the build.
2. `packages/core/src/schema/index.ts` owns the Zod contracts for every
   authored shape (`CountryJsonSchema`, `CityJsonSchema`, `TripJsonSchema`,
   `ImageSchema`, `SiteConfigSchema`, `WorldSourcesSchema`) and the TypeScript
   types are inferred from them.
3. `packages/core/src/world/buildWorld.ts` is the dataset's **single trust
   boundary**. It takes `unknown`, parses the whole source object with
   `WorldSourcesSchema`, then links id references (throwing through
   `requireReference()` when one does not resolve) and constructs the domain
   classes.
4. `world.ts` calls `buildWorld()` once and exports the results
   (`visitedTrips`, `visitedCities`, `visitedCountries`, `takenFlights`,
   `takenFerries`, `siteConfig`) as module-level constants.

### Validation policy

- **Validate at trust boundaries, once.** The boundaries are: `buildWorld()`
  for the dataset, the editor's `vite/` middleware for request bodies,
  `shared/lib/httpResponse.ts` for responses the editor reads back,
  `shared/lib/storage.ts` for `localStorage`, `shared/lib/env.ts` for
  build-time environment values, and `vite.config.ts` for the site-branding
  block it reads off disk. Data that has passed one of those is trusted
  downstream; do not re-parse it.
- **Zod is the validation library.** Do not hand-roll `typeof` chains for a
  shape a schema can describe, and do not add a second validation library.
- **The schema owns the type.** Where a Zod schema is the authoritative runtime
  contract, infer the TypeScript type from it (`z.infer`) instead of declaring a
  parallel `interface` that can drift. Purely internal compile-time types that
  never cross a boundary stay ordinary TypeScript.
- **Never cast untrusted data.** `value as SomeType` on JSON, a response body,
  a stored value, or an environment variable is a review failure; parse it.
- **Object schemas are strict.** Authored documents use `z.strictObject` so a
  typo is reported instead of silently dropped. Reach for `z.looseObject` only
  when a document legitimately carries fields this code does not own, and say
  why.
- **Validation is not authorization.** A payload passing its schema says
  nothing about whether the operation is allowed. The editor's write endpoints
  validate the body _and_ separately confirm the request is loopback-local and
  that the resolved path stays inside `data/`.
- **Do not wrap trusted internals in schemas.** A domain object built by
  `buildWorld` needs no further parsing, and adding one hides where the real
  boundary is.

### Rules

- MUST keep transformation of raw JSON into domain objects inside
  `packages/core`. Do not add a second, component-local parser for data
  `buildWorld` already produces.
- MUST NOT fetch or transform data inside a component body. A derived slice of
  the world belongs on a domain class, in the owning feature's `lib/`, in
  `shared/lib/`, or in `data/` when it joins dataset documents together.
- If application-level network fetching is introduced, use `swr` — it is
  already a dependency and already used for images. Loading, empty, and error
  states use the existing `EmptyState` and `Loading` components rather than a
  new set per feature.

---

## 10. TypeScript conventions

- **`interface`** for object shapes (props, data records, domain typings);
  **`type`** for unions and aliases.

  ```ts
  /** A transport operator id, resolved against the site configuration. */
  export type CompanyId = string;

  interface FlightLeg {
    company?: CompanyId;
    number?: string; /* … */
  }
  ```

  When the shape also crosses a runtime boundary, the Zod schema is the
  declaration and the type is inferred from it (§9) rather than written twice.

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
- **Enums vs. union types**: `enum` is used for closed, JSDoc-documented
  vocabularies the dataset cannot extend (`Continent`, `Currency`,
  `TravelType`). Everything a fork can extend is a plain string or a union
  inferred from its schema — transport operators in particular are a
  `CompanyId` (a validated non-empty string resolved against
  `SiteConfig.companies`), not an enum, because a fork must be able to record
  an airline this repository has never heard of. Prefer a union unless the
  enum's namespacing is genuinely earning the extra ceremony.
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
  hooks, utils, or classes — keep it that way. (`lazy()`
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
- **There are no circular dependencies** — keep the
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

- **`prefers-reduced-motion` is honoured globally.** `styles/_global.scss`
  gives every element a transition, so the carve-out lives beside it and
  neutralises animation and transition durations for the whole app — the editor
  included, since it imports the same file. Do not add a per-component
  `@media (prefers-reduced-motion: reduce)` block: a local carve-out would have
  to be repeated in every stylesheet and would silently miss the next one. Add a
  local block only to suppress something the global rule cannot reach, such as a
  JS-driven animation, and say so in a comment.

- **Design tokens live in `_variables.scss`.** Before hardcoding a colour,
  check whether an existing token already is that value; a hex that happens to
  equal a token is a duplicate that will drift when the token changes. Values
  JavaScript needs (route and transport colours) are mirrored in
  `_variables.module.scss` and imported as a module:
  `import variables from "@/styles/_variables.module.scss"`.
- **Reuse the glass/blur mixins** (`glassmorphism-dark/light`,
  `floating-card-dark/light`, `full-panel-dark/light` in `_mixins.scss`)
  instead of hand-rolling a `backdrop-filter` per file. Twelve stylesheets use
  the mixins; `Map.scss`, `MapTooltip.scss`, `CityCard.scss`, `Card.scss`,
  `TimelineTrack.scss`, `TripDetail.scss`, and `TripDetailHero.scss` still pick
  their own radius by hand. Converge new work on the mixins and convert one of
  those files when you are already editing it.
- `outline: none` MUST always be paired with a visible focus replacement
  (scale, ring, z-lift) in the same rule or file — `m.focus-ring()` is the
  usual answer. The one remaining exception is
  `charts/BarChartPopulation.scss`, which clears the outline ApexCharts puts on
  its own non-interactive SVG root; if you add such a rule, scope it to the
  third-party element and say why.

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
  panels like `FilterByCountry`): give the overlay `role="dialog"` and
  `aria-modal="true"` when it takes over the screen, support `Escape` to close
  (`FilterByCountry` and the pinned map tooltip in `Map.tsx` both do), and
  return focus to the trigger element on close.
- **Image alt text** comes from the data: `photo.alt ?? ""`, never a hardcoded
  `alt=""` that discards what the dataset provides. A decorative image — an
  operator logo beside its own name, say — is the opposite case and takes
  `alt=""` plus `aria-hidden="true"`.
- Don't leave half-built accessibility scaffolding behind. An unused mixin or an
  empty component folder reads as implemented when it is not, which is worse
  than nothing there — finish it or delete it.

---

## 14. Error handling

- **Expected errors** fail loudly where they originate. A malformed document or
  an unresolved id throws out of `buildWorld()` — `WorldSourcesSchema` names the
  field, `requireReference()` names the referencing document — and a route that
  does not match reaches `FallbackPage`, wired as the router's `errorElement` in
  `app/routing/router.tsx`. This is authored data, not user input: there is no
  case where quietly ignoring a bad reference is right.
- **Unexpected runtime errors** in the render tree should be caught by an
  error boundary at a sensible level. The router's `errorElement` covers
  routing-time failures; there is no component-level boundary. If you add UI that
  can throw during render from unpredictable data, wrap it in a boundary rather
  than letting the whole app white-screen.
- **Never swallow a caught error silently.** If you catch something, either
  handle it meaningfully or don't catch it — an empty `catch {}` block is not
  acceptable.
- **User-facing messages** stay non-technical; use `EmptyState` (§6, §18) for
  "nothing to show" and a translated string for anything the user needs to
  read, not a raw error message or stack trace.
- **A failed image load falls back rather than failing the view**:
  `useImageCache` records the source as un-cacheable and hands back the original
  URL. Any future request follows the same shape — the existing
  `EmptyState`/`Loading` components, plus `swr`'s retry if it is free — rather
  than a bespoke retry system per feature.

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
- **Images**: `CityCard` lazy-loads its background through an
  `IntersectionObserver` and `useCachedImageSource`, which keeps decoded blobs in
  Cache Storage and reuses one object URL per photo. Follow that pattern for new
  image-heavy components rather than loading everything eagerly.
- **Bundle size**: `knip` (one config per project, all run by `pnpm check`)
  flags unused files, exports, types, and dependencies — treat its findings as
  real cleanup, not noise to silence. `vite.config.ts` does manual chunking by
  dependency group; don't fight it by importing a heavy dependency somewhere
  that pulls it into the main chunk unnecessarily.
- **Evidence over instinct**: if you're proposing a performance change,
  point at what's actually slow (a profiler flame graph, a bundle-analyzer
  entry, a measured re-render count) rather than a general sense that
  "this could be faster."

---

## 16. Testing

**Vitest, everywhere, colocated.** All three workspace projects run `vitest run`
through `pnpm test`, which `pnpm check` includes. Test files are discovered by
glob, so a new `*.test.ts` runs without touching any script.

- **Colocate** the test next to what it tests, matching the stylesheet
  convention: `Trip.ts` → `Trip.test.ts`, never a separate `tests/` or
  `__tests__/` tree.
- **Name the behaviour, not the function.** `it("rejects a date that does not
exist instead of rolling it over")` earns its place; `it("works")` does not.
  A `describe` names the unit, an `it` names one guarantee.
- **Priority order**, highest value first: `packages/core` schemas, `buildWorld`,
  and date maths (pure, high-consequence, no DOM) → the editor's parsers and
  path derivation, where malformed input is the normal case → feature and shared
  `lib/` pure functions → component behaviour for components with real
  interaction logic. Skip presentational components with no conditional logic.
- **Test behaviour, not implementation.** Assert on what a function returns or
  what a component renders and does, never on internal state shape or which
  private helper ran.
- **Schemas get their accept and reject cases**, not one test per constraint:
  the shapes real data takes, the malformed shapes a hand edit produces,
  boundary values, and anything security-relevant. `schema.test.ts` is the
  reference.
- **Prefer a stub over an environment.** The `localStorage` test installs a
  three-method in-memory stand-in rather than pulling in jsdom; reach for
  `@testing-library/react` only when component tests actually arrive, and then
  assert through `getByRole` so the §13 rules are covered at the same time.
- **Mock at the real boundary** — the fetch layer, not the component that uses
  the hook wrapping it.
- **A bug fix lands with a regression test** whenever the bug was hard to catch
  by inspection: an unresolved reference in `buildWorld`, a timezone edge case, a
  schema that accepted something it should not.
- No `.only`, no skipped suites, no test without an assertion.

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

Failure modes this codebase has actually produced. Fix one opportunistically
when you are already in the file; none justifies a standalone rewrite pass.

- **A second copy of a domain fact.** Operator display names once lived both in
  `site.config.json` and in a hardcoded `Record` inside the trip timeline, so a
  fork's own airline rendered correctly in statistics and as a blank in trip
  details. Transport modes were listed in `packages/core` and again in the
  editor. A vocabulary the dataset owns has exactly one home; derive from it
  (`TransportModeSchema.options`) rather than retyping it.
- **A TypeScript type written twice: once as an `interface`, once as a Zod
  schema.** They drift. Infer the type from the schema (§9).
- **Casting external data into a narrower type.** `step.flight.company as
FlightCompany` looked like typing and was actually an unchecked assertion over
  authored JSON. Validate in the schema, or widen the type to what the data
  really is.
- **Validating the same value twice.** The app used to parse every document with
  its schema and then hand the results to `buildWorld`, which parsed them all
  again. One boundary, one parse (§9).
- **A helper re-declared per call site.** `sendJson` existed four times across
  the editor's Vite middleware. Second occurrence of an identical helper is the
  signal to move it — `vite/http.ts` is where those live.
- **Business or algorithmic logic inside a rendering file.** Calculations belong
  in the owning `lib/`, in `shared/lib/`, in `data/`, or on a domain class (§6).
- **Line comments.** `documentation/no-line-comments` and `no-inline-comments`
  reject them; rationale is an own-line block comment (§17).
- **Placeholder JSDoc that satisfies lint and says nothing.** "Represents a nav
  tab." above `type NavTab` is not documentation. Lint checks structure, you
  check content.
- **Per-file copies of a global concern.** A `prefers-reduced-motion` carve-out
  in thirty stylesheets is thirty places to forget; it lives once in
  `_global.scss` (§12).
- **A kitchen-sink context.** Do not recombine `MapInteractionContext`,
  `PanelContext`, and `AppRouteContext` into one shell context.
- **Exporting something only its own module uses.** `knip` runs in `pnpm check`
  for all three projects and will catch it; treat its findings as work, not
  noise.

**Checked for and not present** — so nobody "fixes" a problem that does not
exist: no default-export inconsistency, no index-as-key list rendering, no
circular dependencies, no `any`, no `dangerouslySetInnerHTML`, no component
defined inside another component's render body, no generic
`utils.ts`/`helpers.ts` grab-bag, and no barrel files anywhere.

---

## 19. Pull-request checklist

Before opening or approving a PR. `pnpm check` covers the mechanical half
(§20); these are the things it cannot see.

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
- [ ] **Types**: no new `any`; every cast and non-null assertion carries a
      reason; new object shapes are `interface`s with full `@property` JSDoc.
- [ ] **Data boundary**: new untrusted input is parsed with a Zod schema at its
      boundary and not re-parsed downstream; the TypeScript type is inferred from
      the schema rather than declared beside it; no `as` on external data;
      dataset transformation stays in `packages/core` or `data/` (§9).
- [ ] **Loading/empty/error states**: any new list/panel that can be empty
      uses `EmptyState`; failures don't get swallowed silently (§14).
- [ ] **Accessibility**: new interactive elements are a real `<button>` where
      possible, or `role="button"`+`tabIndex`+`isActivationKey` where not; new
      icon-only controls have `aria-label`; `outline: none` never appears
      without a visible replacement (§13).
- [ ] **Tests**: new or changed domain logic, parsing, and schemas have
      behaviour-named tests; a fixed bug that inspection would have missed has a
      regression test; no `.only` or skipped suite (§16).
- [ ] **Duplication**: no domain fact, vocabulary, or helper now exists in two
      places (§18).
- [ ] **Documentation**: every new named function/component/type/class has a
      real (non-placeholder) JSDoc (§17); simple aliases use mandatory one-line
      JSDoc; stale comments in touched files are removed; no human-authored
      `//` or trailing comment remains.
- [ ] `pnpm check` and, for anything touching behaviour, configuration,
      routing, or output, `pnpm build` pass from the repository root — see §20
      for what each covers.

---

## 20. Automated enforcement, and what is left by hand

Prefer a check over a paragraph. This is what currently runs, so you know what
review still has to catch.

`pnpm check` from the repository root runs, across all three projects:

| Check        | Command             | Enforces                                                       |
| ------------ | ------------------- | -------------------------------------------------------------- |
| Types        | `pnpm typecheck`    | `strict`, no unused locals or parameters, no fallthrough cases |
| Lint         | `pnpm lint`         | The rules below, at zero warnings                              |
| Formatting   | `pnpm format:check` | Prettier                                                       |
| Tests        | `pnpm test`         | Vitest in core, both apps (§16)                                |
| Dead code    | `pnpm knip`         | Unused files, exports, types, and dependencies                 |
| React health | `react:doctor`      | Hook, accessibility, and bundle diagnostics                    |

`pnpm build` additionally verifies production output. `.husky/pre-commit` runs
lint-staged over changed files, falling back to a repository-wide lint and
format check once a change is too wide to fit on one command line; `.husky/pre-push` runs the full suite plus
`python -m compileall -q scripts/uploader`; `.github/workflows/ci.yml` repeats
all of it and adds `pnpm audit`.

**Rules from this document that lint now enforces:**

- JSDoc presence, structure, spacing, `@param`/`@property`/`@returns`
  completeness, and the component-block format (`jsdoc/*`, `documentation/*`).
- No line comments and no comment sharing a line with code
  (`documentation/no-line-comments`, `no-inline-comments`).
- Ternary-only conditional rendering (`react/jsx-no-leaked-render`), alphabetical
  JSX props, `type` on every button, no component defined inside a render body.
- Import ordering and grouping (`simple-import-sort`).
- Dependency direction: `shared` may not import `app` or `features`, a feature
  may not import another feature's internals, `data/` may depend only on static
  data and core, `packages/core` may not import either app, and the editor's
  `shared` may not import its features (`no-restricted-imports`).
- No `dangerouslySetInnerHTML`, no unsanitised DOM writes (`react/no-danger`,
  `nounsanitized/*`).

**Deliberately off, with reasons:** `react-doctor`'s
`react-router-no-empty-leaf-route` — the persistent map shell resolves most
routes to `element: null` on purpose (§3); `prefer-tag-over-role`,
`no-barrel-import`, `iframe-missing-sandbox`, and
`react-compiler-no-manual-memoization`, which predate this revision.

**Still on review, not on a tool:** whether a JSDoc block says anything useful,
BEM naming, vertical-spacing judgement inside a function, whether an abstraction
earns its keep, and whether a Zod schema is at the right boundary rather than
merely present.

### Known gaps

Real work, listed so nobody rediscovers it as a surprise. None is urgent.

- `apps/travel-map-editor` has 29 cross-feature imports, so the feature-boundary
  rule that guards the public app is not applied there. Enforcing it means
  moving shared itinerary and place logic somewhere both features may depend on;
  until then, treat the editor's feature folders as a naming convention rather
  than a boundary.
- Seven stylesheets hand-roll `backdrop-filter` instead of using the glass
  mixins (§12).
- `TripTimelineStayGroup.tsx` is large enough that `react-doctor` flags it; the
  seam is between day-trip grouping and rendering.
- `useImageCache` keeps one object URL per photo for the life of the page. That
  is intentional — the cache exists so a re-mounted card reuses the decoded blob
  — but it is bounded by gallery size rather than by anything adaptive.
- The uploader (`scripts/uploader/`) has no tests and is verified only by
  `python -m compileall`.

Do not reintroduce the legacy `components`, `hooks`, or `utils` roots.
