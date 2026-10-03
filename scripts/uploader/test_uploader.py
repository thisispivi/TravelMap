"""Regression tests use temporary media and stub every upload boundary."""

import json
import logging
import os
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import Mock, patch

from PIL import Image

import main as uploader
from lib.args import get_args
from lib.config import build_media_dir, read_media_root
from lib.env import get_env
from lib.export import export_json
from lib.image import TravelImage
from lib.paths import build_base_storage_path, setup_paths
from lib.storage import upload_file
from lib.video import TravelVideo


class UploaderTests(unittest.TestCase):
    """Protect publication from partial failures and unsafe destination paths."""

    def setUp(self) -> None:
        """Create an isolated repository with one small source image."""
        self.temporary = TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.repo = Path(self.temporary.name)
        self.root = self.repo / "scripts" / "uploader"
        self.photos = self.root / "photos" / "Rome"
        self.photos.mkdir(parents=True)
        self.results = self.root / "results" / "Rome"
        self.results.mkdir(parents=True)
        Image.new("RGB", (16, 8), "red").save(self.photos / "001.png")
        self.args = {
            "city": "Rome", "country": "Italy", "local": True,
            "media_root": "/Travels", "media_dir": str(self.repo / "media"),
            "COMPRESSED_MIN_SIZE": "750", "COMPRESSED_MAX_SIZE": "1500", "COMPRESSED_RESOLUTION": "2000",
            "THUMBNAIL_MIN_SIZE": "70", "THUMBNAIL_MAX_SIZE": "250", "THUMBNAIL_RESOLUTION": "900",
            "CDN_STORAGE_ZONE_API_KEY": "test-only-key", "CDN_STORAGE_ZONE_NAME": "test-zone",
            "CDN_STORAGE_ZONE_REGION": "", "CDN_BASE_STORAGE_PATH": "Travels",
        }

    def test_paths_reject_traversal_and_windows_aliases(self) -> None:
        """CLI names cannot redirect writes or uploads out of the selected city."""
        for city in ("../escape", "..", "C:\\escape", "Rome:stream", "NUL", "Rome."):
            with self.subTest(city=city), self.assertRaises(ValueError):
                get_args(["main.py", "-c", city, "-C", "Italy"], logging.getLogger(__name__))
            with self.subTest(city=city), self.assertRaises(ValueError):
                build_media_dir(self.root, {**self.args, "city": city})

    def test_local_paths_and_storage_paths_preserve_valid_names(self) -> None:
        """Nested media roots and storage prefixes have exactly one separator."""
        self.assertEqual(build_media_dir(self.root, self.args), str(self.repo / "media" / "Travels" / "Italy" / "Rome"))
        self.assertEqual(Path(setup_paths(str(self.root), "Rome")[1]), self.photos)
        self.assertEqual(build_base_storage_path(self.args), "Travels/Italy/Rome/")
        self.assertEqual(build_base_storage_path({**self.args, "CDN_BASE_STORAGE_PATH": "Travels/"}), "Travels/Italy/Rome/")

    def test_malformed_configuration_does_not_silently_change_media_root(self) -> None:
        """A broken config must not publish assets under a fallback path."""
        self.assertEqual(read_media_root(self.root), "/Travels")
        (self.repo / "data").mkdir()
        (self.repo / "data" / "site.config.json").write_text("{broken", encoding="utf-8")
        with self.assertRaises(json.JSONDecodeError):
            read_media_root(self.root)

    def test_env_rejects_invalid_sizes_without_echoing_values(self) -> None:
        """Bad sizing settings fail before the pipeline creates any output."""
        (self.root / "env").mkdir()
        (self.root / "env" / "example.env").write_text("\n".join(f"{key}={value}" for key, value in self.args.items()), encoding="utf-8")
        with patch.dict(os.environ, {"THUMBNAIL_RESOLUTION": "private-value"}, clear=True):
            with self.assertRaisesRegex(ValueError, "THUMBNAIL.*integers") as failure:
                get_env(self.root, Mock())
            self.assertNotIn("private-value", str(failure.exception))

    def test_export_preserves_manifest_when_serialization_fails(self) -> None:
        """Serialization must finish before the old manifest is replaced."""
        target = export_json([{"width": 2}], self.root, "Rome")
        with self.assertRaises(TypeError):
            export_json([object()], self.root, "Rome")
        self.assertEqual(json.loads(target.read_text()), [{"width": 2}])

    def test_small_photos_are_real_webp_files_and_copy_locally(self) -> None:
        """The small-file path must encode WEBP rather than rename source bytes."""
        processor = TravelImage("001.png", self.args, str(self.photos), str(self.results))
        with patch("lib.storage.requests.put") as upload:
            info = processor.run(Mock())
        upload.assert_not_called()
        self.assertIsNotNone(info)
        for suffix in ("c", "t"):
            with Image.open(self.repo / "media" / f"001{suffix}.webp") as image:
                self.assertEqual(image.format, "WEBP")

    def test_failed_encoding_never_uploads_old_outputs(self) -> None:
        """A previous run's files cannot mask a failed encode."""
        processor = TravelImage("001.png", self.args, str(self.photos), str(self.results))
        (self.results / "001c.webp").write_bytes(b"old")
        (self.results / "001t.webp").write_bytes(b"old")
        with patch.object(TravelImage, "_save_webp_high_quality", return_value=None), patch.object(processor, "copy_to_media") as copy:
            self.assertIsNone(processor.run(Mock()))
        copy.assert_not_called()

    def test_http_failures_and_redirects_are_not_successful_uploads(self) -> None:
        """The remote status is checked without leaking response bodies or keys."""
        for status in (301, 403, 500):
            with self.subTest(status=status), patch("lib.storage.requests.put") as put:
                put.return_value.__enter__.return_value.status_code = status
                with self.assertRaisesRegex(RuntimeError, f"HTTP {status}"):
                    upload_file(self.args, str(self.photos), "001.png")
                self.assertEqual(put.call_args.kwargs["timeout"], (10, 60))
                self.assertFalse(put.call_args.kwargs["allow_redirects"])

    def test_image_and_video_upload_failures_propagate(self) -> None:
        """Neither pipeline may publish metadata after a failed transfer."""
        for kind, module in ((TravelImage, "lib.image"), (TravelVideo, "lib.video")):
            processor = kind("001.png", self.args, str(self.photos), str(self.results))
            with self.subTest(kind=kind), patch(f"{module}.upload_file", side_effect=RuntimeError("Upload failed")):
                with self.assertRaisesRegex(RuntimeError, "Upload failed"):
                    processor.upload_to_bunny_cdn(Mock())

    def test_failed_processing_preserves_the_previous_manifest(self) -> None:
        """A partial run exits unsuccessfully and never exports a shortened list."""
        target = self.root / "Rome.json"
        target.write_text('[{"original":"previous"}]', encoding="utf-8")
        with patch.object(uploader, "__file__", str(self.root / "main.py")), patch.object(uploader, "get_env", return_value=self.args), patch.object(uploader, "get_custom_logger", return_value=Mock()), patch.object(uploader, "_process_city_entry", return_value=None):
            self.assertEqual(uploader.main(["main.py", "-c", "Rome", "-C", "Italy", "--local"]), 2)
        self.assertEqual(json.loads(target.read_text()), [{"original": "previous"}])

    def test_colliding_source_names_fail_before_processing(self) -> None:
        """Two source extensions sharing a basename would overwrite the same WEBP."""
        (self.photos / "001.jpg").write_bytes(b"duplicate")
        with patch.object(uploader, "__file__", str(self.root / "main.py")), patch.object(uploader, "get_env", return_value=self.args), patch.object(uploader, "get_custom_logger", return_value=Mock()), patch.object(uploader, "_process_city_entry") as process:
            self.assertEqual(uploader.main(["main.py", "-c", "Rome", "-C", "Italy", "--local"]), 2)
        process.assert_not_called()


if __name__ == "__main__":
    unittest.main()
