from PIL import Image
import os


def get_max_common_divisor(a, b):
    """
    Get the max common divisor of two numbers

    Args:
        a (int): The first number.
        b (int): The second number.

    Returns:
        int: The max common divisor of the two numbers.
    """
    if b == 0:
        return a
    return get_max_common_divisor(b, a % b)


def get_image_info(cityUrl, filename, city_folder_path, logger):
    """
    Get the image info.

    Args:
        cityUrl (str): The city url.
        filename (str): The filename.
        city_folder_path (str): The city folder path.
        logger (Logger): The logger instance.

    Returns:
        dict: The image info.
    """
    image = {}
    image["thumbnail"] = cityUrl + filename
    image["alt"] = ""

    original_file_name = filename.replace("t.webp", "c.webp")
    if is_file_exist(os.path.join(city_folder_path, original_file_name)):
        image["original"] = cityUrl + original_file_name
    else:
        image["youtube"] = True
        image["original"] = ""
        logger.warning("Video file found: %s", filename)

    width, height = Image.open(os.path.join(city_folder_path, filename)).size
    max_common_divisor = get_max_common_divisor(width, height)
    image["width"] = int(width / max_common_divisor)
    image["height"] = int(height / max_common_divisor)

    logger.info("Image info: %s", image)

    return image


def is_file_exist(file_path):
    """
    Check if the file exists.

    Args:
        file_path (str): The file path.

    Returns:
        bool: True if the file exists, False otherwise.
    """
    return os.path.exists(file_path)
