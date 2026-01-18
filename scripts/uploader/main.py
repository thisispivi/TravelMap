"""TravelMap media uploader entrypoint.

This script processes all files in a city folder under `photos/<city>/` and:
- creates compressed + thumbnail WEBP assets for images
- creates a thumbnail WEBP for supported video formats
- uploads derived assets to BunnyCDN Storage
- exports a `<city>.json` manifest consumed by the TravelMap web app
"""

from __future__ import annotations

import os
import sys
from logging import Logger
from pathlib import Path
from typing import Any, Mapping, Optional, Sequence

from lib.args import get_args
from lib.env import get_env
from lib.export import export_json
from lib.image import TravelImage
from lib.logging import get_custom_logger
from lib.sort import sort_images_by_index_in_filename
from lib.utils import setup_paths
from lib.video import TravelVideo, is_video


def _process_city_entry(
    *,
    filename: str,
    args: Mapping[str, Any],
    city_folder_path: str,
    results_city_folder_path: str,
    logger: Logger,
) -> Optional[Mapping[str, Any]]:
    """Process a single city folder entry.

    Routes to either `TravelVideo` (video inputs) or `TravelImage` (image inputs)
    and returns the metadata dict produced by the corresponding pipeline.
    """
    if is_video(filename):
        return TravelVideo(
            filename,
            args,
            city_folder_path,
            results_city_folder_path,
        ).run(logger)

    return TravelImage(
        filename,
        args,
        city_folder_path,
        results_city_folder_path,
    ).run(logger)


def main(argv: Optional[Sequence[str]] = None) -> int:
    """Run the uploader pipeline.

    Args:
        argv: Optional argv sequence. When omitted, defaults to `sys.argv`.

    Returns:
        Process exit code (0 on success; non-zero on failure).
    """
    logger: Optional[Logger] = None
    try:
        logger = get_custom_logger()
        logger.info("Starting setup for city images processing")

        argv = argv or sys.argv
        args: dict[str, Any] = dict(get_args(argv, logger))
        city = args["city"]

        root_path = Path(__file__).resolve().parent
        logger.debug("Root path: %s", root_path)

        env = get_env(root_path, logger)
        args.update(env)

        (
            _base_folder_path,
            city_folder_path,
            _results_folder_path,
            results_city_folder_path,
        ) = setup_paths(str(root_path), city)

        logger.debug("City folder path: %s", city_folder_path)
        logger.debug("Results city folder path: %s", results_city_folder_path)

        os.makedirs(results_city_folder_path, exist_ok=True)

        if not os.path.isdir(city_folder_path):
            raise FileNotFoundError(
                f"City folder not found: {city_folder_path}. Expected photos/<city>/"
            )

        files = sorted(os.listdir(city_folder_path))
        images_info: list[Mapping[str, Any]] = []

        for idx, filename in enumerate(files, start=1):
            source_path = os.path.join(city_folder_path, filename)
            if not os.path.isfile(source_path):
                logger.debug("Skipping non-file entry: %s", source_path)
                continue

            logger.progress("Progress: %d/%d", idx, len(files))
            info = _process_city_entry(
                filename=filename,
                args=args,
                city_folder_path=city_folder_path,
                results_city_folder_path=results_city_folder_path,
                logger=logger,
            )
            if info:
                images_info.append(info)

        sorted_images = sort_images_by_index_in_filename(images_info)
        export_json(sorted_images, str(root_path), city)
        return 0

    except Exception:
        if logger is not None:
            logger.exception("Error in the main script")
        else:
            print("Error in the main script")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
