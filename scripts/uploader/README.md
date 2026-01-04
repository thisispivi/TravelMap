# TravelMap Uploader (Images/Videos + JSON Export) • ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)

This script prepares a city’s media for the TravelMap project:

- Converts photos into two optimized WEBP files: a **compressed** version and a **thumbnail**.
- Extracts the **first frame** of videos and creates a **thumbnail WEBP**.
- Uploads the generated WEBP files to **BunnyCDN Storage**.
- Exports a `<city>.json` file describing the processed media (paths + basic metadata).

## Features

- Converts images to WEBP and creates:
  - `*c.webp` (compressed)
  - `*t.webp` (thumbnail)
- Extracts first frame from video files using `ffmpeg` and generates `*t.webp` thumbnails.
- Uploads generated files to BunnyCDN Storage.
- Exports `<city>.json` sorted by numeric index in filenames (e.g. `001t.webp`, `12t.webp`).

## Requirements

### Dependencies

- Python 3
- Python packages (installed via `requirements.txt`)
- `ffmpeg` (required for video first-frame extraction)
  - Windows: install ffmpeg and ensure `ffmpeg` (and ideally `ffprobe`) are on your PATH.

Install Python dependencies:

```bash
pip install -r requirements.txt
```

### Configuration (.env)

This script loads configuration from `env/.env` and falls back to `env/example.env`.

1. Copy the example file:

```bash
copy env\example.env env\.env
```

2. Fill in the BunnyCDN and sizing settings in `env/.env`.

Expected keys:

- `THUMBNAIL_MIN_SIZE`, `THUMBNAIL_MAX_SIZE`, `THUMBNAIL_RESOLUTION`
- `COMPRESSED_MIN_SIZE`, `COMPRESSED_MAX_SIZE`, `COMPRESSED_RESOLUTION`
- `CDN_STORAGE_ZONE_API_KEY`, `CDN_STORAGE_ZONE_NAME`, `CDN_STORAGE_ZONE_REGION`
- `CDN_BASE_STORAGE_PATH`
- `CDN_BASE_URL` (optional for consumers; the exported JSON uses paths like `/<country>/<city>/...`)

Environment variables override values from the file.

## Project Structure

```text
.
├── env/
│   └── example.env              # Template config (copy to env/.env)
├── lib/
│   ├── args.py                  # CLI parsing (-c/--city, -C/--country)
│   ├── env.py                   # Loads env/.env (or env/example.env)
│   ├── export.py                # Writes <city>.json
│   ├── image.py                 # Image → WEBP (compressed + thumbnail) + BunnyCDN upload
│   ├── video.py                 # Video first-frame extraction + thumbnail + BunnyCDN upload
│   ├── logging.py               # Custom colored logger
│   ├── sort.py                  # Sorting by numeric index in filenames
│   └── utils.py                 # Path + CDN helper functions
├── photos/
│   └── <city_name>/             # Input photos/videos for a city
├── results/
│   └── <city_name>/             # Generated WEBP files (and temporary video frames)
└── main.py                      # Orchestrates processing, uploads, and JSON export
```

## Usage

### Command-Line Arguments

| Flag              | Description                          | Required |
| ----------------- | ------------------------------------ | -------- |
| `-c`, `--city`    | City folder name under `photos/`     | Yes      |
| `-C`, `--country` | Country slug used to build CDN paths | Yes      |

### Running the Program

```bash
python main.py -c <city_name> -C <country_slug>
```

Example:

```bash
python main.py -c Cairns -C Australia
```

This will:

- Read all files in `photos/<city_name>/`.
- For images: generate `*c.webp` and `*t.webp` in `results/<city_name>/`.
- For videos: extract the first frame and generate `*t.webp` in `results/<city_name>/`.
- Upload generated WEBP files to BunnyCDN Storage.
- Write `<city_name>.json` to the repository root.

## Processing Logic

- Images

  - Outputs are always WEBP:
    - `{base}c.webp` (compressed)
    - `{base}t.webp` (thumbnail)
  - If the original image is already smaller than the configured minimum size, the script still re-encodes to WEBP at high quality (to guarantee correct WEBP output).

- Videos
  - The script uses `ffmpeg` to extract the first frame.
  - It then generates `{base}t.webp` using the thumbnail constraints.
  - The exported JSON marks these items with `"youtube": true` and includes only a `thumbnail` field.

## Output

- Generated media files are written to `results/<city_name>/`.
- The JSON is written to `<city_name>.json` at the repo root.
- The JSON contains CDN-style paths like `/<country>/<city>/<filename>`. If you want full URLs, prepend your CDN base URL in your app.

## Logging

A custom logger reports progress and key steps:

- Which files are processed (photo vs video)
- Compression decisions and output sizes
- Upload attempts to BunnyCDN
- Errors (e.g., missing folders or missing `ffmpeg`)

## Error Handling

- The script exits with an error if required CLI arguments are missing.
- The script errors if `photos/<city>/` does not exist.
- For videos, if `ffmpeg` is not available on PATH, the video thumbnail generation will fail and the error will be logged.

## Troubleshooting

- Make sure `photos/<city_name>/` exists and contains files.
- If videos are not processed, ensure `ffmpeg` is installed and available on PATH:
  - `ffmpeg -version`
  - `ffprobe -version`
- If uploads fail, verify your BunnyCDN settings in `env/.env`:
  - API key, storage zone name/region, and base storage path
