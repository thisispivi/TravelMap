"""Small reusable helpers used by the uploader pipeline."""

import logging
import os
from logging import Logger
from typing import Any, Mapping, Optional, Tuple


def setup_paths(root_path: str, city: str) -> Tuple[str, str, str, str]:
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


def get_logger(logger: Optional[Logger], name: str) -> Logger:
    """Return `logger` if provided, otherwise a logger for `name`."""

    return logger or logging.getLogger(name)


def build_base_storage_path(args: Mapping[str, Any]) -> str:
    """Build the Bunny storage path prefix for a city (always ends with '/')."""

    return f"{args['CDN_BASE_STORAGE_PATH']}{args['country']}/{args['city']}/"


def build_cdn_city_path(args: Mapping[str, Any], filename: str) -> str:
    """Build the public CDN path for a file within the city folder."""

    return f"/{args['country']}/{args['city']}/{filename}"


def get_max_common_divisor(a: int, b: int) -> int:
    """
    Get the max common divisor of two numbers

    Args:
        a (int): The first number.
        b (int): The second number.

    Returns:
        int: The max common divisor of the two numbers.
    """
    a = abs(int(a))
    b = abs(int(b))
    while b:
        a, b = b, a % b
    return a
