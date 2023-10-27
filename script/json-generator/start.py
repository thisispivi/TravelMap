import os
import sys
from lib.sort import sort_images_by_index_in_filename
from lib.utils import get_image_info
from lib.export import export_json
from lib.args import get_city_from_args
from lib.logging import get_custom_logger


if "__main__" == __name__:
    try:
        logger = get_custom_logger()

        logger.info("JSON generator for city images")

        city = get_city_from_args(sys.argv, logger)
        cityUrl = city + "/"

        root_path = os.path.dirname(os.path.realpath(__file__))
        public_folder_path = os.path.abspath(os.path.join(
            root_path, "..", "..", "travel-map", "public"))
        city_folder_path = os.path.join(public_folder_path, city)

        logger.info("Root path: %s", root_path)
        logger.info("Public folder path: %s", public_folder_path)
        logger.info("City folder path: %s", city_folder_path)

        images = []
        for filename in os.listdir(city_folder_path):
            if not filename.endswith("_thumb.jpg"):
                images.append(get_image_info(
                    cityUrl, filename, city_folder_path, logger))

        sorted_images = sort_images_by_index_in_filename(images)

        export_json(sorted_images, root_path, city)
    except Exception as e:
        logger.error(str(e))
        exit(2)
