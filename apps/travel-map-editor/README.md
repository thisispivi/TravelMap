# Travel Map editor

The editor is the local authoring surface for the JSON documents under
`data/`. It runs beside the public map and writes through Vite's local-only
middleware; it is not intended to be deployed.

## The shell

The editor is built like the site: one map fills the window, the navigation
rail runs down its left edge, and every screen opens in a frosted panel
beside the map. `app/shell/EditorShell.tsx` lays this out and keeps the map
mounted while the panel changes; each screen tells the map what to draw
through `useMapScene` (`shared/context/MapScene.context.tsx`), and the map
hands presses on its pins, rides and empty ground back to that screen.

| Route                   | Screen                                                 |
| ----------------------- | ------------------------------------------------------ |
| `/`                     | Every trip, by year, with search and a new-trip dialog |
| `/trip/:id`             | One trip, edited on its itinerary and drawn on the map |
| `/places`               | Every place by country, like the site's Places tab     |
| `/places/cities/:id`    | One city; pressing the map moves it                    |
| `/places/countries/:id` | One country and its cities                             |
| `/companies`            | Transport operators, with their rides on the map       |
| `/settings`             | Site, locales, map defaults, and backups               |

`app/routing/EditorRoutes.tsx` maps these routes to screens. The editor uses
plain URLs (`BrowserRouter`) because it only ever runs on its dev server,
unlike the statically hosted site.

## What it shares with the site

Everything both apps draw comes from `@travelmap/ui`: the rail, buttons,
dialogs, panel headers, the map base and its route lines, the design tokens,
the translations' `common` namespace, the flags and the map glyphs. The domain
model, schemas and validation come from `@travelmap/core`. The editor keeps
only what is about authoring: its forms, the itinerary, the document store,
and the dev-server middleware in `vite/`.

## Folders

```text
src/
  app/        EditorShell and EditorRoutes
  features/   trips, places, companies, settings, map, palette
  shared/     Components, hooks and logic several features use: fields,
              combobox, date picker, the add-place dialog, place creation,
              search, the trip scene, autosave
  data/       The document store, snapshots, paths, and response parsing
vite/         Local-only middleware: data and asset writes, the city
              gazetteer, media uploads, snapshots
```

A feature never imports another feature; what two features need lives in
`shared/` or `data/`, and lint enforces it as it does for the site.

## Saving

Every screen autosaves through `useAutosave`, which publishes its state to
`SaveStatusContext`; the shell renders the one save chip, with a retry after a
failed write. Undo and redo cover the trip workspace, and backups are taken
and restored from Settings.

## Verification

From the repository root, run `pnpm check` after editor changes, and
`pnpm build` whenever shared tokens, public assets, dependencies,
configuration, or production output may be affected.
