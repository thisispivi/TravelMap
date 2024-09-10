import os
import sys
from lib.args import get_city_from_args
from lib.logging import get_custom_logger
from lib.video import is_video, extract_first_frame
from lib.image import compress


if "__main__" == __name__:
    try:
        logger = get_custom_logger()

        logger.info("Photos setup for city images")

        data = get_city_from_args(sys.argv, logger)
        city = data["city"]

        root_path = os.path.dirname(os.path.realpath(__file__))
        base_folder_path = os.path.abspath(os.path.join(root_path, "photos"))
        city_folder_path = os.path.join(base_folder_path, city)
        results_folder_path = os.path.join(root_path, "results")
        results_city_folder_path = os.path.join(results_folder_path, city)
        logger.info("Root path: %s", root_path)
        logger.info("Base folder path: %s", base_folder_path)
        logger.info("City folder path: %s", city_folder_path)
        logger.info("Results folder path: %s", results_folder_path)
        logger.info("Results city folder path: %s", results_city_folder_path)

        if not os.path.exists(results_city_folder_path):
            os.mkdir(results_city_folder_path)

        for filename in os.listdir(city_folder_path):
            if is_video(filename):
                logger.video("Processing video file: %s", filename)
                extract_first_frame(
                    filename, city_folder_path, city_folder_path, logger
                )
            else:
                logger.photo("Processing image file: %s", filename)
            file_number = filename.split(".")[0]
            new_filename = file_number + ".jpg"
            new_compress_filename = file_number + "c.jpg"
            compress(
                new_filename,
                city_folder_path,
                results_city_folder_path,
                is_video(filename),
            )
            if is_video(filename):
                os.remove(os.path.join(city_folder_path, new_filename))
                os.remove(os.path.join(
                    results_city_folder_path, new_compress_filename))

    except Exception as e:
        logger.error(str(e))
        exit(2)
