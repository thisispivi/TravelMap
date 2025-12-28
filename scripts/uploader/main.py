import os
import sys
from lib.args import get_args
from lib.logging import get_custom_logger
from lib.env import get_env
from lib.utils import setup_paths
from lib.image import TravelImage
from lib.sort import sort_images_by_index_in_filename
from lib.export import export_json


if __name__ == "__main__":
    try:
        logger = get_custom_logger()
        logger.info("Starting setup for city images processing")

        args = get_args(sys.argv, logger)
        city = args["city"]

        root_path = os.path.dirname(os.path.realpath(__file__))
        logger.debug("Root path: %s", root_path)

        env = get_env(root_path)
        args.update(env)

        (
            base_folder_path,
            city_folder_path,
            results_folder_path,
            results_city_folder_path,
        ) = setup_paths(root_path, city)

        logger.debug("Base folder path: %s", base_folder_path)
        logger.debug("City folder path: %s", city_folder_path)
        logger.debug("Results folder path: %s", results_folder_path)
        logger.debug("Results city folder path: %s", results_city_folder_path)

        os.makedirs(results_city_folder_path, exist_ok=True)

        files = os.listdir(city_folder_path)
        images_info = []
        for filename in os.listdir(city_folder_path):
            print("\n")
            logger.info("Progress: %d/%d", len(images_info) + 1, len(files))
            travel_image = TravelImage(
                filename,
                args,
                city_folder_path,
                results_city_folder_path,
            )
            images_info.append(travel_image.run(logger))

        sorted_images = sort_images_by_index_in_filename(images_info)
        export_json(sorted_images, root_path, city)

    except Exception as e:
        logger.error(f"Error in the main script: {e}")
        sys.exit(2)
