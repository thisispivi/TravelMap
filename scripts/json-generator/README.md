# JSON Travel generator for Travel Map • ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)

This Python script automates the generation of a JSON file that can be used within the Travel Map project. The script is designed to work with a collection of travel photos taken in a specific city, organizing them into a JSON structure that aligns with the web application's data model.

In the Travel Map web app, each city contains a list of travels, and each travel includes a set of photos. For each photo in a travel, the web app requires two versions: the compressed image and a corresponding thumbnail. These photos can be generated from the `photos-setup` script, in the upper directory.

This script simplifies the process by generating the necessary JSON file that maps out the travels and their associated images for a particular city, ensuring compatibility with the Travel Map project's structure.

## Features

- Organizes travel photos into a JSON format.
- Handles both original and thumbnail versions of images.
- Ensures the JSON structure aligns with the Travel Map app's data model.

## Requirements

### Dependencies

Ensure you have Python 3 installed and the following packages:

- Pillow: Used for image processing.

Install the dependencies using pip:

```bash
pip install -r requirements.txt
```

## Project Structure

```text
├── lib
│ ├── args.py # Handles command-line argument parsing.
│ ├── export.py # Contains the JSON export logic.
│ ├── logging.py # Custom logging setup.
│ ├── sort.py # Sorting functions for image files.
│ ├── utils.py # Utility functions for file handling.
├── photos # Folder where city images/videos are stored.
│ ├── <city_name> # City-specific folder containing images and videos.
└── main.py # Main script that runs the processing.
```

## Folder Preparation

Before generating the JSON file:

- Create a folder named after the city inside the `photos` directory.
- Organize the photos using the following naming conventions:
  - Compressed photos: `<number>c.webp` (e.g., 001c.webp)
  - Thumbnails: `<number>t.webp` (e.g., 001t.webp)

## Usage

### Command-Line Arguments

You can generate the JSON file with the following command:

```bash
python3 main.py -c <city_name> -p <cdn_base_folder_path>
```

- `<city_name>`: The name of the city folder.
- `<cdn_base_folder_path>`: The base CDN path where the photos will be uploaded.

Example

```bash
python3 main.py -c Paris -p https://example.com/TravelMap/
```

This will generate a JSON file named `Paris.json` in the `root` folder.

## Output

The generated JSON file will be saved in the `root` folder, named `<city_name>.json`.
The JSON structure will list the travels and their associated images.

## Integration with the Travel Map Project

1.  Create city folder:
    - Go to the `data` folder in the Travel Map project.
    - Create a folder for the city if it doesn't exist.
2.  Photos folder:
    - Inside the city folder, create a `photos` folder if not already present.
3.  Create TypeScript file:
    - In the `photos` folder, create a .ts file and import the `Image` type:
      ```typescript
      import { Image } from "../../../../core";
      ```
4.  Add travel data:
    - Paste the JSON content into the .ts file:
      ```typescript
      export const example_travel: Image[] = [
       {
         original: "https://example.com/TravelMap/City/001c.webp",
         alt: "Example",
         thumbnail: "https://example.com/TravelMap/City/001t.webp",
         width: 9,
         height: 16,
       },
       ...
      ];
      ```
5.  Link travel to city:

    - In the city model file, import the travel and link it to the city:

      ```typescript
      import { City, Travel } from "../../../core";
      import { Belgium } from "../../countries/countries";
      import { example_travel } from "./photos/example_travel";

      export const Anderlecht = new City({
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
          "https://example.com/TravelMap/Backgrounds/Cities/Anderlecht.webp",
        ],
        mapCoordinates: [1, 51],
      });
      ```

## Error Handling

- The script will terminate with an appropriate error message if no city name is provided or if required parameters are missing.
- In case of file I/O errors (e.g., permission issues or missing directories), detailed error messages will be logged.

## Troubleshooting

If you encounter any issues while running the script, ensure the following:

- The photos are correctly named and stored in the city folder.
- The required dependencies are installed.
