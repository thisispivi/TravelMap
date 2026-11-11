<div align="center">
  <div style="display: flex; padding-block: 40px; margin-bottom: 20px; background-color: #1f1f1f">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./logos/logo_dark.png">
      <source media="(prefers-color-scheme: light)" srcset="./logos/logo_light.png">
      <img alt="Travel Map logo" src="./logos/logo_dark.png" height="75">
    </picture>
  </div>
</div>

# [Travel Map](https://map.pivi.dev/)

A self-hosted travel archive and publishing application built with React,
TypeScript, and MapLibre. It has two parts: an interactive public website, and
a local visual editor where you create trips, manage places, attach photos,
validate the data, and prepare the static site for the web.

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![pnpm](https://img.shields.io/badge/pnpm-%23F69220.svg?style=for-the-badge&logo=pnpm&logoColor=white) ![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![React Router](https://img.shields.io/badge/react_router-CA4245.svg?style=for-the-badge&logo=react-router&logoColor=white) ![MapLibre](https://img.shields.io/badge/maplibre-396CB2.svg?style=for-the-badge&logo=maplibre&logoColor=white) ![i18next](https://img.shields.io/badge/i18next-26A69A.svg?style=for-the-badge&logo=i18next&logoColor=white) ![Framer Motion](https://img.shields.io/badge/framer_motion-0055FF.svg?style=for-the-badge&logo=framer&logoColor=white) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![Python](https://img.shields.io/badge/python-3670A0.svg?style=for-the-badge&logo=python&logoColor=ffdd54) ![ESLint](https://img.shields.io/badge/eslint-4B3263.svg?style=for-the-badge&logo=eslint&logoColor=white) ![Prettier](https://img.shields.io/badge/prettier-F7B93E.svg?style=for-the-badge&logo=prettier&logoColor=black) ![Sass](https://img.shields.io/badge/sass-CC6699.svg?style=for-the-badge&logo=sass&logoColor=white) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) ![Vitest](https://img.shields.io/badge/vitest-6E9F18.svg?style=for-the-badge&logo=vitest&logoColor=white) ![Zod](https://img.shields.io/badge/zod-3E67B1.svg?style=for-the-badge&logo=zod&logoColor=white) ![Docker](https://img.shields.io/badge/docker-2496ED.svg?style=for-the-badge&logo=docker&logoColor=white) ![Nginx](https://img.shields.io/badge/nginx-009639.svg?style=for-the-badge&logo=nginx&logoColor=white) ![GitHub Pages](https://img.shields.io/badge/github_pages-222222.svg?style=for-the-badge&logo=github&logoColor=white)

The [live demo](https://map.pivi.dev/) shows one completed map. A fresh clone
starts empty, with no trips, places, or media. The [user guide](./docs/GUIDE.md)
covers the full setup and authoring workflow.

## Tech Stack

- **Public app**: React 19, React Router, MapLibre GL, React Map GL, Framer
  Motion, Lucide icons, and React Photo Album.
- **Editor**: React 19, Downshift, Fuse.js, Framer Motion, MapLibre GL, sharp
  for photo encoding, and continuous dataset validation.
- **Shared model**: TypeScript domain classes, schemas, parsing, and validation
  in the `@travelmap/core` workspace package.
- **Data**: Portable JSON documents for settings, countries, cities, trips,
  photo manifests, and transport companies.
- **Styling**: SCSS, PostCSS, shared design tokens, responsive layouts, and
  light/dark themes.
- **Internationalization**: i18next and react-i18next with English and Italian
  interfaces and support for additional authored locales.
- **Media tools**: the editor's built-in uploader (sharp), or the standalone
  Python uploader (Pillow); optional ffmpeg video thumbnails, local media
  output, and optional BunnyCDN uploads.
- **Build system**: Vite, TypeScript, pnpm workspaces, and Node.js 22.
- **Hosting**: Static files, GitHub Pages, or Docker with Nginx.
- **Quality**: ESLint, Prettier, Vitest, Knip, React Doctor, and
  repository-level type checking.

## Features

### Public site

- An interactive world map with visited, lived-in, future, and home cities.
- Trip routes, transport legs, city tooltips, and detailed itineraries.
- Trip and place lists, grouped into views.
- Photo galleries and a full-screen lightbox.
- A chronological timeline, and travel statistics for distance, transport,
  countries, continents, currencies, time zones, companies, UNESCO sites, and
  media.
- A passport page: a booklet with an original stamp for every country on the
  map, inked for the ones you have entered.
- Responsive mobile and desktop layouts, light and dark themes, and English and
  Italian interfaces.

### Local editor

- Create and edit trips in a visual itinerary workspace.
- Search a worldwide city database or add a place from a Google Maps link.
- Add stops, layovers, dates, transport modes, airlines, ferry, bus and taxi
  companies, and logos.
- Import GPX, KML, GeoJSON, CSV, JSON, and plain-text itineraries.
- Validate the complete dataset and apply guided fixes before publishing.
- Configure branding, locales, map defaults, media paths, and travel categories.
- Autosave changes to disk and create or restore local backups.

The editor runs only on your machine and is not part of the published site.
Visitors receive the generated static application and whatever media you
choose to host.

### Media

The editor's **Upload photos** button encodes photos and video thumbnails for
the web and adds them to the trip's gallery. The standalone Python uploader in
`scripts/uploader/` does the same from the command line. Media can be served
from the included local `media/` directory or from a CDN such as BunnyCDN. See
[Adding photos](./docs/GUIDE.md#6-adding-photos) for the full workflow.

## How it works

1. Run the editor locally and describe your trips, places, and site settings.
2. The editor stores your content as portable JSON documents under `data/`.
3. Travel Map validates and compiles those documents into the public app.
4. `pnpm build` produces a static site under `apps/travel-map/dist/`.
5. Serve that directory from a static host, GitHub Pages, or Docker.

There is no production database, account system, or application server; all
content is in files on disk.

## Getting Started

You need [Node.js](https://nodejs.org/) 22.22 or newer and
[pnpm](https://pnpm.io/) 11.18 or newer.

```bash
git clone https://github.com/thisispivi/TravelMap.git
cd TravelMap
pnpm install
cp apps/travel-map/env/.env.example apps/travel-map/env/.env
pnpm dev
```

This starts two local applications:

| Address                 | Application                                     |
| ----------------------- | ----------------------------------------------- |
| <http://localhost:5173> | Your public Travel Map                          |
| <http://localhost:5174> | The local editor used to create and manage data |

Start in the editor: open **Settings** to name the site, then create your first
trip. Changes autosave into `data/` and appear in the public app after a reload.

The [Travel Map user guide](./docs/GUIDE.md) has the full first-run
walkthrough.

### Data and backups

Your content is kept apart from the application source:

- `data/` contains site settings, places, trips, photo manifests, and logos.
- `media/` contains self-hosted photos and video thumbnails.
- `.data-snapshots/` contains editor backups.

All three directories are gitignored, so your travel history and media are not
committed when you update or share the application. Back them up yourself:
editor snapshots cover authored data but not the media files.

## Development checks

Run the repository-wide quality gate before pushing:

```bash
pnpm check
pnpm build
```

`pnpm check` runs type checking, linting, formatting, unit tests, and dead-code
analysis (knip) across every workspace project, plus React Doctor for both apps
and the dependency vulnerability audit. Git hooks run staged-file checks before
commits and the full suite before pushes, and CI repeats the same checks.

For uploader changes, run these from `scripts/uploader/` with its virtual
environment active:

```bash
python -m compileall -q .
python -m unittest discover -p "test_*.py"
```

### Runtime validation

Authored JSON is untrusted. `@travelmap/core` owns the Zod schemas for
countries, cities, trips, photo manifests, and site configuration, and
`buildWorld()` is the one place the dataset is parsed. A malformed document
fails the build and names the field, instead of showing up as a blank panel.
The other validated boundaries are route parameters and router history state,
the editor's local endpoints (request bodies, query strings, and its upload
settings in `.env`), the responses the editor reads back, `localStorage`, and
build-time environment variables.

Parse new external data at its entry point, infer the TypeScript type from the
owning schema instead of declaring it twice, and keep authorization separate
from shape validation. Values that never leave the application do not need
another layer.

[CODING_GUIDELINES.md](./CODING_GUIDELINES.md) is the canonical standard for
everything else: architecture, naming, state, styling, accessibility, testing,
and what the tooling enforces for you.

## Deployment

### Static hosting

Build the production application:

```bash
pnpm build
```

The output is written to `apps/travel-map/dist/`. Upload that folder to any
static hosting service. Travel Map uses hash-based routing, so the server needs
no route handling.

Photos are hosted separately from the application bundle. Copy
`apps/travel-map/env/.env.example` to `apps/travel-map/env/.env`, then set
`VITE_CDN_PATH` to the URL or path that serves your media before building. See
[Choosing where photos are served from](./docs/GUIDE.md#7-choosing-where-photos-are-served-from)
for local and CDN examples.

### GitHub Pages

Publish the site to the repository's `gh-pages` branch from your machine:

```bash
pnpm --filter travel-map deploygh
```

The deploy refuses to run unless `main` is clean, in sync with `origin/main`,
and its version has already been tagged by the Release workflow, so the live
site always matches a release.

Read [Publishing to GitHub Pages](./docs/GUIDE.md#13-publishing-to-github-pages)
before deploying, especially if your map includes photos.

### Docker

The included Compose project builds Travel Map and serves it through Nginx:

```bash
docker compose -f docker/compose.yml up --build
```

Open <http://localhost:8080>. The local `media/` directory is mounted read-only
inside the container, so adding or replacing a photo does not require a rebuild.
Changes to trips, cities, or settings do require a rebuild because `data/` is
compiled into the static site.

See [Running the finished site with Docker](./docs/GUIDE.md#12-running-the-finished-site-with-docker)
for details.

## Versioning and releases

Releases are automatic and follow [Semantic Versioning](https://semver.org/).
Every pull request that changes code bumps the version in
`apps/travel-map/package.json`, as
[AGENTS.md](./AGENTS.md#versioning-and-releases) describes. When CI passes on
`main`, the Release workflow tags the new version and publishes the
[GitHub release](https://github.com/thisispivi/TravelMap/releases). Then
`pnpm --filter travel-map deploygh` publishes the site from a clean, released
`main`. Dependabot alerts and security updates are on, and the
`fix-vulnerabilities` skill triages them.

## Documentation

| Guide                                              | Covers                                                                                    |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [User guide](./docs/GUIDE.md)                      | Installation, editor workflow, trips, places, photos, validation, backups, and publishing |
| [Create a trip](./docs/GUIDE.md#5-creating-a-trip) | Stops, transport legs, layovers, and future trips                                         |
| [Add photos](./docs/GUIDE.md#6-adding-photos)      | Photo processing, manifests, local media, and CDN uploads                                 |
| [Site settings](./docs/GUIDE.md#9-site-settings)   | Branding, languages, map defaults, city roles, and statistics                             |
| [Dataset reference](./data/README.md)              | The portable files created by the editor and how they are organized                       |
| [Uploader reference](./scripts/uploader/README.md) | Image processing, video thumbnails, and BunnyCDN configuration                            |
| [Editor notes](./apps/travel-map-editor/README.md) | Editor architecture and behavior for contributors                                         |
| [Coding guidelines](./CODING_GUIDELINES.md)        | The canonical coding standard, and what `pnpm check` enforces automatically               |

## Project Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for how the pieces fit together.

```text
.
├── apps/
│   ├── travel-map/          Public static site
│   └── travel-map-editor/   Local visual editor
├── packages/
│   ├── core/                Shared travel model and validation
│   └── ui/                  Shared components, styles, map and Vite preset
├── data/                    Your authored content (gitignored)
├── media/                   Your self-hosted media (gitignored)
├── scripts/uploader/        Photo and video preparation tools
├── docker/                  Nginx image and Compose configuration
└── docs/                    User documentation
```

## Credits

Country flags are from [Twemoji](https://github.com/jdecked/twemoji) (v17.0.3),
© Twitter, Inc and other contributors, licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Only their file names
were changed.
