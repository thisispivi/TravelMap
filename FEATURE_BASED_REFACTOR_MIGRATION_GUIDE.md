# Travel Map Feature-Based Refactor Migration Guide

## 1. Purpose

This document is the implementation guide for migrating only the public React
application in `apps/travel-map` from its current atomic-design directory layout
to a feature-based layout.

It is intentionally detailed enough to use as a migration runbook. It defines:

- the decision gate that must be passed before work starts;
- the exact target architecture and allowed dependency directions;
- the ownership of every current source area;
- a sequence of independently deployable pull requests;
- import, routing, state, data, styling, testing, and documentation rules;
- verification, rollback, and completion criteria.

This guide does **not** authorize the refactor by itself. The repository's
current canonical standard, `CODING_GUIDELINES.md`, explicitly says that a
feature-folder migration is not recommended without a concrete trigger. If the
team approves this migration, updating that standard is phase 0 and must happen
before source files move. Otherwise, follow the current layered architecture.

## 2. Scope

### 2.1 In scope

- `apps/travel-map/src` TypeScript, TSX, and component SCSS organization;
- the public app's route composition and lazy-loading boundaries;
- the public app's map-shell state ownership;
- feature ownership of app-level utilities and hooks;
- import paths and architecture enforcement;
- public-app tests introduced to protect the migration;
- public-app documentation affected by the new structure.

### 2.2 Out of scope

- `apps/travel-map-editor`;
- changing JSON formats under `data/`;
- changing uploader behavior under `scripts/uploader/`;
- redesigning domain classes or `buildWorld()` in `packages/core`;
- visual redesign, copy changes, new routes, or new user-visible behavior;
- changing the hash-router deployment model;
- replacing React Router, MapLibre, SWR, i18next, Framer Motion, or SCSS;
- introducing barrels (`index.ts` files) or a new state-management library;
- moving app-specific code into `@travelmap/core` merely to make imports easier.

Changes to `packages/core` are permitted only when an existing public-app
domain calculation is independently proven to belong there. Such a domain
refactor must be a separate change from file relocation and is not required by
this migration.

## 3. Preconditions and decision gate

The migration should proceed only when at least one concrete trigger exists:

1. multiple active contributors repeatedly edit the same layer folders and
   ownership is slowing reviews;
2. a feature is regularly changed across atoms, molecules, organisms, hooks,
   and utilities, making its impact difficult to discover;
3. measured cross-feature coupling or regressions show that explicit feature
   boundaries would prevent defects;
4. upcoming work will create several new modules in one feature and the current
   layout would make that feature materially harder to own;
5. the maintainers deliberately choose feature ownership as the long-term
   architecture and accept the one-time import churn.

Before phase 0 is approved, capture the trigger in the tracking issue or
architecture decision record. Include examples, affected paths, and the
expected outcome. "Feature folders are cleaner" is not a sufficient trigger.

The migration is ready to start when all of the following are true:

- the trigger is documented;
- a maintainer owns the entire sequence;
- unrelated large refactors are paused or coordinated;
- `pnpm check` and `pnpm build` pass on the base commit;
- all supported routes have a manual smoke-test baseline;
- current lazy-loaded chunks are recorded from a production build;
- the team agrees that no feature behavior will change during move-only PRs.

## 4. Current architecture baseline

The current app is organized primarily by technical role:

```text
apps/travel-map/src/
  components/
    atoms/
    molecules/
    organisms/
    pages/
    templates/
  data/
  hooks/
  i18n/
  styles/
  utils/
  assets/
  main.tsx
```

Important behavior that the migration must preserve:

- `main.tsx` creates a `createHashRouter` router.
- `Home` is a persistent map shell. It stays mounted while panel-like routes
  change.
- `/trips`, `/trip/:tripId`, `/places`, and `/places/:filter` use `element:
null`; the shell classifies the URL and chooses the overlaid panel.
- `/timeline` and `/stats` render lazy route elements inside the shell's bottom
  panel.
- `/gallery/:cityName/:travelIdx` and its `:photoIdx` child use lazy route
  modules and loaders.
- `HomeContext` currently carries theme, responsive state, map position,
  hovered city, selected trip, active view, and panel visibility.
- `src/data/index.ts` eagerly imports static JSON and calls `buildWorld()` once,
  exposing the linked graph and common derived collections.
- `@travelmap/core` is the shared domain boundary for both applications.
- global styles and i18n initialize for the entire application.
- no component barrels exist; imports point to concrete files.

These are behavioral invariants, not artifacts to remove during the folder
migration.

## 5. Target architecture

Use a pragmatic feature-first layout with four top-level ownership categories:

```text
apps/travel-map/src/
  app/
    routing/
    shell/
    tooltip/
  features/
    gallery/
      components/
      loaders/
      lib/
    map/
      components/
      lib/
    navigation/
      components/
    places/
      components/
      lib/
    stats/
      components/
      lib/
    timeline/
      components/
      lib/
    trips/
      components/
      lib/
  shared/
    context/
    components/
    hooks/
    lib/
  assets/
  data/
  i18n/
  styles/
  main.tsx
```

The folder names `components` and `lib` are intentional:

- `components` contains React components and their colocated SCSS;
- `lib` contains feature-owned hooks, pure calculations, types, and constants;
- `loaders` is used only where React Router loaders are a meaningful boundary;
- a feature does not need every subfolder;
- do not create empty folders to make trees look symmetrical.

`main.tsx` remains the browser entry point. Router creation moves to
`app/routing/router.tsx`, while global side-effect imports may remain in
`main.tsx`. This leaves the Vite entry obvious and makes route composition
testable without treating routing as a user feature.

### 5.1 Ownership definitions

| Area                | Owns                                                                                                            | Must not own                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `app`               | application bootstrap composition, route table, persistent shell, global tooltip host, top-level error boundary | trip calculations, map algorithms, feature-specific cards                |
| `features/<name>`   | UI, hooks, calculations, and route adapters used to deliver one user capability                                 | generic controls, global configuration, another feature's internals      |
| `shared/components` | presentation primitives used by at least two features without feature semantics                                 | `TripCard`, `CityCard`, stats charts, map markers                        |
| `shared/context`    | narrow cross-feature interaction contracts whose providers are composed by the app shell                        | feature rendering, route classification, duplicated state                |
| `shared/hooks`      | browser/React infrastructure used by at least two features                                                      | hooks that calculate stats or understand trip routes                     |
| `shared/lib`        | small app-wide technical helpers and configuration                                                              | domain behavior that belongs in `@travelmap/core`, feature orchestration |
| `data`              | one construction boundary for static site data and the world graph                                              | feature rendering, route decisions                                       |
| `i18n`              | initialization, locale metadata, and cross-feature formatting                                                   | feature UI                                                               |
| `styles`            | global tokens, typography, resets, mixins                                                                       | component-specific selectors                                             |
| `assets`            | source icons and bundled static data                                                                            | feature logic                                                            |

### 5.2 Dependency direction

Allowed dependencies are:

```text
main -> app -> features -> shared -> external packages
                    \----> data -> @travelmap/core
features --------------------------> @travelmap/core
app -------------------------------> shared/data/external packages
```

Apply these rules:

1. `shared` must never import from `features` or `app`.
2. A feature must never import another feature's private component or `lib`
   module.
3. `app` may compose feature entry components, but features must not import
   `app` internals.
4. The temporary shell context is the one exception to rule 3 during the
   migration. Remove that exception in the context phase by exposing narrow
   shared shell hooks or passing callbacks through feature entry components.
5. `data` may import `@travelmap/core` and static JSON only. It must not import
   React, routes, components, or feature code.
6. `@travelmap/core` must remain independent of both apps.
7. Same-feature relative imports are preferred. Cross-root imports use `@/`.
8. Imports always target concrete files. Do not add public barrels.
9. Cycles are forbidden, including type-only cycles.

### 5.3 Cross-feature interaction contract

Features communicate through one of these mechanisms, in preference order:

1. route state and route parameters;
2. props and callbacks owned by the nearest app-level composer;
3. the shared world graph from `data/world.ts`;
4. a narrow app-shell context hook for genuinely shared interactive state.

Do not import a feature component solely to call its helper. Move a genuinely
shared helper to `shared/lib`, move domain behavior to `@travelmap/core`, or
define a small contract at the app composition boundary.

### 5.4 Source conventions during migration

Every moved or created file follows the latest `CODING_GUIDELINES.md`; the old
file is not precedent. In particular:

- subordinate modules use the dot-qualified owner pattern
  (`MapShell.context.ts`, `MapShell.layout.tsx`, `MapShell.state.ts`,
  `Gallery.loader.ts`), while primary components retain `PascalCase.tsx`;
- every authored UI class uses BEM, with one explicit block owner, `__` elements,
  and `--` modifiers nested through Sass `&`;
- generic classes inherited from the old layout, such as `.centered`, `.active`,
  or `.loading`, are renamed to owned BEM elements during the relevant feature
  move; this naming correction is part of the migration, not a behavior change;
- simple alias types receive mandatory single-line JSDoc; object-shaped types
  retain multiline JSDoc with `@property` entries;
- human-authored `//` comments and all trailing comments are removed from every
  touched file; necessary rationale uses an own-line block comment;
- imports, declarations, function phases, JSX regions, and SCSS branches follow
  the canonical vertical-spacing rules. Do not preserve arbitrary blank lines
  merely to minimize a move diff.

## 6. Target source tree and exact ownership

The following tree is the intended end state. Omit a directory only if its
listed files have been proven unnecessary during the migration. The temporary
`app/shell/MapShell.context.ts` used in phases 4–10 is deliberately absent: phase
11 replaces it with narrow contracts under `shared/context`.

```text
src/
  app/
    routing/
      router.tsx
      useAppLocation.ts
    shell/
      MapShell.tsx
      MapShell.scss
      MapShell.layout.tsx
      MapShell.state.ts
    tooltip/
      BaseTooltip.tsx
  features/
    gallery/
      components/Gallery/Gallery.tsx
      components/Gallery/Gallery.scss
      components/Lightbox/Lightbox.tsx
      components/Lightbox/Lightbox.scss
      loaders/Gallery.loader.ts
      loaders/Lightbox.loader.ts
      lib/useImageCache.ts
    map/
      components/Map/Map.tsx
      components/Map/Map.scss
      components/Map/MapLayers.tsx
      components/Map/MapMarkers.tsx
      components/Marker/Marker.tsx
      components/Marker/Marker.scss
      components/MapTooltip/MapTooltip.tsx
      components/MapTooltip/MapTooltip.scss
      components/RouteOverlay/RouteOverlay.tsx
      components/RouteOverlay/RouteOverlay.scss
      lib/mapCamera.ts
      lib/mapData.ts
      lib/mapTheme.ts
      lib/mapTripCities.ts
    navigation/
      components/FloatingNav/FloatingNav.tsx
      components/FloatingNav/FloatingNav.scss
      components/LanguageSelector/LanguageSelector.tsx
      components/LanguageSelector/LanguageSelector.scss
      components/LanguageFlag/LanguageFlag.tsx
      components/DarkModeButton/DarkModeButton.tsx
      components/DarkModeButton/DarkModeButton.scss
    places/
      components/PlacesBrowser/PlacesBrowser.tsx
      components/PlacesBrowser/PlacesBrowser.scss
      components/CityCard/CityCard.tsx
      components/CityCard/CityCard.scss
      components/FilterByCountry/FilterByCountry.tsx
      components/FilterByCountry/FilterByCountry.scss
    stats/
      components/StatsPage/StatsPage.tsx
      components/StatsPage/StatsPage.scss
      components/StatsGrid/StatsGrid.tsx
      components/StatsGrid/StatsGrid.scss
      components/StatsGrid/cards/*
      components/charts/*
      components/rows/*
      components/StatTile/StatTile.tsx
      components/StatTile/StatTile.scss
      lib/useStatsData.ts
      lib/cities.ts
      lib/continents.ts
      lib/countries.ts
      lib/distance.ts
      lib/transport.ts
    timeline/
      components/TimelinePage/TimelinePage.tsx
      components/TimelinePage/TimelinePage.scss
      components/TimelineTrack/TimelineTrack.tsx
      components/TimelineTrack/TimelineTrack.scss
    trips/
      components/TripBrowser/TripBrowser.tsx
      components/TripBrowser/TripBrowser.scss
      components/TripCard/TripCard.tsx
      components/TripCard/TripCard.scss
      components/TripDetail/TripDetail.tsx
      components/TripDetail/TripDetail.scss
      components/TripDetailHero/TripDetailHero.tsx
      components/TripDetailHero/TripDetailHero.scss
      components/TravelSelector/TravelSelector.tsx
      components/TravelSelector/TravelSelector.scss
      components/TripTimeline/*
      lib/trips.ts
      lib/tripDetailTimeline.ts
  shared/
    context/MapInteraction.context.ts
    context/Panel.context.ts
    components/Button/*
    components/Checkbox/*
    components/CloseButton/*
    components/Container/*
    components/CountryFlag/*
    components/EmptyState/*
    components/Loading/*
    components/PanelLoading/*
    components/SegmentedControl/*
    components/TransportModeIcon/*
    hooks/useLanguage.ts
    hooks/useResizeMeasurement.ts
    hooks/useResponsive.ts
    hooks/useThemeDetector.ts
    lib/classNames.ts
    lib/format.ts
    lib/keyboard.ts
    lib/parameters.ts
    lib/responsive.ts
    lib/storage.ts
    lib/timezone.ts
    lib/timezoneOffset.ts
  assets/
  data/world.ts
  i18n/
  styles/
  main.tsx
```

This is an ownership plan, not permission to create abstraction layers. Keep
existing filenames where a rename adds no clarity. The renames above resolve
real ambiguity:

- page components receive a `Page` suffix consistently;
- `Home` becomes `MapShell`, because it is a persistent shell rather than a
  home page;
- the home template becomes `MapShellLayout` in `MapShell.layout.tsx`;
- the shell context and reducer/state become `MapShell.context.ts` and
  `MapShell.state.ts`, following the dot-qualified companion convention;
- the custom route hook becomes `useAppLocation` so it is not confused with
  React Router's `useLocation`;
- `TooltipMap` becomes `MapTooltip`;
- `data/index.ts` becomes `data/world.ts`, avoiding a new barrel-like index;
- utility filenames use the full domain name (`continents.ts`, not
  `continent.ts`) when they expose a collection of related operations.

## 7. Complete current-to-target file disposition

All `.scss` files colocated with a component move with their matching `.tsx`
file. The tables below list the TypeScript owner; apply the same target to its
stylesheet unless a separate instruction says otherwise.

### 7.1 Application composition

| Current                                          | Target                                                           | Notes                                                                           |
| ------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `src/main.tsx` router declaration                | `src/app/routing/router.tsx`                                     | Move router and lazy route imports; retain root rendering in `main.tsx`.        |
| `src/main.tsx` `BaseTooltip`                     | `src/app/tooltip/BaseTooltip.tsx`                                | App-global infrastructure, not a reusable feature component.                    |
| `src/main.tsx` root rendering and global imports | `src/main.tsx`                                                   | Keep the Vite entry small and explicit.                                         |
| `components/pages/Home/Home.tsx`                 | `app/shell/MapShell.tsx`                                         | Preserve redirect and provider behavior.                                        |
| `components/pages/Home/HomeContext.ts`           | `app/shell/MapShell.context.ts`, then `shared/context` contracts | The app-shell location is transitional through phase 10; delete it in phase 11. |
| reducer/types inside `Home.tsx`                  | `app/shell/MapShell.state.ts`                                    | Extract only while moving shell code; no behavior change.                       |
| `components/templates/Home/Home.tsx`             | `app/shell/MapShell.layout.tsx`                                  | Preserve overlays, suspense boundaries, and animation keys.                     |
| `hooks/location/location.ts`                     | `app/routing/useAppLocation.ts`                                  | Rename hook and update all consumers.                                           |
| `components/pages/Fallback/Fallback.tsx`         | `app/routing/FallbackPage.tsx`                                   | Keep its SCSS beside it.                                                        |

### 7.2 Map feature

| Current                                              | Target                                                                                 |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `components/organisms/Map/Map.tsx`                   | `features/map/components/Map/Map.tsx`                                                  |
| `components/organisms/Map/MapLayers.tsx`             | `features/map/components/Map/MapLayers.tsx`                                            |
| `components/organisms/Map/MapMarkers.tsx`            | `features/map/components/Map/MapMarkers.tsx`                                           |
| `components/organisms/Map/mapCamera.ts`              | `features/map/lib/mapCamera.ts`                                                        |
| `components/organisms/Map/mapData.ts`                | `features/map/lib/mapData.ts`                                                          |
| `components/organisms/Map/mapTheme.ts`               | `features/map/lib/mapTheme.ts`                                                         |
| `components/organisms/Map/mapTripCities.ts`          | `features/map/lib/mapTripCities.ts`                                                    |
| `components/atoms/Marker/Marker.tsx`                 | `features/map/components/Marker/Marker.tsx`                                            |
| `components/organisms/RouteOverlay/RouteOverlay.tsx` | `features/map/components/RouteOverlay/RouteOverlay.tsx`                                |
| `components/organisms/Tooltip/TooltipMap.tsx`        | `features/map/components/MapTooltip/MapTooltip.tsx`                                    |
| `utils/geo.ts`                                       | `features/map/lib/geo.ts` if only `mapData` consumes it; otherwise `shared/lib/geo.ts` |

Do not move `countries-50m.json` into the feature during the initial migration.
It remains a bundled asset at `assets/json/countries-50m.json`; the map feature
owns its interpretation, not the source asset directory.

### 7.3 Trips feature

| Current                                                        | Target                                                                      |
| -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `components/organisms/TripBrowser/TripBrowser.tsx`             | `features/trips/components/TripBrowser/TripBrowser.tsx`                     |
| `components/molecules/Cards/TripCard.tsx`                      | `features/trips/components/TripCard/TripCard.tsx`                           |
| `components/organisms/TripDetail/TripDetail.tsx`               | `features/trips/components/TripDetail/TripDetail.tsx`                       |
| `components/molecules/TripDetailHero/TripDetailHero.tsx`       | `features/trips/components/TripDetailHero/TripDetailHero.tsx`               |
| `components/molecules/TravelSelector/TravelSelector.tsx`       | `features/trips/components/TravelSelector/TravelSelector.tsx`               |
| `components/molecules/Timeline/Timeline.tsx`                   | `features/trips/components/TripTimeline/TripTimeline.tsx`                   |
| `components/molecules/Timeline/TimelineDayTripCard.tsx`        | `features/trips/components/TripTimeline/TripTimelineDayTripCard.tsx`        |
| `components/molecules/Timeline/TimelineOriginNode.tsx`         | `features/trips/components/TripTimeline/TripTimelineOriginNode.tsx`         |
| `components/molecules/Timeline/TimelineStayCard.tsx`           | `features/trips/components/TripTimeline/TripTimelineStayCard.tsx`           |
| `components/molecules/Timeline/TimelineStayGroup.tsx`          | `features/trips/components/TripTimeline/TripTimelineStayGroup.tsx`          |
| `components/molecules/Timeline/TimelineTransportConnector.tsx` | `features/trips/components/TripTimeline/TripTimelineTransportConnector.tsx` |
| `utils/trips.ts`                                               | `features/trips/lib/trips.ts`                                               |
| `utils/tripDetailTimeline.ts`                                  | `features/trips/lib/tripDetailTimeline.ts`                                  |
| `utils/timezoneOffset.ts`                                      | `shared/lib/timezoneOffset.ts`                                              |

The current component named `Timeline` is trip-detail UI and must not be placed
in the top-level `timeline` feature. Rename it to `TripTimeline` during its move
to remove that ambiguity. Its exported symbol, stylesheet root selectors, and
all imports must change together in one PR.

`timezoneOffset.ts` is already consumed by the trip-detail timeline and the
stats timezone row, so its final owner is `shared/lib`. Do not duplicate it.

### 7.4 Places feature

| Current                                                    | Target                                                           |
| ---------------------------------------------------------- | ---------------------------------------------------------------- |
| `components/organisms/PlacesBrowser/PlacesBrowser.tsx`     | `features/places/components/PlacesBrowser/PlacesBrowser.tsx`     |
| `components/molecules/Cards/CityCard.tsx`                  | `features/places/components/CityCard/CityCard.tsx`               |
| `components/molecules/FilterByCountry/FilterByCountry.tsx` | `features/places/components/FilterByCountry/FilterByCountry.tsx` |

`CityCard` currently also participates in navigation and hover behavior. It is
still places-owned because its user-facing purpose is browsing cities. If a
second feature needs a city presentation, create a separately named component
for that use case instead of making `CityCard` generic prematurely.

### 7.5 Top-level timeline feature

| Current                                                | Target                                                         |
| ------------------------------------------------------ | -------------------------------------------------------------- |
| `components/pages/Timeline/Timeline.tsx`               | `features/timeline/components/TimelinePage/TimelinePage.tsx`   |
| `components/organisms/TimelineTrack/TimelineTrack.tsx` | `features/timeline/components/TimelineTrack/TimelineTrack.tsx` |

The top-level timeline feature may import `data/world.ts`, shared presentation
components, i18n, and `@travelmap/core`. It must not import trips-feature UI.
If it needs trip calculations now located in `features/trips/lib`, decide
whether the logic is a domain operation for `@travelmap/core` or a genuinely
shared app calculation. Never create a timeline-to-trips private import.

### 7.6 Gallery feature

| Current                                      | Target                                                                             |
| -------------------------------------------- | ---------------------------------------------------------------------------------- |
| `components/organisms/Gallery/Gallery.tsx`   | `features/gallery/components/Gallery/Gallery.tsx`                                  |
| `components/organisms/Gallery/loader.ts`     | `features/gallery/loaders/Gallery.loader.ts`                                       |
| `components/organisms/Lightbox/Lightbox.tsx` | `features/gallery/components/Lightbox/Lightbox.tsx`                                |
| `components/organisms/Lightbox/loader.ts`    | `features/gallery/loaders/Lightbox.loader.ts`                                      |
| `hooks/image/cache.ts`                       | `features/gallery/lib/useImageCache.ts` if gallery/lightbox are its only consumers |

Gallery loaders may import the gallery component's exported loader-data type,
but prefer defining route loader result types in the loader module and having
the component import the type. That direction keeps route data construction
independent of rendering.

### 7.7 Navigation feature

| Current                                            | Target                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| `components/organisms/FloatingNav/FloatingNav.tsx` | `features/navigation/components/FloatingNav/FloatingNav.tsx`           |
| `components/organisms/Language/Language.tsx`       | `features/navigation/components/LanguageSelector/LanguageSelector.tsx` |
| `components/atoms/LanguageFlag/LanguageFlag.tsx`   | `features/navigation/components/LanguageFlag/LanguageFlag.tsx`         |
| `components/atoms/Buttons/DarkModeButton.tsx`      | `features/navigation/components/DarkModeButton/DarkModeButton.tsx`     |

Language initialization and `useLanguage` remain shared. Only the interactive
language-selection UI belongs to navigation.

### 7.8 Stats feature

Move the following into `features/stats` as one coherent vertical slice:

- `components/pages/Stats/Stats.tsx` and `Stats.scss` to
  `components/StatsPage/StatsPage.*`;
- `components/organisms/StatsGrid/StatsGrid.*`;
- every file under `components/organisms/StatsGrid/cards/`;
- every file under `components/atoms/BarChart/`;
- `components/atoms/DonutChart/DonutChartTransports.*`;
- `components/atoms/StatTile/StatTile.*`;
- every file under `components/molecules/Row/`;
- `components/molecules/Box/Box.*` if it remains stats-only;
- `components/molecules/Cards/Card.*` if it remains stats-only;
- `hooks/stats/useStatsData.ts`;
- `utils/cities.ts`, `utils/continent.ts`, `utils/countries.ts`,
  `utils/distance.ts`, and `utils/transport.ts` when their importer audit
  confirms stats-only ownership.

Every current stats card moves without renaming into
`features/stats/components/StatsGrid/cards/`:

| Current file                                           |
| ------------------------------------------------------ |
| `CitiesPerCountryCard.tsx`                             |
| `CompaniesCard.tsx` and `CompaniesCard.scss`           |
| `ContinentsChartCard.tsx`                              |
| `CoverageCard.tsx` and `CoverageCard.scss`             |
| `CurrencyCard.tsx` and `CurrencyCard.scss`             |
| `DaysPerYearCard.tsx`                                  |
| `MileageCard.tsx` and `MileageCard.scss`               |
| `PopulationCard.tsx` and `PopulationCard.scss`         |
| `TransportCard.tsx` and `TransportCard.scss`           |
| `TransportModesCard.tsx` and `TransportModesCard.scss` |

Use these destination groupings:

```text
features/stats/components/charts/
  BarChartContinents.*
  BarChartCountries.*
  BarChartPopulation.*
  BarChartTransportModes.*
  BarChartYears.*
  DonutChartTransports.*
features/stats/components/rows/
  Row.*
  RowCity.*
  RowContinent.*
  RowCurrency.*
  RowTimezone.*
  RowTransport.*
```

Before moving any utility into stats, run `rg` for every import. Known
cross-feature cases require special handling:

- `format.ts` is cross-feature and remains shared;
- `distance.ts` is used by stats and a stats row today, so it is stats-owned
  unless another feature consumes it at migration time;
- `timezone.ts` is used by stats, map tooltip, and trip-detail calculations,
  so it remains shared;
- `trips.ts` is used by gallery, tooltip, stats, and trips UI today. Split it
  by responsibility before enforcing boundaries: trip-feature presentation
  helpers stay with trips, while graph-query functions used across features
  move to a domain-named shared module or `@travelmap/core`.

Do not call `Box`, `Card`, `Row`, or charts shared merely because their names
are generic. Ownership is determined by semantics and importer count.

### 7.9 Shared components

Move these components to `shared/components` after confirming at least two
feature consumers, or because they are unambiguously technical primitives:

| Current                                                    | Target                                                      |
| ---------------------------------------------------------- | ----------------------------------------------------------- |
| `components/atoms/Buttons/Button.*`                        | `shared/components/Button/Button.*`                         |
| `components/atoms/Buttons/CloseButton.*`                   | `shared/components/CloseButton/CloseButton.*`               |
| `components/atoms/Checkbox/Checkbox.tsx`                   | `shared/components/Checkbox/Checkbox.tsx`                   |
| `components/atoms/CountryFlag/CountryFlag.*`               | `shared/components/CountryFlag/CountryFlag.*`               |
| `components/atoms/EmptyState/EmptyState.*`                 | `shared/components/EmptyState/EmptyState.*`                 |
| `components/atoms/Loading/Loading.*`                       | `shared/components/Loading/Loading.*`                       |
| `components/atoms/SegmentedControl/SegmentedControl.*`     | `shared/components/SegmentedControl/SegmentedControl.*`     |
| `components/atoms/TransportModeIcon/TransportModeIcon.tsx` | `shared/components/TransportModeIcon/TransportModeIcon.tsx` |
| `components/molecules/Container/Container.*`               | `shared/components/Container/Container.*`                   |
| `components/molecules/PanelLoading/PanelLoading.*`         | `shared/components/PanelLoading/PanelLoading.*`             |
| `components/molecules/PanelLoading/panelLoadingState.ts`   | `shared/components/PanelLoading/panelLoadingState.ts`       |

Any supposedly shared component with only one feature consumer after all moves
must be relocated into that feature before the migration is declared complete.

### 7.10 Shared hooks, libraries, and retained roots

| Current                                | Target                                   | Reason                                                      |
| -------------------------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| `hooks/language/language.ts`           | `shared/hooks/useLanguage.ts`            | Cross-feature localization hook.                            |
| `hooks/layout/useResizeMeasurement.ts` | `shared/hooks/useResizeMeasurement.ts`   | Browser measurement infrastructure used by multiple panels. |
| `hooks/style/responsive.ts`            | `shared/hooks/useResponsive.ts`          | App-wide responsive state.                                  |
| `hooks/style/theme.ts`                 | `shared/hooks/useThemeDetector.ts`       | App-wide theme state.                                       |
| `utils/className.ts`                   | `shared/lib/classNames.ts`               | Cross-feature technical helper; rename to match export.     |
| `utils/convert.ts`                     | `shared/lib/convert.ts` or feature owner | Decide from importer audit; do not leave an orphan.         |
| `utils/format.ts`                      | `shared/lib/format.ts`                   | Cross-feature formatting.                                   |
| `utils/keyboard.ts`                    | `shared/lib/keyboard.ts`                 | Cross-feature accessibility helper.                         |
| `utils/parameters.ts`                  | `shared/lib/parameters.ts`               | Site configuration adapter used throughout the app.         |
| `utils/responsive.ts`                  | `shared/lib/responsive.ts`               | Non-hook responsive/browser checks.                         |
| `utils/storage.ts`                     | `shared/lib/storage.ts`                  | Technical storage handling.                                 |
| `utils/timezone.ts`                    | `shared/lib/timezone.ts`                 | Used by multiple features.                                  |
| `data/index.ts`                        | `data/world.ts`                          | Shared data construction boundary, not a barrel.            |
| `i18n/**/*`                            | unchanged                                | Already a cohesive cross-feature service.                   |
| `styles/**/*`                          | unchanged                                | Global design tokens and mixins.                            |
| `assets/**/*`                          | unchanged initially                      | Avoid asset churn in a code-ownership migration.            |
| `vite-env.d.ts`                        | unchanged                                | Vite/SVGR ambient types remain at the source root.          |

Delete the old `components`, `hooks`, and `utils` roots only after `rg` and
`rg --files` prove they are empty and every move has passed verification.

## 8. Migration strategy

The migration must be incremental. Each PR must build, pass checks, preserve
all routes, and be safe to deploy independently. Use `git mv` for source
history, but keep each PR conceptually move-only unless its phase explicitly
allows a rename or boundary extraction.

### Phase 0: approve and align the canonical standard

1. Record the concrete trigger and decision.
2. Update `CODING_GUIDELINES.md` sections 3, 4, 5, 11, 18, and 20 so the
   feature-first structure becomes canonical for `apps/travel-map` only.
3. Preserve all existing component, hook, TypeScript, import, SCSS,
   accessibility, and JSDoc rules.
4. Replace the current explicit prohibition with the dependency rules in this
   guide.
5. Update `AGENTS.md`, `CLAUDE.md`, and Copilot instructions only if their thin
   adapter text needs a path correction; do not duplicate architecture rules.
6. Add this guide to the root README documentation links.

Exit gate: documentation agrees on the target, and no source has moved.

### Phase 1: baseline behavior and architecture inventory

Before modifying paths:

1. Run and record:

   ```powershell
   pnpm check
   pnpm build
   git status --short
   ```

2. Save the production `dist/assets` filenames and sizes as a diagnostic
   baseline. Chunk hashes will change; compare purpose and approximate size,
   not exact filenames.
3. Manually exercise every route in section 14 and record screenshots at one
   desktop and one mobile viewport.
4. Record console errors and warnings. The refactor may not introduce new ones.
5. Build an import inventory with `rg` for `@/components`, `@/hooks`,
   `@/utils`, relative component imports, `HomeContext`, and `@/data`.
6. Identify uncommitted user changes and coordinate any overlapping files.

Exit gate: green base commit, reproducible route baseline, and complete import
inventory.

### Phase 2: establish roots and architecture checks

1. Create only the directories needed by the first move.
2. Keep the existing `@/* -> ./src/*` alias. Do not add per-feature aliases;
   they obscure the actual dependency direction.
3. Add ESLint `no-restricted-imports` patterns, or the repository's chosen
   equivalent, in warning/staged form first:
   - forbid `@/features/*` from `shared`;
   - forbid `@/app/*` from `shared` and features;
   - forbid direct imports between distinct feature roots;
   - forbid imports from the legacy roots once their migration phase ends.
4. Do not add a dependency solely for boundary enforcement if ESLint can
   express the rule.
5. Document the temporary exception for shell context imports with an exact
   removal phase and no wildcard exemption.

Exit gate: empty structural roots are minimal, checks remain green, and new
boundary violations can be detected without blocking legacy code.

### Phase 3: move shared foundations

Move the shared components, hooks, and libraries from sections 7.9 and 7.10 in
small batches:

1. move a component folder with its SCSS;
2. update every importer in the same commit;
3. run `rg` for the old path;
4. run the focused app typecheck/lint;
5. repeat for the next coherent batch;
6. move `data/index.ts` to `data/world.ts` and update all imports explicitly;
7. leave global styles, assets, and i18n in place.

Suggested PR split:

- shared visual primitives;
- shared browser hooks and technical libraries;
- data boundary rename.

Do not redesign component props in these PRs. Exit gate: all shared imports use
the new paths, old paths have zero consumers, and there are no feature imports
under `shared`.

### Phase 4: extract routing and app shell

1. Move the router declaration from `main.tsx` to
   `app/routing/router.tsx`.
2. Export one configured `router` value; keep `createRoot` in `main.tsx`.
3. Extract `BaseTooltip` without changing its event listeners or placement
   relative to `RouterProvider`.
4. Rename and move `Home` to `MapShell`.
5. Move the reducer and its types to `MapShell.state.ts` without changing
   action names, initial values, or reducer behavior.
6. Rename and move `HomeContext` to `MapShellContext` in
   `MapShell.context.ts`.
7. Rename and move `HomeTemplate` to `MapShellLayout` in
   `MapShell.layout.tsx`. Merge its styles into the owning `MapShell.scss`
   block rather than retaining a second layout stylesheet.
8. Rename `useLocation` to `useAppLocation`; preserve every pathname rule.
9. Keep the existing route topology and lazy-loading behavior exactly as-is.
10. Verify direct refreshes and navigation state for `/` and the map-only
    view because `MapShell` contains special first-navigation behavior.

The route table after this phase must remain behaviorally equivalent:

```text
/
├── index                         element: null
├── trips                        element: null
├── trip/:tripId                 element: null
├── places                       element: null
├── places/:filter               element: null
├── timeline                     lazy page element
├── stats                        lazy page element
├── gallery/:cityName/:travelIdx lazy route + loader
│   └── :photoIdx                lazy child + loader
└── *                            redirect to /trips
```

Exit gate: app composition lives under `app`, the entry point is small, and all
route behaviors match baseline.

### Phase 5: migrate gallery

Gallery is a good first feature because its route modules and loaders provide a
clear boundary.

1. Move Gallery, Lightbox, both SCSS files, and both loaders.
2. Rename loaders as listed so lazy imports remain unambiguous.
3. Move the image-cache hook only after confirming it has no non-gallery
   consumers.
4. Keep loader parameter parsing, error behavior, and loader-data shape
   unchanged.
5. Update lazy imports in `router.tsx` using `Promise.all` as today.
6. Confirm opening a photo, changing photos, full-screen behavior, browser
   back/forward, escape/close, and direct deep links.

Exit gate: gallery code has no legacy component imports and retains separate
lazy chunks.

### Phase 6: migrate stats

Stats is large but internally cohesive.

1. Move `StatsPage`, `StatsGrid`, cards, charts, rows, and styles together.
2. Move `useStatsData` and stats-only utilities after importer audits.
3. Keep generic-named `Card`, `Box`, and row foundations in stats unless a
   second non-stats semantic consumer is demonstrated.
4. Update local imports to same-feature relative paths and shared imports to
   `@/shared/...`.
5. Do not alter calculations, chart configuration, units, sorting, or
   localization while moving.
6. Compare every tile and chart with baseline data at desktop and mobile
   widths.

Exit gate: `features/stats` has no dependency on another feature, and every
stat value matches baseline.

### Phase 7: migrate top-level timeline

1. Move `TimelinePage` and `TimelineTrack` with SCSS.
2. Audit any calculation imported from trip utilities.
3. Extract only the smallest cross-feature query necessary, giving it a
   domain-specific name.
4. Preserve chronological ordering, trip selection navigation, empty state,
   and animation behavior.
5. Confirm that this feature does not absorb the trip-detail timeline.

Exit gate: timeline is independent of trips UI and its route chunk remains
lazy.

### Phase 8: migrate places

1. Move `PlacesBrowser`, `CityCard`, and `FilterByCountry` with styles.
2. Keep current filter route values `visited`, `lived`, and `future`.
3. Preserve delayed route updates and animation direction.
4. Preserve country sorting by current language.
5. Preserve height measurement, overflow calculation, city hover, and map
   positioning behavior.
6. Replace direct shell-context use only if the new interface is already
   available; otherwise use the documented temporary exception.

Exit gate: all three filters, country filtering, empty states, and map focus
match baseline.

### Phase 9: migrate trips

Split this into at least two PRs.

PR A — trip browser and trip detail shell:

1. move `TripBrowser`, `TripCard`, `TripDetail`, `TripDetailHero`, and
   `TravelSelector`;
2. move `trips.ts`, splitting cross-feature graph queries first if required;
3. preserve selected-trip synchronization for direct URL entry;
4. preserve group-by-year cutoff, panel measurement, overflow, and animations;
5. preserve trip selection and panel visibility behavior.

PR B — trip-detail timeline:

1. move all current `components/molecules/Timeline` files as one unit;
2. rename `Timeline` to `TripTimeline` and update its SCSS selectors only as
   needed for the new semantic name;
3. move `tripDetailTimeline.ts` and related offset calculations;
4. do not refactor the large calculation module during the move;
5. add characterization tests before any later simplification.

Exit gate: trip list, every trip detail, transport segments, stays, day trips,
gallery links, timezones, and hover behavior match baseline.

### Phase 10: migrate map

Move the map last because it integrates shell state, trips, places, and route
classification.

1. Move `Map`, its helper components, marker, overlay, tooltip, and all map
   libraries.
2. Preserve MapLibre CSS loading exactly once.
3. Preserve camera constants, zoom conversions, max bounds, theme creation,
   hover delay, pinned-tooltip behavior, and route bounds.
4. Resolve cross-feature trip query imports through shared/domain contracts,
   never a private trips import.
5. Pass selected trip and route state from the shell when practical. Do not
   introduce a map-owned copy of selected-trip state.
6. Preserve map lazy loading in the shell.
7. Compare map load, markers, route geometry, tooltip, panel padding, zoom
   controls, trip focus, and responsive behavior against baseline.

Exit gate: the map feature imports no other feature internals and all map
interactions match baseline.

### Phase 11: migrate navigation and narrow shell state

1. Move FloatingNav, language-selector UI, language flags, and dark-mode
   button.
2. Keep language/theme hooks shared because the shell and navigation both use
   them.
3. Replace the broad shell context with narrow hooks or props based on actual
   consumers. A suitable split is:
   - `shared/context/MapInteraction.context.ts`: hovered city, map position,
     selected trip, and their setters;
   - `shared/context/Panel.context.ts`: open/closed state and its setter;
   - theme/responsive state: shared hooks or read-only values passed by shell.
4. Keep providers in `MapShell`; shared context modules define only dependency-
   free types, contexts, and `useMapInteraction`/`usePanel` access hooks. They
   may import React and `@travelmap/core`, but never `app` or a feature.
5. Remove `activeView` if importer analysis proves route state fully replaces
   it. Do not remove it as part of a move-only commit.
6. Ensure context values are not duplicated and there remains one owner for
   each state value.
7. Remove `MapShell.context.ts` and the temporary feature-to-app import
   exception.

Exit gate: no feature imports `app/shell/MapShell.context.ts`, boundary rules are
fully enforced, and navigation behavior matches baseline.

### Phase 12: remove legacy roots and harden boundaries

1. Run `rg --files` under `components`, `hooks`, and `utils`.
2. Classify every remaining file; move it to a feature/shared owner or document
   why the legacy root must temporarily remain.
3. Delete only empty directories.
4. Change architecture warnings to errors.
5. Run a cycle check using existing tooling or a small read-only import audit.
6. Run Knip and remove exports made unused by relocation.
7. Update all documentation examples and paths.
8. Run the complete acceptance suite.

Exit gate: no legacy source root remains, no temporary lint exception remains,
and every file has one named owner.

## 9. Import migration rules

Use import changes to make ownership visible.

### 9.1 Within one feature

Prefer a relative import when the relationship stays inside one feature:

```ts
import { MapLayers } from "../Map/MapLayers";
import { getTripBounds } from "../../lib/mapCamera";
```

Use the shortest path that remains clear. Do not add a feature barrel.

### 9.2 From shared, data, i18n, assets, or core

Use the root alias or package name:

```ts
import { Button } from "@/shared/components/Button/Button";
import { visitedTrips } from "@/data/world";
import { useLanguage } from "@/shared/hooks/useLanguage";
import CalendarIcon from "@/assets/icons/Calendar.svg?react";
import { Trip } from "@travelmap/core";
```

### 9.3 Prohibited examples

The following imports are invalid, respectively, because they cross into
another feature's private UI, make shared code depend on app composition, and
hide a concrete dependency behind a barrel:

```ts
import { TripCard } from "@/features/trips/components/TripCard/TripCard";
import { MapShellContext } from "@/app/shell/MapShell.context";
import { Button } from "@/shared";
```

### 9.4 Move procedure for each file

For every move:

1. list all importers with `rg` before moving;
2. move the TSX/TS file and matching SCSS together;
3. update the component's stylesheet side-effect import;
4. update static imports;
5. update dynamic `import()` calls separately; they are easy to miss;
6. update type-only imports;
7. search for the old path and old exported symbol;
8. run import sorting through the established formatter/linter;
9. rename companion modules to the dot-qualified owner convention;
10. replace touched UI selectors with BEM and update every matching class name;
11. normalize vertical spacing and remove human-authored `//` or trailing
    comments;
12. inspect the diff for accidental behavior or style changes;
13. typecheck before moving the next tightly coupled group.

Do not combine mass search-and-replace with logic changes. On Windows, verify
case-only renames explicitly because the default filesystem may not record them
as expected.

## 10. Routing and lazy-loading preservation

The refactor must preserve route semantics and chunk boundaries.

- Keep `createHashRouter`; GitHub Pages/deployment assumptions depend on it.
- Keep panel routes as `element: null` while the persistent shell chooses the
  overlay.
- Keep Timeline and Stats as lazy route elements.
- Keep Gallery and Lightbox as lazy route modules with loaders.
- Keep the wildcard redirect and `replace` behavior.
- Keep the root shell's special `/` redirect/map-only navigation logic.
- Do not replace pathname classification with a routing redesign in the move
  PR. That can be proposed after this migration.
- Preserve `Suspense` placement and fallback variants to avoid changing
  loading geometry.
- Preserve Framer Motion keys; changing a key can change exit/entry behavior.

After moving each route module, test direct URL entry, in-app navigation,
back/forward, refresh, invalid parameters, and invalid routes.

## 11. State migration

### 11.1 State inventory

| State                          | Current owner              | Target owner                                                |
| ------------------------------ | -------------------------- | ----------------------------------------------------------- |
| dark theme                     | `Home` via theme hook      | shared theme hook, composed by shell                        |
| responsive viewport            | `Home` via responsive hook | shared responsive hook, composed by shell                   |
| hovered city                   | `HomeContext`              | map interaction contract owned by shell                     |
| map position                   | `HomeContext`              | map interaction contract owned by shell                     |
| selected trip                  | `HomeContext`              | shell-level route/map coordination                          |
| active view                    | `HomeContext`              | route-derived where possible; retain until proven redundant |
| panel open                     | `HomeContext`              | shell panel state                                           |
| places filter/countries/layout | `PlacesBrowser`            | places feature local state                                  |
| trip year/layout               | `TripBrowser`              | trips feature local state                                   |
| map loaded/pinned tooltip      | `Map`                      | map feature local state/refs                                |

### 11.2 Rules

- Do not introduce Redux, Zustand, or another store for a folder migration.
- Keep local state local.
- Do not duplicate route-derived state in a feature unless animation requires a
  temporary local transition value, as Places currently does.
- Keep the selected-trip synchronization effect until direct trip URLs are
  proven to update map overlays by another mechanism.
- Split context based on consumer sets, not arbitrary field count.
- Context hooks must throw a clear error when used outside their provider; do
  not spread non-null assertions through the final architecture.
- A context split is a behavior-sensitive PR and must not share a commit with
  mass file moves.

## 12. Data and domain boundaries

`data/world.ts` remains the only app module that eagerly reads authored JSON
and invokes `buildWorld()`.

It continues to expose:

- `visitedTrips`;
- `livedCities`;
- `futureCities`;
- `homeCity`;
- `visitedCities`;
- `visitedCountries`;
- `takenFlights`;
- `takenFerries`;
- `siteConfig`.

Rules:

1. Do not call `buildWorld()` separately inside features.
2. Do not import raw JSON directly from a feature.
3. Do not mutate exported graph collections.
4. Keep authored JSON typing at the data/core boundary.
5. Cross-feature graph queries should become domain-named functions in a
   shared query module only when at least two features require them.
6. Calculations that are intrinsic to `Trip`, `City`, `Country`, or `Travel`
   should be proposed for `@travelmap/core` in a separate PR with tests.
7. UI formatting and translation remain in the app.
8. The editor remains unaffected because no public-app path is exported to it.

## 13. Styling and asset migration

- Move every component SCSS file with its component.
- Enforce BEM in every touched stylesheet. The block is the owning component or
  cohesive feature in kebab case; elements use `&__element`; state/theme/device
  modifiers use `&--modifier`.
- Rename legacy generic or ownership-based selectors during the corresponding
  move (`.home` to `.map-shell`, `.fallback` to `.fallback-page`, `.centered`
  to an owned `__loading` element). Update TSX and SCSS in the same commit.
- Keep one primary stylesheet per component owner when companion components are
  part of the same block. For example, `MapShell.layout.tsx` shares
  `MapShell.scss`; it does not require `MapShell.layout.scss`.
- Use Sass nesting to keep the BEM structure visible. Keep declarations
  contiguous and put one blank line between sibling elements, modifiers, and
  block-specific media queries.
- Do not introduce unowned utility classes, chained elements, or modifier-only
  class values. Global platform/vendor/third-party selectors are the narrow
  exceptions defined by the coding standard.
- Keep the stylesheet side-effect import as the first import when required by
  the repository's import convention.
- Keep global partials under `styles`.
- Keep variables and mixins referenced through existing Sass paths; update only
  paths broken by relocation.
- Do not copy shared mixins into features.
- Do not turn SCSS into CSS Modules during this migration.
- Do not reorganize icons by feature in the initial sequence. Many icons are
  shared, and asset movement adds case-sensitivity and generated-import risk.
- Preserve `maplibre-gl/dist/maplibre-gl.css` loading exactly once.
- Check production asset URLs after build, especially country flags and Gallery
  media fallbacks.
- Compare focus, hover, reduced-motion, mobile, tablet, dark, and light states.

If a stylesheet contains only feature-specific selectors but imports a global
partial, it still stays with the component; using tokens does not make it
global.

## 14. Verification matrix

### 14.1 Automated checks for every application PR

Run from the repository root:

```powershell
pnpm check
```

Also run:

```powershell
pnpm build
```

The build is mandatory for this migration because paths, lazy imports, routing,
and production chunks are affected. Inspect every changed file before finish.

At intermediate points, focused commands may shorten feedback:

```powershell
pnpm --filter travel-map typecheck
pnpm --filter travel-map lint
pnpm --filter travel-map format:check
pnpm --filter travel-map knip
```

Focused checks do not replace the root final checks.

### 14.2 Route smoke tests

Test each route at desktop and mobile widths:

| Route                                | Required assertions                                                      |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `/#/`                                | expected redirect or explicit map-only behavior; map remains mounted     |
| `/#/trips`                           | latest year, year selection, trip cards, scrolling, empty state behavior |
| `/#/trip/<valid-id>`                 | detail content, route overlay, map fit/focus, panel close/reopen         |
| `/#/trip/<invalid-id>`               | existing fallback/error behavior is preserved                            |
| `/#/places`                          | default `visited` filter, cards, map hover/focus                         |
| `/#/places/visited`                  | visited cities and country filtering                                     |
| `/#/places/lived`                    | lived cities and empty state if applicable                               |
| `/#/places/future`                   | future cities and empty state if applicable                              |
| `/#/timeline`                        | ordering, dates, flags, trip navigation, scrolling                       |
| `/#/stats`                           | every tile/chart, localized values, responsive grid                      |
| `/#/gallery/<city>/<travel>`         | loader, media grid, close/back behavior                                  |
| `/#/gallery/<city>/<travel>/<photo>` | lightbox, next/previous, fullscreen, back/forward                        |
| unknown route                        | replace redirect to `/trips`                                             |

### 14.3 Cross-cutting interaction tests

- light/dark theme toggle;
- language selection and translated route content;
- mobile, tablet, and desktop shell classes;
- panel open/close and animation direction;
- map marker hover, keyboard activation, click pinning, escape close;
- route overlay visibility after direct trip navigation;
- map camera padding with panel open and closed;
- browser refresh and back/forward on every route family;
- loading fallback geometry under throttled network/CPU;
- no new console error, warning, failed fetch, or accessibility regression;
- keyboard traversal and visible focus;
- reduced-motion behavior;
- production build served through `pnpm --filter travel-map preview`.

### 14.4 Architecture checks

The final verification must prove:

```powershell
rg -n 'from ["'']@/components|from ["'']@/hooks|from ["'']@/utils' apps/travel-map/src
rg -n 'components/(atoms|molecules|organisms|pages|templates)' apps/travel-map/src
rg -n 'HomeContext|HomeTemplate' apps/travel-map/src
rg --files apps/travel-map/src/components apps/travel-map/src/hooks apps/travel-map/src/utils
```

Expected result: no legacy imports, symbols, or files. Adjust shell quoting if
needed; the intent is a zero-result audit.

## 15. Testing strategy

The repository currently has limited automated characterization for this app.
Introduce tests in proportion to migration risk, without blocking the first
move on a full test-suite rewrite.

### Before logic-bearing modules move

Add characterization tests for:

- `useAppLocation` pathname classification;
- trip grouping and graph-query helpers;
- trip-detail timeline segment construction;
- map camera conversions, bounds, and padding;
- map trip layover selection;
- stats aggregation and sorting;
- gallery/lightbox loader parameter handling;
- shell reducer transitions.

### Component integration priorities

Where the existing toolchain supports them, add tests for:

- shell route composition;
- direct trip URL syncing selected trip;
- Places filter-to-route transitions;
- Gallery/Lightbox nested routing;
- panel open/close behavior.

Tests must be colocated with the module they protect and move with it. If
Vitest or a DOM testing package must be introduced, do that in a dedicated
infrastructure PR before relying on the tests as a migration gate. Do not mix a
test-runner rollout into a feature move.

## 16. Pull-request and commit design

Recommended PR sequence:

1. architecture decision and canonical documentation;
2. characterization-test infrastructure, if approved;
3. shared visual primitives;
4. shared hooks/libraries and data rename;
5. app router/shell extraction;
6. gallery feature;
7. stats feature;
8. top-level timeline feature;
9. places feature;
10. trips browser/detail;
11. trip-detail timeline;
12. map feature;
13. navigation and context narrowing;
14. legacy-root removal and enforcement.

Each PR description must contain:

- the feature or boundary moved;
- explicit statement of behavior changes (`none` for move-only PRs);
- current-to-target paths;
- temporary exceptions introduced or removed;
- automated check results;
- routes manually tested;
- screenshots when layout-bearing files moved;
- bundle/chunk observations;
- rollback instructions.

Keep commits reviewable:

- one commit may perform pure `git mv` operations;
- a following commit may update imports;
- a following commit may perform approved semantic renames;
- logic changes belong in a separate PR unless required to break a dependency
  cycle and explicitly reviewed as such.

## 17. Rollback plan

Every phase must be revertible independently.

### Move-only PR rollback

Revert the PR. Because behavior and contracts did not change, no data migration
or compatibility layer should be needed.

### Boundary extraction rollback

1. revert consumers to the previous concrete module;
2. restore the previous file path;
3. remove the temporary boundary rule only if the old architecture requires
   it;
4. rerun `pnpm check` and `pnpm build`;
5. retest the affected routes.

### Stop conditions

Pause the sequence if any of the following occurs:

- a production route stops loading;
- a lazy chunk materially balloons without explanation;
- circular dependencies appear;
- two features require repeated private imports into each other;
- the migration requires changing raw data contracts;
- unrelated product work causes sustained merge conflicts;
- checks cannot return to the base branch's status within the current PR.

Do not stack more moves on a broken phase. Fix or revert it first.

## 18. Risks and mitigations

| Risk                                                    | Mitigation                                                                                 |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Mass import churn hides behavior changes                | move-only PRs, inspect diffs with whitespace ignored, separate semantic commits            |
| Dynamic imports are missed                              | search for both static imports and `import(`; production build every PR                    |
| Lazy chunk topology changes                             | record baseline chunks and preserve route-level imports                                    |
| Cross-feature cycles replace layer coupling             | enforce dependency direction and extract narrow shared/domain contracts                    |
| `shared` becomes a dumping ground                       | require multiple feature consumers or unambiguous technical semantics                      |
| Feature folders become mini atomic hierarchies          | use only `components`, `lib`, and meaningful subgroups; no atoms/molecules inside features |
| Broad shell context violates boundaries                 | allow one exact temporary exception, then narrow state in phase 11                         |
| Case-only asset/import failures on Linux                | avoid asset moves initially; verify production build                                       |
| Git history becomes hard to follow                      | use `git mv`, avoid simultaneous reformatting, keep rename-focused commits                 |
| Existing defects are mistaken for migration regressions | record baseline checks, console output, and screenshots                                    |
| Documentation contradicts code                          | update canonical guidelines first and final paths last                                     |

## 19. Definition of done

The migration is complete only when every item below is true:

- the documented trigger and architecture decision are approved;
- `CODING_GUIDELINES.md` describes the feature-based public-app structure;
- all public-app components have an `app`, `feature`, or `shared` owner;
- no atomic-design layer folders remain in `apps/travel-map/src`;
- no generic legacy `hooks` or `utils` roots remain;
- no barrels were introduced;
- every companion module uses the dot-qualified owner convention;
- every authored UI class follows BEM and every modifier is rendered with its
  base block;
- every simple alias type has mandatory one-line JSDoc;
- no touched source file contains a human-authored `//` comment, trailing
  comment, doubled blank line, or decorative vertical spacing;
- no feature imports another feature's private modules;
- `shared` imports no `feature` or `app` module;
- no feature imports the app shell context directly;
- route behavior and lazy-loading boundaries are preserved;
- the world graph is built once at `data/world.ts`;
- `@travelmap/core` remains app-independent;
- component SCSS remains colocated and global SCSS remains under `styles`;
- all temporary lint exceptions are removed;
- all old paths and old ambiguous symbols have zero `rg` results;
- `pnpm check` passes from the repository root;
- `pnpm build` passes from the repository root;
- every route and cross-cutting interaction in section 14 passes;
- the production preview has no new console errors or missing assets;
- every changed file has been inspected;
- the editor still typechecks/lints through the root checks despite not being
  migrated;
- the final PR updates README/path documentation and closes the tracking issue.

## 20. Post-migration work that must remain separate

After the feature migration is complete and stable, consider these independent
improvements:

- simplify the large trip-detail timeline calculation module with tests;
- replace pathname classification with more direct route-match APIs if it
  materially reduces code;
- move intrinsic trip statistics into `@travelmap/core`;
- improve runtime validation at the `buildWorld()` boundary;
- fix existing accessibility and reduced-motion gaps;
- evaluate whether context splitting improved measured rendering behavior;
- audit the editor separately using its own requirements.

None of these is required to prove that feature ownership works. Keeping them
separate preserves a clear answer to the migration's central question: did the
architecture change without changing the product?

## 21. Operator checklist

Use this condensed checklist for each migration PR:

- [ ] Read the latest `CODING_GUIDELINES.md` completely.
- [ ] Pull/rebase onto the current migration base.
- [ ] Confirm a clean or understood worktree.
- [ ] List all importers of every file being moved.
- [ ] Confirm the target owner and allowed dependencies.
- [ ] Move TypeScript and colocated SCSS together.
- [ ] Rename companion modules with an owner-qualified dot role.
- [ ] Update static, dynamic, relative, alias, and type-only imports.
- [ ] Convert touched UI selectors and TSX class names to BEM.
- [ ] Add one-line JSDoc to every simple alias and full JSDoc to shaped types.
- [ ] Remove human-authored `//`, trailing comments, and non-canonical vertical
      spacing.
- [ ] Preserve exported APIs unless the PR explicitly authorizes a rename.
- [ ] Search for old paths and symbols.
- [ ] Confirm no new cross-feature import or cycle.
- [ ] Run focused typecheck/lint during development.
- [ ] Run root `pnpm check`.
- [ ] Run root `pnpm build`.
- [ ] Inspect all changed files and the complete diff.
- [ ] Smoke-test affected routes at desktop and mobile sizes.
- [ ] Test dark/light theme, language, keyboard, and back/forward where relevant.
- [ ] Record checks, screenshots, chunks, and temporary exceptions in the PR.
- [ ] Include a one-PR revert procedure.
- [ ] Remove resolved exceptions before merging the final hardening PR.
