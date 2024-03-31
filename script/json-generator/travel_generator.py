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

        data = get_city_from_args(sys.argv, logger)
        city = data["city"]
        statically_path = data["statically_path"]
        cityUrl = statically_path + "/" + city + "/"

        root_path = os.path.dirname(os.path.realpath(__file__))
        base_folder_path = os.path.abspath(os.path.join(root_path, "photos"))
        city_folder_path = os.path.join(base_folder_path, city)

        logger.info("Root path: %s", root_path)
        logger.info("Base folder path: %s", base_folder_path)
        logger.info("City folder path: %s", city_folder_path)

        images = []
        for filename in os.listdir(city_folder_path):
            if not filename.endswith("t.jpg"):
                images.append(
                    get_image_info(cityUrl, filename, city_folder_path, logger)
                )

        sorted_images = sort_images_by_index_in_filename(images)

        export_json(sorted_images, root_path, city)
    except Exception as e:
        logger.error(str(e))
        exit(2)
