# JSON Travel generator for Travel Map

This Python script automates the generation of a JSON file that can be used within the Travel Map project. The script is designed to work with a collection of travel photos taken in a specific city, organizing them into a JSON structure that aligns with the web application's data model.

In the Travel Map web app, each city contains a list of travels, and each travel includes a set of photos. For each photo in a travel, the web app requires two versions: the original image and a corresponding thumbnail. The thumbnails can be generated using the Image Resizer tool available in Windows.

This script simplifies the process by generating the necessary JSON file that maps out the travels and their associated images for a particular city, ensuring compatibility with the Travel Map project's structure.

# Index

## 1. Preparation

Before generating the JSON file, ensure that the photos are organized correctly and that Python 3 is installed on your system. Follow the steps below to prepare for generating the JSON file.

### 1.1. Folder Preparation

Create a folder with the name of the city inside the `photos` directory. This folder should contain the city's photos, with the following naming conventions:

- **Original photos:** Named as `<number>.jpg` (e.g., `001.jpg`, `002.jpg`).
- **Thumbnails:** Named as `<number>t.jpg` (e.g., `001t.jpg`, `002t.jpg`).

Here, `<number>` represents the photo number.

### 1.2. CDN Path

Obtain the CDN path where the photos will be uploaded. This path should point to the root folder containing the photos.

For example, if you have a `TravelMap` folder on your CDN with a subfolder for each city, the base path might look like this:

```
https://example.com/TravelMap/
```

## 2. Usage

To generate the JSON file, run the following command:

```bash
python3 travel_generator.py -c <city_name> -p <cdn_base_folder_path>
```

where `<city_name>` is the name of the city and `<cdn_base_folder_path>` is the base path to the root folder of the photos.

## 3. Output

The script will generate a JSON file in the `root` folder with the name `<city_name>.json`.

## 4. Usage in the Travel Map project

To integrate the generated JSON file with the Travel Map project, follow these steps:

1. Navigate to the `data` folder in the Travel Map project.
2. Create a folder named after the city (if it doesn't already exist).
3. Inside the city folder, create a photos folder (if it doesn't already exist).
4. In the photos folder, create a TypeScript `.ts` file.
5. Import the `Image` type from the core root folder. The import should look like this:

```typescript
import { Image } from "../../../../core";
```

6. Create and export a constant with the name of the travel. Copy the JSON content and paste it into the `.ts` file. The export should look like this:

```typescript
export const <travel_name> = // JSON content
```

**Note:** The JSON content should be an array

```typescript
export const example_travel: Image[] = [
  {
    original: "https://example.com/TravelMap/City/001.jpg",
    alt: "Example",
    thumbnail:
      "https://example.com/TravelMap/City/001t.jpg",
    width: 9,
    height: 16,
  },
  ...
];
```

7. Import the travel in the city model file. The import should look like this:

```typescript
import { City, Travel } from "../../../core";
import { Belgium } from "../../countries/countries";
import { example_travel } from "./photos/example_travel";

export const Anderlecth = new City({
  name: "Anderlecht",
  country: Belgium,
  coordinates: [4.1299, 50.8383],
  travels: [
    new Travel({
      sDate: new Date(2023, 7, 6),
      eDate: new Date(2023, 7, 6),
      photos: example_travel,
    }),
  ],
  backgroundImgsSrc: [
    "https://example.com/TravelMap/Backgrounds/Cities/Anderlecht.jpg",
  ],
  mapCoordinates: [1, 51],
});
```
