import cv2
import os


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
    Extract the first frame from the video and save it as an image.

    Args:
        filename (str): Video filename.
        city_folder_path (str): Path to the city folder.
        results_city_folder_path (str): Path to save the extracted image.
        logger (Logger): Logger instance.

    Returns:
        None
    """
    video_path = os.path.join(city_folder_path, filename)
    vidcap = cv2.VideoCapture(video_path)
    success, image = vidcap.read()
    if success:
        video_name = os.path.basename(video_path)
        output_filename = os.path.splitext(video_name)[0] + ".jpg"
        output_path = os.path.join(results_city_folder_path, output_filename)
        cv2.imwrite(output_path, image)
        logger.info(f"First frame extracted and saved as: {output_path}")
    else:
        logger.error(f"Error extracting first frame from video: {video_path}")
