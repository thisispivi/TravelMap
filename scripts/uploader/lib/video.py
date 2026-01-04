from logging import Logger
import logging
from PIL import Image, ImageOps
import os
import shutil
import subprocess
from typing import Optional, Mapping, Any, TypedDict
from datetime import datetime
import json

from BunnyCDN.Storage import Storage
from lib.utils import get_max_common_divisor
from lib.image import (
    TravelImage,
)


def is_video(filename: str) -> bool:
    """
    Check if the file is a video file.

    Args:
        filename (str): The name of the file.

    Returns:
        bool: True if the file is a video file, False otherwise
    """
    return filename.lower().endswith((".mp4", ".mov", ".avi", ".mkv", ".flv"))


class VideoInfo(TypedDict):
    """Metadata produced by `TravelVideo.run()` for downstream JSON usage."""

    alt: str
    width: int
    height: int
    thumbnail: str
    youtube: bool


class TravelVideo:
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

    def _get_base_storage_path(self) -> str:
        return f"{self.args['CDN_BASE_STORAGE_PATH']}{self.args['country']}/{self.args['city']}/"

    def _get_cdn_full_path(self, filename: str) -> str:
        return f"/{self.args['country']}/{self.args['city']}/{filename}"

    def extract_first_frame(self, logger: Optional[Logger] = None) -> Optional[str]:
        logger = self._get_logger(logger)

        video_path = os.path.join(self.city_folder_path, self.filename)
        if not os.path.exists(video_path):
            logger.error("Video file not found: %s", video_path)
            return None

        os.makedirs(self.results_city_folder_path, exist_ok=True)

        base_filename = os.path.splitext(self.filename)[0]
        output_filename = f"{base_filename}.jpg"
        output_path = os.path.join(self.results_city_folder_path, output_filename)

        ffmpeg_path = shutil.which("ffmpeg")
        if not ffmpeg_path:
            logger.error(
                "Unable to extract first frame: ffmpeg not found on PATH. Install ffmpeg and ensure it's on PATH. Video: %s",
                video_path,
            )
            return None

        cmd = [ffmpeg_path, "-y", "-i", video_path, "-frames:v", "1", output_path]

        try:
            subprocess.run(
                cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
            )
            logger.info("First frame extracted and saved as: %s", output_path)
            return output_path
        except FileNotFoundError as e:
            logger.error(
                "ffmpeg executable could not be started (%s). Ensure ffmpeg is installed and on PATH.",
                e,
            )
            return None
        except subprocess.CalledProcessError:
            logger.error(
                "Error extracting first frame from video (ffmpeg failed): %s",
                video_path,
            )
            return None

    def _probe_creation_time(
        self, video_path: str, logger: Optional[Logger] = None
    ) -> Optional[str]:
        """
        Best-effort extraction of the media creation time (when the video was taken)
        from embedded metadata via ffprobe. Returns a raw timestamp string.
        """
        logger = self._get_logger(logger)

        ffprobe_path = shutil.which("ffprobe")
        if not ffprobe_path:
            return None

        cmd = [
            ffprobe_path,
            "-v",
            "error",
            "-print_format",
            "json",
            "-show_entries",
            "format_tags=creation_time:stream_tags=creation_time",
            video_path,
        ]

        try:
            p = subprocess.run(
                cmd,
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
            data = json.loads(p.stdout or "{}")

            # Prefer container-level tag, else any stream tag
            fmt_ct = ((data.get("format") or {}).get("tags") or {}).get("creation_time")
            if fmt_ct:
                return fmt_ct

            for s in data.get("streams") or []:
                st_ct = ((s or {}).get("tags") or {}).get("creation_time")
                if st_ct:
                    return st_ct

            return None
        except Exception as e:
            logger.warning(
                "Unable to read video metadata (creation_time) for %s: %s",
                video_path,
                e,
            )
            return None

    def _parse_creation_time_to_ddmmyyyy(self, raw: str) -> Optional[str]:
        raw = (raw or "").strip()
        if not raw:
            return None

        # Common ffprobe outputs:
        #  - 2020-01-02T03:04:05.000000Z
        #  - 2020-01-02T03:04:05Z
        #  - 2020-01-02 03:04:05
        candidates = [raw, raw.replace("Z", "+00:00")]

        for c in candidates:
            try:
                dt = datetime.fromisoformat(c)
                return dt.strftime("%d/%m/%Y")
            except ValueError:
                pass

        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S"):
            try:
                dt = datetime.strptime(raw, fmt)
                return dt.strftime("%d/%m/%Y")
            except ValueError:
                pass

        return None

    def _get_video_creation_date_str(
        self, logger: Optional[Logger] = None
    ) -> Optional[str]:
        logger = self._get_logger(logger)
        video_path = os.path.join(self.city_folder_path, self.filename)

        raw_ct = self._probe_creation_time(video_path, logger)
        parsed = self._parse_creation_time_to_ddmmyyyy(raw_ct) if raw_ct else None
        if parsed:
            return parsed

        try:
            st = os.stat(video_path)
            ts = (
                getattr(st, "st_birthtime", None)
                or getattr(st, "st_ctime", None)
                or st.st_mtime
            )
            return datetime.fromtimestamp(ts).strftime("%d/%m/%Y")
        except Exception as e:
            logger.warning(
                "Unable to determine any video date for %s: %s", video_path, e
            )
            return None

    def _create_thumbnail_from_frame(
        self, frame_path: str, logger: Optional[Logger] = None
    ) -> Optional[VideoInfo]:
        logger = self._get_logger(logger)

        base_filename = os.path.splitext(self.filename)[0]
        thumbnail_output_path = os.path.join(
            self.results_city_folder_path, f"{base_filename}t.webp"
        )

        try:
            with Image.open(frame_path) as img:
                img = ImageOps.exif_transpose(img)
                width, height = img.size
                max_common_divisor = get_max_common_divisor(width, height)

                size_kb = TravelImage._compress_image(
                    image=img.copy(),
                    max_size_kb=int(self.args["THUMBNAIL_MAX_SIZE"]),
                    min_size_kb=int(self.args["THUMBNAIL_MIN_SIZE"]),
                    max_resolution=(
                        int(self.args["THUMBNAIL_RESOLUTION"]),
                        int(self.args["THUMBNAIL_RESOLUTION"]),
                    ),
                    output_path=thumbnail_output_path,
                    logger=logger,
                )
                if size_kb is None:
                    return None

                date_str = self._get_video_creation_date_str(logger)
                alt = (
                    f"{self.args['city']} - ({date_str})"
                    if date_str
                    else f"{self.args['city']} - "
                )

                return {
                    "alt": alt,
                    "width": int(width / max_common_divisor),
                    "height": int(height / max_common_divisor),
                    "thumbnail": self._get_cdn_full_path(f"{base_filename}t.webp"),
                    "youtube": True,
                }
        except Exception as e:
            logger.error("Error creating video thumbnail for %s: %s", self.filename, e)
            return None

    def upload_to_bunny_cdn(self, logger: Optional[Logger] = None) -> None:
        logger = self._get_logger(logger)

        try:
            storage = Storage(
                api_key=self.args["CDN_STORAGE_ZONE_API_KEY"],
                storage_zone=self.args["CDN_STORAGE_ZONE_NAME"],
                storage_zone_region=self.args["CDN_STORAGE_ZONE_REGION"],
            )

            base_filename = os.path.splitext(self.filename)[0]
            base_storage_path = self._get_base_storage_path()

            storage.PutFile(
                file_name=f"{base_filename}t.webp",
                local_upload_file_path=self.results_city_folder_path,
                storage_path=f"{base_storage_path}{base_filename}t.webp",
            )

            logger.info(
                "Uploaded video thumbnail for %s to BunnyCDN Storage.", self.filename
            )
        except Exception as e:
            logger.error(
                "Error uploading video thumbnail %s to BunnyCDN: %s", self.filename, e
            )

    def run(self, logger: Optional[Logger] = None) -> Optional[VideoInfo]:
        logger = self._get_logger(logger)

        frame_path = self.extract_first_frame(logger)
        if not frame_path:
            return None

        info = self._create_thumbnail_from_frame(frame_path, logger)

        try:
            os.remove(frame_path)
        except OSError:
            pass

        if info is None:
            return None

        self.upload_to_bunny_cdn(logger)
        return info
