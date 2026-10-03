"""Local media directories and public/storage paths for processed files."""

import os
from pathlib import Path
from typing import Any, Mapping, Tuple

from lib.config import confined_path, validate_path_segment


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
    validate_path_segment(city)
    city_folder_path = str(confined_path(Path(base_folder_path), city))
    results_folder_path = os.path.join(root_path, "results")
    results_city_folder_path = str(confined_path(Path(results_folder_path), city))

    return (
        base_folder_path,
        city_folder_path,
        results_folder_path,
        results_city_folder_path,
    )


def build_base_storage_path(args: Mapping[str, Any]) -> str:
    """Build the Bunny storage path prefix for a city (always ends with '/')."""

    return f"{str(args['CDN_BASE_STORAGE_PATH']).rstrip('/')}/{args['country']}/{args['city']}/"


def build_cdn_city_path(args: Mapping[str, Any], filename: str) -> str:
    """Build the public CDN path for a file within the city folder."""
    media_root = str(args["media_root"]).rstrip("/")
    return f"{media_root}/{args['country']}/{args['city']}/{filename}"

