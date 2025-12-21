import os
from lib.video import is_video, extract_first_frame
from lib.image import compress


def setup_paths(root_path, city):
    """
    Setup and return relevant folder paths.

    Args:
        root_path (str): Root directory path.
        city (str): City name for path setup.

    Returns:
        tuple: base_folder_path, city_folder_path, results_folder_path, results_city_folder_path
    """
    base_folder_path = os.path.abspath(os.path.join(root_path, "photos"))
    city_folder_path = os.path.join(base_folder_path, city)
    results_folder_path = os.path.join(root_path, "results")
    results_city_folder_path = os.path.join(results_folder_path, city)

    return (
        base_folder_path,
        city_folder_path,
        results_folder_path,
        results_city_folder_path,
    )


def remove_if_exists(filepath, logger):
    """
    Remove the file if it exists.

    Args:
        filepath (str): File path to remove.
        logger (Logger): Logger instance.
    """
    if os.path.exists(filepath):
        try:
            os.remove(filepath)
            logger.info("Removed file: %s", filepath)
        except Exception as e:
            logger.error(f"Failed to remove file {filepath}: {e}")


def process_file(filename, data, city_folder_path, results_city_folder_path, logger):
    """
    Process an individual file: either extract video frames or compress an image.

    Args:
        filename (str): Filename to process.
        data (dict): Data containing city-related information.
        city_folder_path (str): Folder containing the original files.
        results_city_folder_path (str): Folder to store processed files.
        logger (Logger): Logger instance.
    """
    try:
        file_number = filename.split(".")[0]
        new_filename = f"{file_number}.jpg"
        new_compress_filename = f"{file_number}c.webp"

        if is_video(filename):
            logger.video("Processing video file: %s", filename)
            extracted_path = extract_first_frame(
                filename, city_folder_path, city_folder_path, logger
            )
            if not extracted_path:
                logger.error(
                    "Skipping video %s: first-frame extraction failed.", filename
                )
                return
        else:
            logger.photo("Processing image file: %s", filename)

        compress(data, new_filename, city_folder_path, results_city_folder_path, logger)

        # Cleanup for videos
        if is_video(filename):
            remove_if_exists(
                os.path.join(results_city_folder_path, new_compress_filename), logger
            )
            remove_if_exists(os.path.join(city_folder_path, new_filename), logger)

    except Exception as e:
        logger.error(f"Error processing file {filename}: {e}")
