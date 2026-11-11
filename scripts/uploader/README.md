# TravelMap uploader (images/videos + JSON export) • ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)

This script prepares a city's media for the TravelMap project. It converts
photos to WEBP, makes thumbnails from the first frame of videos, uploads the
results to BunnyCDN Storage (or copies them into the repository `media/`
folder with `--local`), and exports a `<city>.json` file describing the
processed media (paths and basic metadata).

## Features

- Converts each image to two WEBP files:
  - `*c.webp` (compressed)
  - `*t.webp` (thumbnail)
- Extracts the first frame of each video with `ffmpeg` and generates a `*t.webp`
  thumbnail.
- Uploads the generated files to BunnyCDN Storage or copies them into local media.
- Exports `<city>.json` sorted by the numeric index in the filenames (e.g.
  `001t.webp`, `12t.webp`).

## Requirements

### Dependencies

- Python 3
- Python packages (installed from `requirements.txt`)
- `ffmpeg`, for extracting the first frame of videos
  - Windows: install ffmpeg and make sure `ffmpeg` (and ideally `ffprobe`) is on your PATH.

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

### Configuration (.env)

The script loads its configuration from `env/.env` and falls back to
`env/example.env`.

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
- `CDN_BASE_URL` (optional for consumers; exported paths use `media.root`)

Environment variables override values from the file.

## Project structure

```text
.
├── env/
│   └── example.env              # Template config (copy to env/.env)
├── lib/
│   ├── args.py                  # CLI parsing, including --local
│   ├── config.py                # Reads media.root and builds local paths
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

### Command-line arguments

| Flag              | Description                          | Required |
| ----------------- | ------------------------------------ | -------- |
| `-c`, `--city`    | City folder name under `photos/`     | Yes      |
| `-C`, `--country` | Country slug used to build CDN paths | Yes      |
| `-l`, `--local`   | Copy into `media/` instead of Bunny  | No       |

### Running the program

```bash
python main.py -c <city_name> -C <country_slug>
```

Example:

```bash
python main.py -c Cairns -C Australia
```

For self-hosted media:

```bash
python main.py -c Cairns -C Australia --local
```

A run:

- reads all files in `photos/<city_name>/`
- generates `*c.webp` and `*t.webp` in `results/<city_name>/` for each image
- extracts the first frame of each video and generates `*t.webp` in
  `results/<city_name>/`
- uploads the generated WEBP files to BunnyCDN Storage, or copies them into the
  local media tree when `--local` is set
- writes `<city_name>.json` to the repository root

## Processing logic

- Images
  - Outputs are always WEBP:
    - `{base}c.webp` (compressed)
    - `{base}t.webp` (thumbnail)
  - If the original image is already smaller than the configured minimum size,
    the script still re-encodes it to WEBP at high quality, so the output is
    always valid WEBP.

- Videos
  - The script uses `ffmpeg` to extract the first frame.
  - It then generates `{base}t.webp` using the thumbnail constraints.
  - The exported JSON marks these items with `"youtube": true` and includes only a `thumbnail` field.

## Output

- Generated media files are written to `results/<city_name>/`.
- The JSON is written to `<city_name>.json` at the repo root.
- The JSON contains paths like `/Travels/<country>/<city>/<filename>`. The
  prefix comes from `data/site.config.json`'s `media.root` and defaults to
  `/Travels`; the app prepends `VITE_CDN_PATH`.

## Logging

A custom logger reports progress:

- which files are processed (photo or video)
- compression decisions and output sizes
- upload attempts to BunnyCDN
- errors (e.g., missing folders or missing `ffmpeg`)

## Error handling

- The script exits with an error if required CLI arguments are missing.
- The script errors if `photos/<city>/` does not exist.
- For videos, if `ffmpeg` is not on PATH, thumbnail generation fails and the
  error is logged.

## Troubleshooting

- Make sure `photos/<city_name>/` exists and contains files.
- If videos are not processed, check that `ffmpeg` is installed and on PATH:
  - `ffmpeg -version`
  - `ffprobe -version`
- If uploads fail, check your BunnyCDN settings in `env/.env`:
  - API key, storage zone name/region, and base storage path
