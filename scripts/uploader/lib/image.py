from logging import Logger
from PIL import Image, ImageOps
import os
import shutil
import logging
from typing import Optional, Tuple, Mapping, Any
from BunnyCDN.Storage import Storage
from lib.utils import get_max_common_divisor


class TravelImage:
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
        return logger or logging.getLogger(__name__)

    @staticmethod
    def _file_size_kb(path: str) -> float:
        return os.path.getsize(path) / 1024

    @staticmethod
    def _normalize_for_webp(image: Image.Image) -> Image.Image:
        if image.mode not in ("RGB", "RGBA"):
            return image.convert("RGB")
        return image

    def _get_base_storage_path(self) -> str:
        return f"{self.args['CDN_BASE_STORAGE_PATH']}{self.args['country']}/{self.args['city']}/"

    def _get_cdn_full_path(self, filename: str) -> str:
        base_storage_path = self._get_base_storage_path()
        return f"{self.args['CDN_BASE_URL']}{base_storage_path}{filename}"

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
        Compress image to ensure it fits the size constraints.

        Returns:
            float | None: File size in KB (or None on error).
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

                if quality == 100 and last_size_kb <= max_size_kb:
                    break

                if min_size_kb <= last_size_kb <= max_size_kb:
                    break

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
        Duplicate the image without compression.
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
        Helper function to handle image compression or duplication based on size constraints.
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

    def compress(self, logger: Optional[Logger] = None) -> None:
        """
        Compress the image to fit the size constraints.
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

                image = {}
                image["alt"] = ""
                width, height = img.size
                max_common_divisor = get_max_common_divisor(width, height)
                image["width"] = int(width / max_common_divisor)
                image["height"] = int(height / max_common_divisor)
                image["thumbnail"] = self._get_cdn_full_path(f"{base_filename}t.webp")
                image["original"] = self._get_cdn_full_path(f"{base_filename}c.webp")
                return image

        except Exception as e:
            logger.error("Error processing image %s: %s", self.filename, e)

    def upload_to_bunny_cdn(self, logger: Optional[Logger] = None):
        """
        Upload the compressed and thumbnail images to BunnyCDN Storage.
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
