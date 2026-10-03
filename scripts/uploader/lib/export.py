"""JSON export utilities for the uploader."""

import json
import os
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any, Iterable, Union

from lib.config import confined_path, validate_path_segment

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
    validate_path_segment(filename)
    output_path = confined_path(Path(path), f"{filename}.json")
    content = json.dumps(list(images), indent=4, ensure_ascii=False, allow_nan=False)
    temporary: Path | None = None
    try:
        with NamedTemporaryFile(mode="w", encoding="utf-8", dir=path, delete=False) as outfile:
            temporary = Path(outfile.name)
            outfile.write(content)
        os.replace(temporary, output_path)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
    return output_path
