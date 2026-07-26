# Coding Guidelines

How code in this repo is written. The goal is that anything generated later —
by you or by an assistant — reads as if the same person wrote it. Every rule
below is taken from the existing code; examples are real, lightly trimmed.

Two ideas run through everything:

1. **Write the least code that works, then explain _why_ it's shaped that way.**
   Comments carry rationale, not narration.
2. **Lean on the platform.** React Compiler, the standard library, and native
   browser features do the work before a dependency or an abstraction does.

These guidelines apply to every authored code file in the repository.
Technology-specific rules apply wherever that technology is used: the
TypeScript, React, and SCSS sections govern `travel-map/`, while the universal
principles also govern the Python uploader. Generated media, generated gallery
JSON, third-party assets, and lockfiles keep their generator or upstream
format.

---

## 1. Project structure

Atomic design under `travel-map/src/components/`:

```
atoms/       Smallest reusable pieces (Marker, Button, Loading, CountryFlag)
molecules/   Small compositions of atoms (Cards, Row)
organisms/   Feature-level blocks (Map, RouteOverlay, TripBrowser, TripDetail)
pages/       Route-level containers (Home) + their context
```

Supporting folders under `travel-map/src/`:

```
core/        Domain model — classes (Trip, City, Country), typings, helpers
data/        The actual trip/city/country data
hooks/       Reusable hooks, grouped by concern (hooks/language, hooks/image)
i18n/        Translation setup and formatting functions
utils/       Pure, dependency-free helpers (className, keyboard, parameters)
styles/      Global SCSS: _variables.scss, _variables.module.scss, mixins
assets/      Icons (SVG via svgr), JSON, flags
```

One component per folder, co-located with its `.scss`:
`Marker/Marker.tsx` + `Marker/Marker.scss`.

Use the `@/` alias for anything outside the current feature; short relative
paths (`../../../core`) are still common inside a feature. Prefer `@/` in new
code — it survives moves.

```ts
import { City, Travel } from "@/core";
import { useLanguage } from "@/hooks/language/language";
import { classNames } from "@/utils/className";
```

---

## 2. Imports

Ordered by `simple-import-sort`, in groups separated by blank lines. Run
`pnpm lint:fix` and it sorts for you; write them roughly in this order:

```tsx
import "./CityCard.scss"; // 1. Side-effect CSS first
import "maplibre-gl/dist/maplibre-gl.css";

import { ReactNode, useEffect, useRef } from "react"; // 2. External packages
import { useNavigate } from "react-router";

import CalendarIcon from "@/assets/icons/Calendar.svg?react"; // 3. @/ aliases
import { City, Travel } from "@/core";
import { useLanguage } from "@/hooks/language/language";

import { Button } from "../../atoms/Buttons/Button"; // 4. Relative
```

SVGs import as React components via svgr: `import Icon from "…/Icon.svg?react"`.

Import React APIs and types directly from `react`. Never use a default `React`
import or the `React.*` namespace:

```tsx
import { MouseEvent, ReactNode, StrictMode, useEffect } from "react";
```

Use the imported names in code and JSDoc (`MouseEvent`, `ReactNode`,
`PropsWithChildren`, and so on).

---

## 3. Components

Named `function` declarations (never `const X = () =>` for components, never
default exports for components), with an explicit `ReactNode` return type and
props destructured **in the signature** with defaults:

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

Conventions:

- **Props interface** is `<Component>Props`, declared directly above the
  component.
- **Optional props** use `?`. Give them a signature default only when the
  component has a meaningful fallback (`variant = "visited"`,
  `isClickable = false`). When omission itself is the intended value,
  destructure the prop without a default; never write `prop = undefined`.
- **JSDoc mirrors the signature.** Use `[props.tooltipId]` for an optional prop
  without a fallback and `[props.isClickable=false]` for a simple literal
  default. For computed or collection defaults, keep `[props.value]` and
  describe the fallback in the text.
- **Event handlers** are named `handleX` (`handleMouseEnter`, `handleCenterMap`).
- **Callback props** are named `onX` (`onHoverCity`, `onSelectCity`).
- **Sub-components local to one organism** live in the same file, above the main
  component (see `MapMarkers` and `MapTooltipOverlay` in `Map.tsx`). They also
  take a `…Props` interface. Don't define components _inside_ another
  component's body — `react/no-unstable-nested-components` forbids it.

---

## 4. Naming

| Thing                    | Convention             | Example                              |
| ------------------------ | ---------------------- | ------------------------------------ |
| Component / class / type | `PascalCase`           | `CityCard`, `Trip`, `TransportMode`  |
| Function / variable      | `camelCase`            | `getTripCoordinates`, `hoveredCity`  |
| Boolean                  | `is/has/should` prefix | `isHovered`, `shouldLoadImage`       |
| Handler                  | `handle` prefix        | `handleSelectCity`                   |
| Module-level constant    | `SCREAMING_SNAKE_CASE` | `HOVER_LEAVE_DELAY_MS`, `MAP_THEMES` |
| Props interface          | `<Component>Props`     | `MarkerProps`                        |
| CSS class                | BEM `block__el--mod`   | `city-card__title`                   |

Magic numbers become named constants at module top, with a comment when the
value isn't self-evident:

```ts
const HOVER_LEAVE_DELAY_MS = 300;
const CAMERA_DURATION_MS = 1100;
// 0 keeps the whole world reachable; anything higher clamps fitBounds on the
// intercontinental trips and pushes destinations off screen.
const MAPLIBRE_MIN_ZOOM = 0;
```

---

## 5. TypeScript

- **`interface`** for object shapes (props, data, domain records);
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
- Casts are a last resort and get a reason. Third-party escape hatches
  (e.g. MapLibre style expressions) use `as never` deliberately — that's an
  accepted pragmatic cast, not sloppiness.
- No `any`. `@typescript-eslint/recommended` is on.

---

## 6. Documentation & comments

This is the most distinctive part of the codebase. Two layers:

### JSDoc on every named declaration

Every named function, local handler, class, method, type alias, interface, and
enum gets a JSDoc block, regardless of whether it is exported. Inline anonymous
callbacks are the only exception. Components use the fuller form with `@param`
(typed, even though TS already types them — it is for the hover tooltip) and
`@returns`:

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

The spacing shown above is required:

- Start with `/**` and end with `*/` on their own lines.
- Leave one blank line before every JSDoc block, except when it starts a file
  or is the first statement immediately inside an opening block.
- Leave one blank line between complete declarations. The JSDoc stays directly
  attached to the declaration it documents, with no blank line between them.
- Do not place blank `*` lines anywhere inside a JSDoc block.
- Keep the component title, description, `@component`, every `@param`, and
  `@returns` contiguous.
- Document the props object first, then every prop in signature order, then the
  return value.
- Use `-` between a `@param`/`@property` name and its description.
- Keep JSDoc type names consistent with direct imports; never qualify them with
  the `React.*` namespace.
- Every named function documents each parameter and its return value. Use
  `@returns {void}` for functions that intentionally return nothing.
- Every object-shaped type or interface documents every field with
  `@property`. Union and primitive aliases still need a description but do not
  invent properties.
- Every class method and constructor documents its parameters; non-constructor
  methods also document their return value.

These requirements are enforced by `eslint-plugin-jsdoc`. Do not disable a
JSDoc rule to work around an inconsistent comment; update the comment to match
this format.

Pure helpers use a compact block describing what and why, with `@param`/
`@returns` when the signature isn't obvious:

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

Types and interfaces get a brief JSDoc block describing the concept, with `@property` for each field:

```ts
/**
 * A transport step (flight, ferry, drive, etc.) between two cities in a trip.
 * @property {string} from - The name of the origin city
 * @property {string} to - The name of the destination city
 */
export interface TripTransportStep {
  /* … */
}
```

Enums same, `@property` for each value:

```ts
/**
 * The mode of transport for a trip step.
 * @property {string} FERRY - A ferry trip
 * @property {string} PLANE - A flight
 * @property {string} CAR - A car trip
 * @property {string} TRAIN - A train trip
 * @property {string} BUS - A bus trip
 * @property {string} TAXI - A taxi trip
 * @property {string} WALK - A walking trip
 */
export enum TransportMode {
  FERRY = "ferry",
  PLANE = "plane",
  CAR = "car",
  TRAIN = "train",
  BUS = "bus",
  TAXI = "taxi",
  WALK = "walk",
}
```

### Inline comments explain WHY, never WHAT

Do not use inline comments to narrate the code. The code itself should be clear enough to explain what it does. Instead, use comments to explain why a particular approach was taken, any non-obvious decisions, or important context that isn't immediately clear from the code.
Never leave a comment that just restates the code (`// set the zoom`).

---

## 7. React patterns

- **React Compiler is on** (`babel-plugin-react-compiler`). Don't reach for
  `useMemo`/`useCallback` to micro-optimize renders — the compiler handles it.
  `useMemo` is still used, but only for genuinely expensive derived values that
  should be recomputed on a specific key (e.g. building a MapLibre style object
  keyed on the theme colour):

  ```tsx
  const mapStyle = useMemo<StyleSpecification>(
    () => ({ version: 8 /* … */ }),
    [theme.ocean],
  );
  ```

- **Conditional rendering uses ternaries returning `null`**, never `&&`.
  `react/jsx-no-leaked-render` enforces this:

  ```tsx
  {isLoaded ? <MapMarkers … /> : null}
  {showDates && travel?.sDate ? <DateRow … /> : null}   // guard first, then ternary
  ```

- **Effects** have explicit dependency arrays and a cleanup return when they
  subscribe to anything. Grab the ref into a local first:

  ```tsx
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new IntersectionObserver(/* … */, { rootMargin: "25%" });
    observer.observe(card);
    return () => observer.disconnect();
  }, [shouldLoadImage]);
  ```

- **Refs** (`useRef`) for imperative handles (`mapRef`) and mutable
  non-render state (`hoverLeaveTimer`, `isTooltipInteracting`).

- **Shared state via Context**, consumed with the non-null assertion because a
  provider is guaranteed by the route: `const { … } = use(HomeContext)!;`
  (note `use`, the React 19 reader, not `useContext`).

- **JSX props are sorted alphabetically** (`react/jsx-sort-props`), self-closing
  where empty (`react/self-closing-comp`), and buttons always declare
  `type="button"` (`react/button-has-type`). Fragments use the `<>` shorthand.

- **Conditional class names** go through the `classNames` util, not template
  strings, once there's more than one condition:

  ```tsx
  className={classNames(
    "city-card",
    isClickable ? "city-card--clickable" : "city-card--not-clickable",
    isHidden ? "city-card--hidden" : "city-card--visible",
  )}
  ```

---

## 8. Styling (SCSS)

- **BEM**: `.block`, `.block__element`, `.block--modifier`. Nest elements and
  modifiers with `&`:

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

- **`rem` units** for sizing/spacing, not `px`.
- **CSS custom properties** for values a modifier overrides (`--marker-color`).
- **Import shared SCSS with namespaces**:

  ```scss
  @use "../../../styles/variables" as v;
  @use "../../../styles/mixins" as m;

  color: v.$darkButtonContent;
  @include m.transition(background-color, 0.2s);
  ```

- **Theming is class-scoped**, not media-query-based: style under
  `.home--dark` and `.home--light` blocks. Always provide both.

  ```scss
  .home--dark .map-container {
    /* … */
  }
  .home--light .map-container {
    background: v.$lightBackground;
  }
  ```

- **Respect `prefers-reduced-motion`** — drop transitions inside it:

  ```scss
  @media (prefers-reduced-motion: reduce) {
    .map-city-marker {
      transition: none;
    }
  }
  ```

- **Design tokens live in `_variables.scss`.** Never hardcode a colour that a
  token already names. Values the _JavaScript_ needs (route/transport colours)
  are duplicated in `_variables.module.scss` and imported as a module:
  `import variables from "@/styles/_variables.module.scss"`.

---

## 9. Accessibility

Not optional. The existing markers show the baseline:

- `aria-label` on interactive elements; `aria-hidden="true"` on decorative SVG.
- Custom interactive elements get `role="button"` + `tabIndex={0}` **and**
  keyboard activation — use the `isActivationKey` helper, don't hand-check keys:

  ```tsx
  onKeyDown={(event) => isActivationKey(event) && openGallery()}
  ```

- Focus states are styled (`&:focus-visible`), and `outline: none` is only ever
  paired with a visible replacement (scale, ring, z-lift).

---

## 10. Domain model (`core/`)

Real domain concepts are **classes** that take a typed `…Data` object and derive
their computed fields in the constructor:

```ts
interface TripData {
  id: string;
  sDate: Date;
  eDate: Date;
  steps: TripRouteStep[];
  mapFocus?: { center: [number, number]; zoom: number };
  // …
}

/**
 * Represents a single travel trip — its origin, itinerary steps, date range,
 * and derived destination list. Provides helpers to extract flights, ferries,
 * visited countries, and map route coordinates.
 */
export class Trip {
  destinations: TripDestination[];
  route: City["name"][];

  constructor(data: TripData) {
    this.steps = data.steps;
    this.destinations = this.getDestinationsFromSteps(); // derive, don't store raw twice
    this.route = this.destinations.flatMap((d) =>
      d.isLayover ? [] : [d.city.name],
    );
  }

  getDurationInDays(): number {
    /* … */
  }
}
```

Behaviour that belongs to a concept lives as a method on it
(`trip.getRouteSegments()`, `city.getBackgroundImgSourceByIndex()`), not as a
free function in a component. Prefer `remeda` (already a dependency) for
collection work (`unique`, etc.) over reinventing it.

---

## 11. Lint & format — the enforced rules

`pnpm lint` must pass with **zero warnings** (`--max-warnings=0`); `pnpm format`
runs Prettier. The rules that shape day-to-day code:

- `simple-import-sort/imports` — import grouping/order (see §2).
- `react/jsx-sort-props` — props alphabetical.
- `react/destructuring-assignment` (`destructureInSignature: always`) — §3.
- `react/jsx-no-leaked-render` (`ternary` only) — no `&&` render, §7.
- `react/button-has-type` — every `<button>` has an explicit `type`.
- `jsdoc/*` — canonical multiline JSDoc, no blank lines, valid and defined
  types, complete destructured parameters, `@property` entries, and documented
  returns (see §6).
- `react/jsx-fragments` — `<>` over `<Fragment>`.
- `react/no-unstable-nested-components` — no components defined mid-render.
- `react/no-danger` + `nounsanitized/*` — no `dangerouslySetInnerHTML`, no
  unsanitized DOM sinks.
- `react-hooks/exhaustive-deps` — keep dependency arrays honest.

Before committing, run the following from `travel-map/`:

```bash
pnpm check
```

Husky + lint-staged run the relevant checks on staged files, so a clean local
run means a clean commit.

---

### The one-line version

Least code that works · say _why_, not _what_ · lean on the platform · match the
voice above · zero lint warnings.
