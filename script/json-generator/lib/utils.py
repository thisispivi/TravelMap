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
    image["original"] = cityUrl + filename
    image["alt"] = ""

    if filename.endswith("c.webp"):
        image["thumbnail"] = cityUrl + filename.replace("c.webp", "t.webp")
        width, height = Image.open(os.path.join(city_folder_path, filename)).size
        max_common_divisor = get_max_common_divisor(width, height)
        image["width"] = int(width / max_common_divisor)
        image["height"] = int(height / max_common_divisor)
    else:
        image["thumbnail"] = cityUrl + filename.split(".")[0] + "t.webp"
        image["width"], image["height"] = 1, 1
        logger.warning("Image %s is not a webp file", filename)

    logger.info("Image info: %s", image)

    return image
