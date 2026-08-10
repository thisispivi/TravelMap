"""Repository media configuration used by the uploader."""

import json
import os
import tempfile
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
    if not parts or any(part in (".", "..") for part in parts):
        return DEFAULT_MEDIA_ROOT
    return f"/{'/'.join(parts)}"


def read_media_root(root_path: str | Path) -> str:
    """Read `media.root` from the repository dataset, with a fork-safe default."""
    config_path = _repo_root(root_path) / "data" / "site.config.json"
    try:
        config: object = json.loads(config_path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError, OSError):
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
    return str(
        _repo_root(root_path)
        / "media"
        / media_root.removeprefix("/")
        / str(args["country"])
        / str(args["city"])
    )


if __name__ == "__main__":
    with tempfile.TemporaryDirectory() as directory:
        repo = Path(directory)
        uploader = repo / "scripts" / "uploader"
        data = repo / "data"
        uploader.mkdir(parents=True)
        assert read_media_root(uploader) == DEFAULT_MEDIA_ROOT
        data.mkdir()
        (data / "site.config.json").write_text(
            json.dumps({"media": {"root": "/Archive/Travels/"}}),
            encoding="utf-8",
        )
        assert read_media_root(uploader) == "/Archive/Travels"
        assert build_media_dir(
            uploader,
            {
                "city": "Monza",
                "country": "Italy",
                "media_root": "/Archive/Travels",
            },
        ) == os.path.join(
            str(repo), "media", "Archive", "Travels", "Italy", "Monza"
        )
