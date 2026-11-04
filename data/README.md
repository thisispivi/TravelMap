# Dataset

This directory is the forkable source of truth for a TravelMap site. The public
app and local editor both bundle these JSON files at development and build time.

## Layout

- `site.config.json` holds branding, city roles, map defaults, and transport
  company metadata.
- `cities/<Code>/<City>/<City>.json` defines a city. `<Code>` is its country's
  ISO 3166-1 alpha-2 code, which the city's `countryId` repeats; countries
  themselves are built into `@travelmap/core`. The city's `id` is used in URLs
  and trip references, while `name` is the display name.
- `trips/<trip-id>.json` defines ordered stop and transport steps.
- `photos/<Country>/<City>/<manifest>.json`, with the country in words as on
  the CDN, contains media metadata referenced
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

`site.author` names the author in the site's page metadata. The About section
of the site's Settings page is written into the app rather than read from here.

Replace the favicon binaries in `apps/travel-map/public/` and
`packages/ui/src/assets/Logo.svg` to change the brand assets. The accent colours
are design tokens in `packages/ui/src/styles/_variables.scss`.
