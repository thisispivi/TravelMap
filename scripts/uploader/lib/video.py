from logging import Logger
from PIL import Image, ImageOps
import os
import shutil
import subprocess
from typing import Optional, Tuple, Mapping, Any
from BunnyCDN.Storage import Storage
from lib.utils import get_max_common_divisor


def is_video(filename: str) -> bool:
    """
    Check if the file is a video file.

    Args:
        filename (str): The name of the file.

    Returns:
        bool: True if the file is a video file, False otherwise
    """
    return filename.lower().endswith((".mp4", ".mov", ".avi", ".mkv", ".flv"))


class TravelImage:
    def __init__(
        self,
        filename: str,
        args: Mapping[str, Any],
        city_folder_path: str,
        results_city_folder_path: str,
    ):
        self.filename = filename
        self.args = args
        self.city_folder_path = city_folder_path
        self.results_city_folder_path = results_city_folder_path

    def extract_first_frame(self, logger: Logger) -> Optional[str]:
        """
        Extract the first frame from a video file and save it as a JPEG image.

        Args:
            filename (str): The name of the video file.
            city_folder_path (str): The path to the folder containing the video file.
            results_city_folder_path (str): The path to the folder where the extracted image will be saved.
            logger: Logger object for logging information and errors.
        """
        video_path = os.path.join(self.city_folder_path, self.filename)
        if not os.path.exists(video_path):
            logger.error("Video file not found: %s", video_path)
            return None

        output_filename = os.path.splitext(self.filename)[0] + ".jpg"
        output_path = os.path.join(self.results_city_folder_path, output_filename)

        ffmpeg_path = shutil.which("ffmpeg")
        if not ffmpeg_path:
            logger.error(
                "Unable to extract first frame: ffmpeg not found on PATH and OpenCV extraction failed. "
                "Install ffmpeg (and ensure it's on PATH) or use a video format/codecs OpenCV can read. Video: %s",
                video_path,
            )
            return None

        cmd = [ffmpeg_path, "-y", "-i", video_path, "-frames:v", "1", output_path]

        try:
            subprocess.run(
                cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
            )
            logger.info("First frame extracted and saved as: %s", output_path)
            return output_path
        except FileNotFoundError as e:
            logger.error(
                "ffmpeg executable could not be started (%s). Ensure ffmpeg is installed and on PATH.",
                e,
            )
            return None
        except subprocess.CalledProcessError:
            logger.error(
                "Error extracting first frame from video (ffmpeg failed): %s",
                video_path,
            )
            return None
