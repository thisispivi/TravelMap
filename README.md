<div align="center">
   <div style="display: flex;padding-block:40px;margin-bottom:20px;background-color:#1f1f1f">
      <picture>
         <source media="(prefers-color-scheme: dark)" srcset="./logos/logo_dark.png">
         <source media="(prefers-color-scheme: light)" srcset="./logos/logo_light.png">
         <img alt="TravelMap logo" src="./logos/logo_dark.png" height="75">
      </picture>
   </div>
</div>

# [TravelMap](https://map.pivi.dev/)

TravelMap is my personal travel archive: an interactive map, trip browser, photo gallery, timeline, and stats dashboard built around the places I have visited, lived in, or plan to visit.

The live app is available at [map.pivi.dev](https://map.pivi.dev/).

## What It Does

- Shows visited, lived, and future cities on an interactive world map.
- Draws trip routes and opens city tooltips directly from the map.
- Groups trips by year, with detail pages for route, dates, duration, and cities.
- Displays city photo galleries with a full-screen lightbox.
- Tracks timeline and stats: distance, transport mode rankings with km, airline and ferry company rankings, continents, countries, currencies, timezones, UNESCO sites, and media count.
- Supports English and Italian, light and dark themes, and mobile / desktop layouts.

## Stack

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![PNPM](https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=for-the-badge&logo=pnpm&logoColor=f69220) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54) ![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white) ![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

## Repository

```text
.
├── .github
│   └── copilot-instructions.md
├── AGENTS.md
├── CLAUDE.md
├── CODING_GUIDELINES.md
├── apps
│   ├── travel-map
│   └── travel-map-editor
├── packages
│   └── core
├── docker
├── logos
├── media
├── scripts
│   └── uploader
└── data
```

- `apps/travel-map` is the public React application.
- `apps/travel-map-editor` is the companion content-authoring application.
- `packages/core` contains the shared `@travelmap/core` domain model.
- `scripts`: Contains a folder with the scripts used to process and upload images/videos and generate the JSON file.
  - [Uploader](./scripts/uploader/README.md): generates compressed and thumbnail images from travel photos and videos, sends them to BunnyCDN or local `media/`, and exports gallery metadata for the React app.
- `logos` contains app and README logo assets.
- [`CODING_GUIDELINES.md`](./CODING_GUIDELINES.md) is the single source of truth for code style and engineering conventions.
- `AGENTS.md`, `CLAUDE.md`, and `.github/copilot-instructions.md` configure Codex, Claude, and GitHub Copilot to follow those same guidelines for every code file.

## Local Development

```bash
pnpm install
pnpm dev
```

## Self-hosting images

Set `media.root` in `data/site.config.json` when you want a path prefix other
than `/Travels`. Process a city locally from `scripts/uploader/` with:

```bash
python main.py -c Monza -C Italy --local
```

The uploader writes optimized files below
`media/Travels/Italy/Monza/`, skips BunnyCDN, and still produces
`scripts/uploader/Monza.json`. Import that manifest from the trip stop in the
editor; the editor names and places it from the stop's city and dates.

For local development, set `VITE_CDN_PATH="/media"` in
`apps/travel-map/env/.env` and restart `pnpm dev`. Leave the committed Bunny
host value in place to use the hosted delivery path instead.

Run the public app and mount `media/` read-only with Docker:

```bash
docker compose -f docker/compose.yml up --build
```

The site is available at `http://localhost:8080`. Media added to the mounted
folder is served immediately without rebuilding the image.

Useful commands:

```bash
pnpm run check
pnpm run lint
pnpm run format
pnpm run build
pnpm run knip
pnpm run security:audit
```

`pnpm run check` runs TypeScript checking, ESLint with zero warnings, a Prettier
formatting check, unused-code analysis, and React Doctor. Run it before
committing. The Husky pre-commit hook also checks staged TypeScript, TSX,
JavaScript, styles, markup, and data files.

ESLint uses `eslint-plugin-jsdoc` to enforce the canonical documentation
layout, including component titles, declaration spacing, typed parameters,
documented destructured props, return values, and documentation for every
named function, class, method, type, interface, and enum.

Dependency installation uses pnpm's seven-day release quarantine. Only
time-sensitive security patches are exempted, and the single transitive
override replaces vulnerable legacy `brace-expansion` releases. Run
`pnpm run security:audit` for the JavaScript dependency audit. The uploader's
Python pins can be checked with
`uvx pip-audit -r scripts/uploader/requirements.txt` from the repository root.

## Deploy

```bash
pnpm --filter travel-map deploygh
```
