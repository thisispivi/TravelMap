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

## Getting Started

```bash
pnpm install
pnpm dev
```

The site runs at <http://localhost:5173> and the content editor at
<http://localhost:5174>.

**→ [Read the user guide](./docs/GUIDE.md)** for how to add trips and places,
process and attach photos, host images yourself or on a CDN, run the site with
Docker, and publish it.

## Repository

```text
.
├── apps
│   ├── travel-map          The public site
│   └── travel-map-editor   The content editor
├── packages
│   └── core                Shared domain model
├── scripts
│   └── uploader            Photo and video processing
├── docker                  Container for self-hosting
├── docs                    User guide
├── logos                   Project brand assets
├── data                    Your content (not in git)
└── media                   Your images (not in git)
```

`data/` and `media/` hold your personal content and are deliberately excluded
from git, so a fresh clone starts empty and the editor builds it up as you go.

## Contributing

- [`docs/GUIDE.md`](./docs/GUIDE.md) — how to use TravelMap.
- [`CODING_GUIDELINES.md`](./CODING_GUIDELINES.md) — the single source of truth
  for code style and engineering conventions.
- [`scripts/uploader/README.md`](./scripts/uploader/README.md) — uploader
  details.
- `AGENTS.md`, `CLAUDE.md`, and `.github/copilot-instructions.md` point Codex,
  Claude, and GitHub Copilot at those same guidelines.

Before committing, from the repository root:

```bash
pnpm check
```

That runs type checking, linting, formatting, unused-code analysis, and React
Doctor across the workspace. `pnpm build` additionally verifies the production
output. A Husky pre-commit hook checks staged files.

Dependency installs use pnpm's seven-day release quarantine. Audit JavaScript
dependencies with `pnpm --filter travel-map security:audit`, and the uploader's
Python pins with `uvx pip-audit -r scripts/uploader/requirements.txt`.
