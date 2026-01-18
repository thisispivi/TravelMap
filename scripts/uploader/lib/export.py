"""JSON export utilities for the uploader."""

import json
from pathlib import Path
from typing import Any, Iterable, Union


PathLike = Union[str, Path]


def export_json(images: Iterable[Any], path: PathLike, filename: str) -> Path:
    """
    Export image/video metadata to a JSON file.

    Args:
        images: Iterable of metadata objects.
        path: Folder where the json file will be written.
        filename: Base filename (without extension).

    Returns:
        The path to the written JSON file.
    """
    output_path = Path(path) / f"{filename}.json"
    with output_path.open("w", encoding="utf-8") as outfile:
        json.dump(list(images), outfile, indent=4, ensure_ascii=False)
    return output_path
