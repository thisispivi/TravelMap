import os
import shutil
import subprocess


def _try_extract_first_frame_with_opencv(
    video_path: str, output_path: str, logger
) -> bool:
    try:
        import cv2  # type: ignore
    except Exception as e:
        logger.debug("OpenCV not available for video extraction: %s", e)
        return False

    cap = cv2.VideoCapture(video_path)
    try:
        if not cap.isOpened():
            return False

        ok, frame = cap.read()
        if not ok or frame is None:
            return False

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        ok = cv2.imwrite(output_path, frame)
        return bool(ok)
    finally:
        try:
            cap.release()
        except Exception:
            pass


def is_video(filename: str) -> bool:
    """
    Check if the file is a video file.

    Args:
        filename (str): The name of the file.

    Returns:
        bool: True if the file is a video file, False otherwise
    """
    return filename.lower().endswith((".mp4", ".mov", ".avi", ".mkv", ".flv"))


def extract_first_frame(filename, city_folder_path, results_city_folder_path, logger):
    """
    Extract the first frame from a video file and save it as a JPEG image.

    Args:
        filename (str): The name of the video file.
        city_folder_path (str): The path to the folder containing the video file.
        results_city_folder_path (str): The path to the folder where the extracted image will be saved.
        logger: Logger object for logging information and errors.
    """
    video_path = os.path.join(city_folder_path, filename)
    if not os.path.exists(video_path):
        logger.error("Video file not found: %s", video_path)
        return None

    output_filename = os.path.splitext(filename)[0] + ".jpg"
    output_path = os.path.join(results_city_folder_path, output_filename)

    # Prefer OpenCV (already a declared dependency). Fallback to ffmpeg if available.
    try:
        if _try_extract_first_frame_with_opencv(video_path, output_path, logger):
            logger.info("First frame extracted and saved as: %s", output_path)
            return output_path
    except Exception as e:
        logger.debug("OpenCV extraction failed, will try ffmpeg next: %s", e)

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
            "Error extracting first frame from video (ffmpeg failed): %s", video_path
        )
        return None
