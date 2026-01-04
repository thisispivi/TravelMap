import json
from pathlib import Path
from typing import Any, Iterable, Union


PathLike = Union[str, Path]


def export_json(images: Iterable[Any], path: PathLike, filename: str) -> Path:
    """
    Export the images to a json file.

    Args:
        images (list): The list of images.
        path (str): The path where the json file will be exported.
        filename (str): The name of the json file.
    """
    output_path = Path(path) / f"{filename}.json"
    with output_path.open("w", encoding="utf-8") as outfile:
        json.dump(list(images), outfile, indent=4, ensure_ascii=False)
    return output_path
