"""
Image preparation for TravelMap uploads.

This module:
- Reads a source image from a city folder.
- Produces two WEBP outputs in a results folder:
  - a "compressed" variant (suffix: `c.webp`)
  - a "thumbnail" variant (suffix: `t.webp`)
- Optionally uploads both outputs to BunnyCDN Storage.

Expected `args` keys (strings unless noted):
- country, city
- CDN_BASE_URL, CDN_BASE_STORAGE_PATH
- CDN_STORAGE_ZONE_API_KEY, CDN_STORAGE_ZONE_NAME, CDN_STORAGE_ZONE_REGION
- COMPRESSED_MIN_SIZE, COMPRESSED_MAX_SIZE, COMPRESSED_RESOLUTION (ints in string form)
- THUMBNAIL_MIN_SIZE, THUMBNAIL_MAX_SIZE, THUMBNAIL_RESOLUTION (ints in string form)
"""

from logging import Logger
from PIL import Image, ImageOps
import os
import shutil
import logging
from typing import Optional, Tuple, Mapping, Any, TypedDict
from BunnyCDN.Storage import Storage
from lib.utils import get_max_common_divisor


class ImageInfo(TypedDict):
    """Metadata produced by `TravelImage.compress()` for downstream JSON usage."""

    alt: str
    width: int
    height: int
    thumbnail: str
    original: str


class TravelImage:
    """
    Represents a single input image and its derived artifacts (compressed + thumbnail).

    `city_folder_path`:
        Directory containing the original file (`self.filename`).
    `results_city_folder_path`:
        Directory where derived files are written.
    """

    def __init__(
        self,
        filename: str,
        args: Mapping[str, Any],
        city_folder_path: str,
        results_city_folder_path: str,
    ):
        self.filename = filename
        self.args = args
        self.city_folder_path = city_folder_path
        self.results_city_folder_path = results_city_folder_path

    @staticmethod
    def _get_logger(logger: Optional[Logger]) -> Logger:
        """Return the provided logger, or a module-scoped default logger."""
        return logger or logging.getLogger(__name__)

    @staticmethod
    def _file_size_kb(path: str) -> float:
        """Get file size in kilobytes (KB)."""
        return os.path.getsize(path) / 1024

    @staticmethod
    def _normalize_for_webp(image: Image.Image) -> Image.Image:
        """
        Ensure image is in a WEBP-friendly mode.

        Note: Palette/L/CMYK images are converted to RGB. RGBA is preserved.
        """
        if image.mode not in ("RGB", "RGBA"):
            return image.convert("RGB")
        return image

    def _get_base_storage_path(self) -> str:
        """Build the storage path prefix used both for CDN URLs and Bunny storage paths."""
        return f"{self.args['CDN_BASE_STORAGE_PATH']}{self.args['country']}/{self.args['city']}/"

    def _get_cdn_full_path(self, filename: str) -> str:
        """Build a public CDN URL for a given filename inside the city storage folder."""
        return f"/{self.args['country']}/{self.args['city']}/{filename}"

    @staticmethod
    def _compress_image(
        *,
        image: Image.Image,
        max_size_kb: int,
        min_size_kb: int,
        max_resolution: Tuple[int, int],
        output_path: str,
        quality_step: int = 5,
        logger: Optional[Logger] = None,
    ) -> Optional[float]:
        """
        Save `image` as WEBP to `output_path` while attempting to satisfy size constraints.

        Process:
        - Applies EXIF transpose (fixes orientation issues from camera metadata).
        - Resizes in-place using `thumbnail(max_resolution)` (preserves aspect ratio).
        - Iterates WEBP `quality` from 100 down to ~10 in steps of `quality_step`.
        - Stops when the output is within [min_size_kb, max_size_kb], or when going lower
          would drop below `min_size_kb`.

        Returns:
            The final file size in KB, or `None` on error.
        """
        logger = TravelImage._get_logger(logger)

        try:
            image = ImageOps.exif_transpose(image)
            image.thumbnail(max_resolution)
            image = TravelImage._normalize_for_webp(image)

            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            last_size_kb: Optional[float] = None
            for quality in range(100, 5, -quality_step):
                image.save(output_path, "WEBP", quality=quality)
                last_size_kb = TravelImage._file_size_kb(output_path)

                logger.info("Quality: %s, File size: %.2f KB", quality, last_size_kb)

                # If even at max quality we are already below the max bound, keep it.
                if quality == 100 and last_size_kb <= max_size_kb:
                    break

                # Target range achieved.
                if min_size_kb <= last_size_kb <= max_size_kb:
                    break

                # Went too small; stop decreasing quality further.
                if last_size_kb < min_size_kb:
                    break

            return last_size_kb

        except Exception as e:
            logger.error("Error compressing image: %s", e)
            return None

    @staticmethod
    def _duplicate_image(
        source_path: str, target_path: str, logger: Optional[Logger] = None
    ) -> None:
        """
        Duplicate the source file bytes to `target_path`.

        Note:
            This does *not* re-encode to WEBP. If `target_path` ends with `.webp` but
            `source_path` is not WEBP, the extension may not match the file contents.
        """
        logger = TravelImage._get_logger(logger)

        try:
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            shutil.copy2(source_path, target_path)
        except Exception as e:
            logger.error("Error duplicating image: %s", e)

    def _handle_image_compression(
        self,
        *,
        img: Image.Image,
        source_path: str,
        original_size_kb: float,
        min_size_kb: int,
        max_size_kb: int,
        resolution: int,
        output_path: str,
        logger: Optional[Logger],
        filename: str,
    ) -> None:
        """
        Decide whether to compress or duplicate based on `original_size_kb`.

        If the original is already smaller than `min_size_kb`, the file is duplicated
        (see `_duplicate_image` note regarding extensions/contents).
        Otherwise, the image is re-encoded to WEBP under the provided constraints.
        """
        logger = self._get_logger(logger)

        if original_size_kb < min_size_kb:
            logger.info(
                "Image %s is already compressed or smaller than required.", filename
            )
            self._duplicate_image(source_path, output_path, logger)
            return

        logger.info("Compressing image %s...", filename)
        file_size_kb = self._compress_image(
            image=img.copy(),
            max_size_kb=max_size_kb,
            min_size_kb=min_size_kb,
            max_resolution=(resolution, resolution),
            output_path=output_path,
            logger=logger,
        )
        if file_size_kb is not None:
            logger.info("Compressed %s to %.2f KB.", filename, file_size_kb)

    def compress(self, logger: Optional[Logger] = None) -> Optional[ImageInfo]:
        """
        Create compressed + thumbnail WEBP files and return metadata for downstream use.

        Outputs (written to `results_city_folder_path`):
            - `{base_filename}c.webp` (compressed)
            - `{base_filename}t.webp` (thumbnail)

        Returns:
            ImageInfo on success, otherwise `None` (and logs the error).
        """
        logger = self._get_logger(logger)

        input_path = os.path.join(self.city_folder_path, self.filename)
        base_filename = os.path.splitext(self.filename)[0]

        try:
            os.makedirs(self.results_city_folder_path, exist_ok=True)
            with Image.open(input_path) as img:
                original_size_kb = self._file_size_kb(input_path)

                compressed_output_path = os.path.join(
                    self.results_city_folder_path, f"{base_filename}c.webp"
                )
                thumbnail_output_path = os.path.join(
                    self.results_city_folder_path, f"{base_filename}t.webp"
                )

                self._handle_image_compression(
                    img=img,
                    source_path=input_path,
                    original_size_kb=original_size_kb,
                    min_size_kb=int(self.args["COMPRESSED_MIN_SIZE"]),
                    max_size_kb=int(self.args["COMPRESSED_MAX_SIZE"]),
                    resolution=int(self.args["COMPRESSED_RESOLUTION"]),
                    output_path=compressed_output_path,
                    logger=logger,
                    filename=self.filename,
                )

                self._handle_image_compression(
                    img=img,
                    source_path=input_path,
                    original_size_kb=original_size_kb,
                    min_size_kb=int(self.args["THUMBNAIL_MIN_SIZE"]),
                    max_size_kb=int(self.args["THUMBNAIL_MAX_SIZE"]),
                    resolution=int(self.args["THUMBNAIL_RESOLUTION"]),
                    output_path=thumbnail_output_path,
                    logger=logger,
                    filename=self.filename,
                )

                if os.path.exists(thumbnail_output_path) and os.path.exists(
                    compressed_output_path
                ):
                    if os.path.getsize(thumbnail_output_path) > os.path.getsize(
                        compressed_output_path
                    ):
                        logger.error(
                            "Thumbnail size is larger than compressed image for %s",
                            self.filename,
                        )

                width, height = img.size
                max_common_divisor = get_max_common_divisor(width, height)

                image: ImageInfo = {
                    "alt": "",
                    # Store aspect ratio (reduced fraction) rather than raw pixels.
                    "width": int(width / max_common_divisor),
                    "height": int(height / max_common_divisor),
                    "thumbnail": self._get_cdn_full_path(f"{base_filename}t.webp"),
                    "original": self._get_cdn_full_path(f"{base_filename}c.webp"),
                }
                return image

        except Exception as e:
            logger.error("Error processing image %s: %s", self.filename, e)
            return None

    def upload_to_bunny_cdn(self, logger: Optional[Logger] = None) -> None:
        """
        Upload the derived WEBP files (`*c.webp` and `*t.webp`) to BunnyCDN Storage.

        Assumes `compress()` has already produced the output files in
        `results_city_folder_path`.
        """
        try:
            storage = Storage(
                api_key=self.args["CDN_STORAGE_ZONE_API_KEY"],
                storage_zone=self.args["CDN_STORAGE_ZONE_NAME"],
                storage_zone_region=self.args["CDN_STORAGE_ZONE_REGION"],
            )

            base_filename = os.path.splitext(self.filename)[0]

            base_storage_path = f"{self.args['CDN_BASE_STORAGE_PATH']}{self.args['country']}/{self.args['city']}/"

            storage.PutFile(
                file_name=f"{base_filename}c.webp",
                local_upload_file_path=self.results_city_folder_path,
                storage_path=f"{base_storage_path}{base_filename}c.webp",
            )
            storage.PutFile(
                file_name=f"{base_filename}t.webp",
                local_upload_file_path=self.results_city_folder_path,
                storage_path=f"{base_storage_path}{base_filename}t.webp",
            )

            logger = TravelImage._get_logger(logger)
            logger.info("Uploaded %s to BunnyCDN Storage.", self.filename)
        except Exception as e:
            logger = TravelImage._get_logger(logger)
            logger.error("Error uploading image %s to BunnyCDN: %s", self.filename, e)

    def run(self, logger: Optional[Logger] = None) -> None:
        """
        Convenience method to compress and upload the image in one call.
        Args:
            logger (Optional[Logger]): Logger instance.
        Returns:
            ImageInfo: Metadata produced by compress().
        """
        image_info = self.compress(logger)
        self.upload_to_bunny_cdn(logger)
        return image_info
