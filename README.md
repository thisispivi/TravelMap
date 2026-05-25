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
- Tracks timeline and stats such as distance, transports, continents, countries, currencies, timezones, UNESCO sites, and media count.
- Supports English and Italian, light and dark themes, and mobile / desktop layouts.

## Stack

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![PNPM](https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=for-the-badge&logo=pnpm&logoColor=f69220) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54) ![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white) ![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

## Repository

```text
.
├── logos
├── scripts
│   └── uploader
└── travel-map
    ├── public
    └── src
```

- `travel-map` is the React application.
- `scripts`: Contains a folder with the scripts used to process and upload images/videos and generate the JSON file.
  - [Uploader](./scripts/uploader/README.md): generates compressed and thumbnail images from travel photos and videos. It uploads them to bunnyCDN and generates a JSON file with the metadata. This JSON file is then used by the React app to display the galleries.
- `logos` contains app and README logo assets.

## Local Development

```bash
cd travel-map
pnpm install
pnpm dev
```

Useful commands:

```bash
pnpm run lint
pnpm run build
pnpm run knip
```

## Deploy

```bash
cd travel-map
pnpm run deploygh
```
