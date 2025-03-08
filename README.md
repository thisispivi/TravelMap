<div align="center">
   <div style="display: flex;padding-block:40px;margin-bottom:20px;background-color:#1f1f1f">
      <picture>
         <source media="(prefers-color-scheme: dark)" srcset="./logos/logo_dark.png">
         <source media="(prefers-color-scheme: light)" srcset="./logos/logo_light.png">
         <img alt="logo" src="./logos/logo_dark.png" height="75">
      </picture>
   </div>
</div>

# [TravelMap](https://map.pivi.dev/)

Travel Map is a web app I’m building to track my travels and document the places I’ve visited. It features an interactive map with markers for past trips and future destinations, creating a visual log of my journeys. Each visited location includes a dedicated photo gallery with images and videos, making it easy to relive and share my experiences. The project is available at this [link](https://map.pivi.dev/)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54) ![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white) ![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

## Project structure

```text
.
├── logos
├── scripts
└── travel-map
```

- `logos`: Contains all the assets used in the app.
- `scripts`: Contains two folders:
  - [Photo Setup](./scripts/photos-setup/README.md): generates compressed and thumbnail images from travel photos.
  - [JSON Generator](./scripts/json-generator/README.md): creates a JSON file that maps travels and their associated images for each city, using the processed images. This JSON file powers the Travel Map app.
- `travel-map`: houses the React app for the Travel Map project.

## How to use it

1. Clone the repository

   ```bash
   git clone https://github.com/thisispivi/TravelMap.git
   ```

2. Navigate to the `travel-map` folder

   ```bash
   cd travel-map
   ```

3. Install the dependencies with:

   ```bash
   npm install
   ```

4. Run the app with
   ```bash
   npm start
   ```

## How to deploy

1. Navigate to the `travel-map` folder

   ```bash
   cd travel-map
   ```

2. Run the deploy command
   ```bash
   npm run deploy
   ```
