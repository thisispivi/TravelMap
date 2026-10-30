# @travelmap/ui

What the site and the editor both render or configure the same way. There is
no build step: apps import the TypeScript and SCSS sources directly.

## Importing

Every module is imported by its own path; there is no barrel.

```ts
import { Dialog } from "@travelmap/ui/components/Dialog/Dialog";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { BaseMap } from "@travelmap/ui/map/components/BaseMap/BaseMap";
```

Stylesheets read the tokens with `@use "variables" as v;` and
`@use "mixins" as m;`: the Vite preset puts `src/styles` on Sass's load path.

## Contents

| Folder           | Holds                                                         |
| ---------------- | ------------------------------------------------------------- |
| `components/`    | NavRail, Button, Dialog, PanelFrame, PanelHeader, Popover, …  |
| `hooks/`         | useLanguage, useThemeDetector, useAnchoredMenu                |
| `lib/`           | classNames, focus, motion, anchor placement, storage, flags   |
| `i18n/`          | `initI18n`, supported locales, date and number formatting     |
| `map/`           | BaseMap, WorldLayers, RouteLines, ZoomControls; theme, routes |
| `styles/`        | Tokens, variables, mixins, global and typography styles       |
| `assets/`        | The logo, shared icons, and the country borders               |
| `public/`        | Flags, map glyphs, and the `common` translations              |
| `vite/preset.ts` | The Vite configuration both apps start from                   |

## The Vite preset

```ts
export default defineConfig(
  mergeConfig(sharedViteConfig(import.meta.dirname), {
    /* the app's own plugins, server and build settings */
  }),
);
```

It compiles React with React Compiler, imports SVGs as components with
`?react`, puts the shared styles on the Sass load path, maps `@/` to the app's
`src`, and serves `public/` beside the app's own public directory, in
development and in the build.

## Translations

`initI18n(["home", "error"])` starts i18next with the app's namespaces and the
shared `common` one, whose strings (transport modes, stay facts, navigation,
zoom) any component reads as `t("common:mode.plane")`.

## Tests

Tests run in jsdom with Testing Library; `vitest.setup.ts` gives jsdom the
modal dialogs it lacks.
