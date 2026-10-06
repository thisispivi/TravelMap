"""Repository media configuration used by the uploader."""

import json
from pathlib import Path
from typing import Any, Mapping


DEFAULT_MEDIA_ROOT = "/Travels"


def _repo_root(root_path: str | Path) -> Path:
    """Resolve the repository root from the `scripts/uploader` directory."""
    return Path(root_path).resolve().parents[1]


def _normalized_media_root(value: object) -> str:
    """Normalize an authored media root to one leading slash and no trailing slash."""
    if not isinstance(value, str) or not value.strip():
        return DEFAULT_MEDIA_ROOT
    parts = [part for part in value.replace("\\", "/").split("/") if part]
    for part in parts:
        validate_path_segment(part)
    if not parts:
        raise ValueError("Media root must contain a folder name.")
    return f"/{'/'.join(parts)}"


def validate_path_segment(value: str) -> str:
    """Reject path syntax that escapes a folder or aliases a Windows file."""
    reserved = {"CON", "PRN", "AUX", "NUL", *(f"COM{i}" for i in range(1, 10)), *(f"LPT{i}" for i in range(1, 10))}
    if (not value or value in (".", "..") or value.endswith((".", " "))
            or any(character in value for character in '/\\:<>"|?*')
            or any(ord(character) < 32 for character in value)
            or value.split(".")[0].upper() in reserved):
        raise ValueError("City, country, and media folders must be plain folder names.")
    return value


def confined_path(root: Path, *parts: str) -> Path:
    """Resolve a destination without following a link outside its owned root."""
    target = root.joinpath(*parts).resolve()
    if not target.is_relative_to(root.resolve()):
        raise ValueError("The media path escapes its configured folder.")
    return target



def read_media_root(root_path: str | Path) -> str:
    """Read `media.root` from the repository dataset, with a fork-safe default."""
    config_path = _repo_root(root_path) / "data" / "site.config.json"
    try:
        config: object = json.loads(config_path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return DEFAULT_MEDIA_ROOT
    if not isinstance(config, Mapping):
        return DEFAULT_MEDIA_ROOT
    media: object = config.get("media")
    if not isinstance(media, Mapping):
        return DEFAULT_MEDIA_ROOT
    return _normalized_media_root(media.get("root"))


def build_media_dir(root_path: str | Path, args: Mapping[str, Any]) -> str:
    """Build the absolute local media directory for one country and city."""
    media_root = _normalized_media_root(args.get("media_root"))
    country = validate_path_segment(str(args["country"]))
    city = validate_path_segment(str(args["city"]))
    return str(confined_path(_repo_root(root_path) / "media", media_root.removeprefix("/"), country, city))

