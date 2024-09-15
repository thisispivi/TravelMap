<div style="display: flex;padding-block:40px;margin-bottom:20px;background-color:#1f1f1f">
   <img src="./logos/Pivi Travel Logo Alt Dark Mode.png" style="vertical-align: top;height:50px;margin:auto" />
</div>

# TravelMap

Travel Map is a web app I’m building to keep track of my travels and the places I’ve visited. It features an interactive map with markers for each location I’ve been to and future destinations I want to explore, creating a visual log of my journeys. For each visited place, there’s a photo gallery with images and videos that helps me document my adventures and share the experiences visually!

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54) ![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white) ![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white)

## Project structure

```text
.
├── logos
├── scripts
└── travel-map
```

- `logos`: Contains all the assets used in the app.
- `scripts`: Contains the Python two folders:
  - [Photo Setup](./scripts/photos-setup/README.md): given the photos of a travel, it generates the compressed and thumbnail images.
  - [JSON Generator](./scripts/json-generator/README.md): given the compressed and thumbnail images, it generates the JSON file that maps out the travels and their associated images for a particular city. This JSON file is used by the Travel Map app.
- `travel-map`: Contains the React app for the Travel Map project.

## How to use it

1. Clone the repository
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
