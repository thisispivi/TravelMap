# Dataset

This directory is the forkable source of truth for a TravelMap site. The public
app and local editor both bundle these JSON files at development and build time.

## Layout

- `site.config.json` holds branding, city roles, map defaults, and transport
  company metadata.
- `cities/<Country>/<Country>.json` defines a country. Its `id` is the stable
  reference key; `name` is the Natural Earth map join name.
- `cities/<Country>/<City>/<City>.json` defines a city. Its `id` is used in
  URLs and trip references, while `name` is the display name.
- `trips/<trip-id>.json` defines ordered stop and transport steps.
- `photos/<Country>/<City>/<manifest>.json` contains media metadata referenced
  by a trip stop's `photoPath` without the `.json` suffix.

In the trip editor, select a stay and choose its photo manifest, or import the
uploader's JSON directly from the same field. The stored `photoPath` links that
stay to the generated JSON below `photos/`.

Use `pnpm editor` from the repository root to edit the data locally. The editor
writes two-space JSON with a trailing newline and only accepts paths inside this
directory.

## Media and branding

Image paths are relative to `VITE_CDN_PATH`; they are not uploaded by the app or
editor. The repository `media/` folder mirrors those paths, so
`/Travels/Italy/Monza/001c.webp` lives at
`media/Travels/Italy/Monza/001c.webp`. The uploader takes the `/Travels` prefix
from `site.config.json`'s optional `media.root` setting and defaults to that
value when it is absent. Keep trip cover images under `/Trips/...`.

Replace the favicon binaries and `apps/travel-map/public/Logo.svg` to change the
brand assets. The primary accent colours intentionally remain in
`apps/travel-map/src/styles/_variables.scss`: keeping two CSS design tokens in
SCSS avoids a fragile JSON-to-SCSS build pipeline.
