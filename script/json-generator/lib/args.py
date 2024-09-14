import argparse


def get_city_from_args(argumentList, logger):
    """
    Returns city name and CDN base folder path from command line arguments.

    Args:
        argumentList (list): The list of arguments.
        logger (Logger): The logger instance.

    Returns:
        dict: The dictionary with city name and CDN base folder path.

    Raises:
        ValueError: If no city or CDN base folder path is provided.
    """
    parser = argparse.ArgumentParser(
        description="Provide city name and CDN base folder path."
    )

    parser.add_argument("-c", "--city", required=True, help="Name of the city.")
    parser.add_argument(
        "-p", "--cdn-base-folder-path", required=True, help="CDN base folder path."
    )

    args = parser.parse_args(argumentList[1:])

    city = args.city.capitalize()
    path = args.cdn_base_folder_path

    logger.info("Generating JSON for city: %s", city)
    logger.info("CDN base folder path: %s", path)

    return {"city": city, "cdn_base_folder_path": path}
