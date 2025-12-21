# City Image and Video Processing • ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)

This script allows you to create the compressed and thumbnail images for the TravelMap project. It processes images and videos for a specific city, generating a compressed image and a thumbnail for each file. The compressed images are optimized for both thumbnail and regular resolutions, and the results are saved in a separate folder.

## Features

- Compress images to a specified maximum size while maintaining quality.
- Extract the first frame from video files.
- Generate thumbnails for images.
- Command-line argument support for flexible configuration of compression parameters.

## Requirements

### Dependencies

Ensure you have Python 3 installed and the following packages:

- Pillow: Used for image processing.
- ffmpeg: Used as a fallback for video first-frame extraction when OpenCV cannot read the file.
  - Windows: install ffmpeg and ensure `ffmpeg` is available on your PATH.

Install the dependencies using pip:

```bash
pip install -r requirements.txt
```

## Project Structure

```text
.
├── lib
│ ├── args.py # Handles command-line argument parsing.
│ ├── image.py # Contains the `compress` function for image compression.
│ ├── video.py # Contains the video frame extraction logic.
│ ├── logging.py # Custom logging setup.
│ ├── utils.py # Utility functions for file handling.
├── photos # Folder where city images/videos are stored.
│ ├── <city_name> # City-specific folder containing images and videos.
├── results # Folder where processed (compressed) results are stored.
│ ├── <city_name> # City-specific folder where processed images are saved.
└── main.py # Main script that runs the processing.
```

## Usage

### Command-Line Arguments

You can specify the following parameters via command-line arguments:

| Flag                           | Description                                             | Default Value |
| ------------------------------ | ------------------------------------------------------- | ------------- |
| -c, --city                     | The city name (required).                               | N/A           |
| -tmin, --thumbnail-min         | Minimum size for the thumbnail in KB.                   | 70 KB         |
| -tmax, --thumbnail-max         | Maximum size for the thumbnail in KB.                   | 250 KB        |
| -tres, --thumbnail-resolution  | Resolution for the thumbnail (max width/height).        | 900 px        |
| -cmin, --compressed-min        | Minimum size for the compressed image in KB.            | 750 KB        |
| -cmax, --compressed-max        | Maximum size for the compressed image in KB.            | 1500 KB       |
| -cres, --compressed-resolution | Resolution for the compressed image (max width/height). | 2000 px       |

### Running the Program

To run the script and process images and videos for a specific city, use the following command:

```bash
python main.py -c <city_name> [optional flags]
```

Example:

```bash
python main.py -c newyork --thumbnail-min 100 --compressed-max 1000
```

This will:

- Process all images and videos in the photos/newyork directory.
- Create an image for the video's first frame.
- Generate compressed and thumbnail versions of each image.
- Save the results in the results/newyork directory.

## Processing Logic

- Images:
  - Each image is compressed into a standard format (`.webp`) with both a regular and thumbnail version.
  - Files are saved in the `results/<city_name>` folder.
  - If an image is already smaller than the specified `compressed_min` size, it will simply be copied without further compression.
- Videos:
  - The script extracts the first frame from video files and processes it as a static image.
  - After extracting the first frame, the original video file will be skipped for further compression.

## Logging:

A custom logger is used to track the progress and provide detailed information about the file processing.
The logger will:

- Log paths of processed files.
- Report skipped files (if they are already optimized).
- Provide error messages in case of issues.

Example Log Output:

```text
[VIDEO] - 2024-09-14 08:09:46,782 - Processing video file: 048.mp4
[INFO] - 2024-09-14 08:09:46,935 - First frame extracted and saved as: C:\Users\andre\Desktop\Github\TravelMap\script\photos-setup\photos\Turin\048.jpg
[INFO] - 2024-09-14 08:09:46,961 - Image 048.jpg is already compressed or smaller than required.
[INFO] - 2024-09-14 08:09:46,963 - Compressing image 048.jpg...
[INFO] - 2024-09-14 08:09:47,106 - Quality: 100, File size: 229.06 KB
[INFO] - 2024-09-14 08:09:47,107 - Compressed 048.jpg to 229.06 KB.
[INFO] - 2024-09-14 08:09:47,109 - Removed file: C:\Users\andre\Desktop\Github\TravelMap\script\photos-setup\results\Turin\048c.webp
[INFO] - 2024-09-14 08:09:47,109 - Removed file: C:\Users\andre\Desktop\Github\TravelMap\script\photos-setup\photos\Turin\048.jpg
[PHOTO] - 2024-09-14 08:09:47,109 - Processing image file: 049.jpg
[INFO] - 2024-09-14 08:09:47,116 - Compressing image 049.jpg...
[INFO] - 2024-09-14 08:09:47,655 - Quality: 100, File size: 624.08 KB
[INFO] - 2024-09-14 08:09:47,656 - Compressed 049.jpg to 624.08 KB.
[INFO] - 2024-09-14 08:09:47,656 - Compressing image 049.jpg...
[INFO] - 2024-09-14 08:09:47,800 - Quality: 100, File size: 187.55 KB
[INFO] - 2024-09-14 08:09:47,800 - Compressed 049.jpg to 187.55 KB.
```

## Error Handling

- The script will terminate with an appropriate error message if no city name is provided or if required parameters are missing.
- In case of file I/O errors (e.g., permission issues or missing directories), detailed error messages will be logged.

## Troubleshooting

- Ensure the `photos/<city_name>` folder exists and contains the files to be processed.
- If files are not being processed, check the log output for any potential errors.
- Ensure the appropriate permissions are set for writing files in the `results` folder.
- If you see `[WinError 2] The system cannot find the file specified` while processing a video, it usually means `ffmpeg` is not installed/on PATH and OpenCV could not extract the frame.
