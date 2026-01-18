"""Environment configuration loading for the uploader.

Loads key/value pairs from `env/.env` (preferred) or `env/example.env` (fallback),
then overlays OS environment variables.
"""

import os
import logging
from logging import Logger
from pathlib import Path
from typing import Mapping, Optional, Union

from dotenv import dotenv_values


PathLike = Union[str, Path]


def get_env(root_path: PathLike, logger: Optional[Logger] = None) -> dict[str, str]:
    """
    Load and return .env data as a dict from a repo root path.

    `root_path` is the uploader folder containing the `env/` directory.
    This prefers `env/.env` and falls back to `env/example.env`.

    OS environment variables override any values loaded from the file.
    """
    root = Path(root_path)
    logger = logger or logging.getLogger(__name__)

    env_dir = root / "env"
    env_file = env_dir / ".env"
    example_env_file = env_dir / "example.env"

    selected: Optional[Path] = None
    if env_file.exists():
        selected = env_file
    elif example_env_file.exists():
        selected = example_env_file
        logger.warning(
            "Using %s (copy it to %s to configure real secrets).",
            example_env_file,
            env_file,
        )

    if selected is None:
        raise FileNotFoundError(
            f"No env file found. Create {env_file} (you can start from {example_env_file})."
        )

    values: Mapping[str, Optional[str]] = dotenv_values(selected)
    loaded = {k: v for k, v in values.items() if v is not None}

    for k in list(loaded.keys()):
        if k in os.environ:
            loaded[k] = os.environ[k]

    expected_keys = (
        "THUMBNAIL_MIN_SIZE",
        "THUMBNAIL_MAX_SIZE",
        "THUMBNAIL_RESOLUTION",
        "COMPRESSED_MIN_SIZE",
        "COMPRESSED_MAX_SIZE",
        "COMPRESSED_RESOLUTION",
        "CDN_BASE_URL",
        "CDN_STORAGE_ZONE_API_KEY",
        "CDN_STORAGE_ZONE_NAME",
        "CDN_STORAGE_ZONE_REGION",
        "CDN_BASE_STORAGE_PATH",
    )
    for k in expected_keys:
        if k not in loaded and k in os.environ:
            loaded[k] = os.environ[k]

    return loaded
