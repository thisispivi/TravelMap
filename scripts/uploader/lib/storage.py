"""The uploader's single HTTP boundary for Bunny Storage writes."""

import re
from pathlib import Path
from typing import Any, Mapping
from urllib.parse import quote

import requests

from lib.paths import build_base_storage_path


def upload_file(args: Mapping[str, Any], directory: str, filename: str) -> None:
    """Stream a file to Bunny Storage and fail on redirects, HTTP errors, or timeouts."""
    region = str(args.get("CDN_STORAGE_ZONE_REGION", ""))
    zone = str(args.get("CDN_STORAGE_ZONE_NAME", ""))
    key = str(args.get("CDN_STORAGE_ZONE_API_KEY", ""))
    if (not re.fullmatch(r"[a-zA-Z0-9-]+", zone) or not key
            or (region and not re.fullmatch(r"[a-zA-Z0-9-]+", region))):
        raise ValueError("Configure the Bunny storage zone, region, and API key before uploading.")
    host = "storage.bunnycdn.com" if region in ("", "de") else f"{region}.storage.bunnycdn.com"
    storage_path = build_base_storage_path(args).lstrip("/") + filename
    url = f"https://{host}/{zone}/{quote(storage_path, safe='/')}"
    with (Path(directory) / filename).open("rb") as content:
        with requests.put(url, data=content, headers={"AccessKey": key, "Content-Type": "application/octet-stream"},
                          timeout=(10, 60), allow_redirects=False) as response:
            if not 200 <= response.status_code < 300:
                raise RuntimeError(f"Bunny Storage rejected the upload (HTTP {response.status_code}).")
