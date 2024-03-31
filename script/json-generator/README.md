# JSON Travel generator for Travel Map

This is a simple Python script that generates the photos for the travel map in JSON format. The webapp Travel Map uses [Statically.io](https://statically.io/) as CDN to load the images. Each image of the travel has two versions: the original and the thumbnail. Thumbnails are generated using the Image Resizer in windows.

# Index

- [1. Preparation](#1-preparation)
  - [1.1. Folder preparation](#11-folder-preparation)
  - [1.2. Github upload](#12-github-upload)
  - [1.3. Github permalink](#13-github-permalink)
  - [1.4. Statically.io](#14-staticallyio)
  - [1.5. Remove the folder and file name](#15-remove-the-folder-and-file-name)
- [2. Usage](#2-usage)
- [3. Output](#3-output)

## 1. Preparation

### 1.1. Folder preparation

Insert a folder with the name of the city in the `photos` folder. The folder should contain the photos of the city named as

```
<number>.jpg
```

for the original photos and

```
<number>t.jpg
```

for the thumbnails, where `<number>` is the number of the photo.

### 1.2. Github upload

Create a public repository and then upload that folder to the root of the repository.

### 1.3. Github permalink

Get the permalink of one of the photos in the repository. The permalink should be like this:

```
https://github.com/iampivi/PhotoLake1/blob/818446548014d16b4fd4595c629a6584beb65ed0/Turin/001.jpg
```

### 1.4. Statically.io

Generate the URL of the image in Statically.io using this [link](https://statically.io/convert/). The URL should be like this:

```
https://cdn.statically.io/gh/iampivi/PhotoLake1/818446548014d16b4fd4595c629a6584beb65ed0/Turin/001.jpg
```

### 1.5. Remove the folder and file name

Remove the folder and file name from the URL to get the base URL:

```
https://cdn.statically.io/gh/iampivi/PhotoLake1/818446548014d16b4fd4595c629a6584beb65ed0
```

## 2. Usage

To generate the JSON file for a city, run the following command:

```bash
python3 travel_generator.py -c <city_name> -s <statically_path>
```

where `<city_name>` is the name of the city and `<statically_path>` is the base URL of the images in Statically.io.

## 3. Output

The script will generate a JSON file in the `root` folder with the name `<city_name>.json`.
