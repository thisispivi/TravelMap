"""Sorting helpers for uploader output metadata."""

import math
import os
import re
from typing import Any, Iterable, Mapping


_TRAILING_INT_RE = re.compile(r"(\d+)$")


def _extract_sort_index(item: Mapping[str, Any]) -> float:
    """Best-effort numeric index extracted from the thumbnail filename.

    Expected patterns:
    - 001t.webp -> 1
    - 12t.webp  -> 12

    If no index can be found, returns +inf to sort last.
    """
    thumb = item.get("thumbnail")
    if not thumb or not isinstance(thumb, str):
        return math.inf

    name = os.path.basename(thumb)
    stem, _ext = os.path.splitext(name)

    if stem.endswith("t") or stem.endswith("c"):
        stem = stem[:-1]

    m = _TRAILING_INT_RE.search(stem)
    if not m:
        return math.inf

    try:
        return float(int(m.group(1)))
    except Exception:
        return math.inf


def sort_images_by_index_in_filename(images: Iterable[Mapping[str, Any]]):
    """Sort images by numeric index encoded in the thumbnail filename.

    Items without a parseable index are sorted last.
    """
    return sorted(images, key=_extract_sort_index)
