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
TypeScript, and MapLibre. Travel Map combines an interactive public website with
a local visual editor for creating trips, managing places, attaching photos,
validating data, and preparing a static site for the web.

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![pnpm](https://img.shields.io/badge/pnpm-%23F69220.svg?style=for-the-badge&logo=pnpm&logoColor=white) ![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![React Router](https://img.shields.io/badge/react_router-CA4245.svg?style=for-the-badge&logo=react-router&logoColor=white) ![MapLibre](https://img.shields.io/badge/maplibre-396CB2.svg?style=for-the-badge&logo=maplibre&logoColor=white) ![i18next](https://img.shields.io/badge/i18next-26A69A.svg?style=for-the-badge&logo=i18next&logoColor=white) ![Framer Motion](https://img.shields.io/badge/framer_motion-0055FF.svg?style=for-the-badge&logo=framer&logoColor=white) ![ApexCharts](https://img.shields.io/badge/apexcharts-008FFB.svg?style=for-the-badge&logoColor=white) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![Python](https://img.shields.io/badge/python-3670A0.svg?style=for-the-badge&logo=python&logoColor=ffdd54) ![ESLint](https://img.shields.io/badge/eslint-4B3263.svg?style=for-the-badge&logo=eslint&logoColor=white) ![Prettier](https://img.shields.io/badge/prettier-F7B93E.svg?style=for-the-badge&logo=prettier&logoColor=black) ![Sass](https://img.shields.io/badge/sass-CC6699.svg?style=for-the-badge&logo=sass&logoColor=white) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) ![Docker](https://img.shields.io/badge/docker-2496ED.svg?style=for-the-badge&logo=docker&logoColor=white) ![Nginx](https://img.shields.io/badge/nginx-009639.svg?style=for-the-badge&logo=nginx&logoColor=white) ![GitHub Pages](https://img.shields.io/badge/github_pages-222222.svg?style=for-the-badge&logo=github&logoColor=white)

The [live demo](https://map.pivi.dev/) shows one completed map. A fresh clone
starts empty and is ready for your own trips, places, and media. Read the
[user guide](./docs/GUIDE.md) for the complete setup and authoring workflow.

## Tech Stack

- **Public app**: React 19, React Router, MapLibre GL, React Map GL, ApexCharts,
  React Image Gallery, and React Photo Album.
- **Editor**: React 19, DnD Kit, Downshift, Fuse.js, Framer Motion, MapLibre GL,
  and continuous dataset validation.
- **Shared model**: TypeScript domain classes, schemas, parsing, and validation
  in the `@travelmap/core` workspace package.
- **Data**: Portable JSON documents for settings, countries, cities, trips,
  photo manifests, and transport companies.
- **Styling**: SCSS, PostCSS, shared design tokens, responsive layouts, and
  light/dark themes.
- **Internationalization**: i18next and react-i18next with English and Italian
  interfaces and support for additional authored locales.
- **Media tools**: Python, Pillow, optional ffmpeg video thumbnails, local media
  output, and optional BunnyCDN uploads.
- **Build system**: Vite, TypeScript, pnpm workspaces, and Node.js 22.
- **Hosting**: Static files, GitHub Pages, or Docker with Nginx.
- **Quality**: ESLint, Prettier, Knip, React Doctor, and repository-level type
  checking.

## What Travel Map includes

### A public travel site

- An interactive world map with visited, lived-in, future, and home cities.
- Trip routes, transport legs, city tooltips, and detailed itineraries.
- Browsable trips and places, grouped into useful views.
- Photo galleries and a full-screen lightbox.
- A chronological timeline and travel statistics for distance, transport,
  countries, continents, currencies, time zones, companies, UNESCO sites, and
  media.
- Responsive mobile and desktop layouts, light and dark themes, and English and
  Italian interfaces.

### A local content editor

- Create and edit trips through a visual itinerary workspace.
- Search a worldwide city database or add a place from a Google Maps link.
- Add stops, layovers, dates, transport modes, airlines, ferries, and logos.
- Import GPX, KML, GeoJSON, CSV, JSON, and plain-text itineraries.
- Validate the complete dataset and apply guided fixes before publishing.
- Configure branding, locales, map defaults, media paths, and travel categories.
- Autosave changes to disk and create or restore local backups.

The editor is an authoring tool for your machine; it is not part of the
published site. Visitors receive only the generated static application and the
media you choose to host.

### A media workflow

The optional Python uploader prepares photos and video thumbnails for the web.
Media can be served from the included local `media/` directory or from a CDN
such as BunnyCDN. See [Adding photos](./docs/GUIDE.md#6-adding-photos) for the
complete workflow.

## How it works

1. Run the editor locally and describe your trips, places, and site settings.
2. The editor stores your content as portable JSON documents under `data/`.
3. Travel Map validates and compiles those documents into the public app.
4. `pnpm build` produces a static site under `apps/travel-map/dist/`.
5. Serve that directory from a static host, GitHub Pages, or Docker.

There is no production database, account system, or application server. Your
content stays in files you control.

## Getting Started

You need [Node.js](https://nodejs.org/) 22.22 or newer and
[pnpm](https://pnpm.io/) 11.18 or newer.

```bash
git clone https://github.com/thisispivi/TravelMap.git
cd TravelMap
pnpm install
pnpm dev
```

Open the two local applications:

| Address                 | Application                                     |
| ----------------------- | ----------------------------------------------- |
| <http://localhost:5173> | Your public Travel Map                          |
| <http://localhost:5174> | The local editor used to create and manage data |

Start in the editor, open **Settings** to name the site, then create your first
trip. Changes autosave into `data/` and appear in the public app after a reload.

For the complete first-run walkthrough, read the
[Travel Map user guide](./docs/GUIDE.md).

## Deployment

### Static hosting

Build the production application:

```bash
pnpm build
```

The deployable output is written to `apps/travel-map/dist/`. Upload that folder
to any static hosting service. Travel Map uses hash-based routing, so it does
not require server-side route handling.

Photos are hosted separately from the application bundle. Set `VITE_CDN_PATH`
in `apps/travel-map/env/.env` to the URL or path that serves your media before
building. See [Choosing where photos are served from](./docs/GUIDE.md#7-choosing-where-photos-are-served-from)
for local and CDN examples.

### GitHub Pages

Publish the site directly to the repository's `gh-pages` branch:

```bash
pnpm --filter travel-map deploygh
```

Read [Publishing to GitHub Pages](./docs/GUIDE.md#13-publishing-to-github-pages)
before deploying, especially if your map includes photos.

### Docker

The included Compose project builds Travel Map and serves it through Nginx:

```bash
docker compose -f docker/compose.yml up --build
```

Open <http://localhost:8080>. The local `media/` directory is mounted read-only
inside the container, so adding or replacing a photo does not require a rebuild.
Changes to trips, cities, or settings do require rebuilding because `data/` is
compiled into the static site.

See [Running the finished site with Docker](./docs/GUIDE.md#12-running-the-finished-site-with-docker)
for details.

## Your data stays yours

Personal content is deliberately separate from the application source:

- `data/` contains site settings, places, trips, photo manifests, and logos.
- `media/` contains self-hosted photos and video thumbnails.
- `.data-snapshots/` contains editor backups.

These directories are excluded from git, so personal travel history and media
are not accidentally committed when you update or share the application. Back
them up independently; editor snapshots cover authored data but not the media
files themselves.

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

## Project Structure

```text
.
├── apps/
│   ├── travel-map/          Public static site
│   └── travel-map-editor/   Local visual editor
├── packages/core/           Shared travel model and validation
├── data/                    Your authored content (gitignored)
├── media/                   Your self-hosted media (gitignored)
├── scripts/uploader/        Photo and video preparation tools
├── docker/                  Nginx image and Compose configuration
└── docs/                    User documentation
```
