import os


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
