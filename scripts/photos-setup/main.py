import os
import sys
from lib.args import get_city_from_args
from lib.logging import get_custom_logger
from lib.utils import setup_paths, process_file


if __name__ == "__main__":
    try:
        logger = get_custom_logger()

        logger.info("Starting setup for city images processing")

        data = get_city_from_args(sys.argv, logger)
        city = data["city"]

        root_path = os.path.dirname(os.path.realpath(__file__))
        logger.info("Root path: %s", root_path)

        # Setup all necessary paths
        (
            base_folder_path,
            city_folder_path,
            results_folder_path,
            results_city_folder_path,
        ) = setup_paths(root_path, city)

        logger.info("Base folder path: %s", base_folder_path)
        logger.info("City folder path: %s", city_folder_path)
        logger.info("Results folder path: %s", results_folder_path)
        logger.info("Results city folder path: %s", results_city_folder_path)

        # Create results city folder if it doesn't exist
        os.makedirs(results_city_folder_path, exist_ok=True)

        # Process all files in the city folder
        for filename in os.listdir(city_folder_path):
            process_file(
                filename, data, city_folder_path, results_city_folder_path, logger
            )

    except Exception as e:
        logger.error(f"Error in the main script: {e}")
        sys.exit(2)
