"""Regression tests for the source-ZIP versus installable-XPI distinction."""
import json
from pathlib import Path
import tempfile
import unittest
import zipfile
from tools.build import ROOT, REQUIRED_FILES, build, validate_archive


class PackagingTests(unittest.TestCase):
    def write_fixture(self, path, omit=None, prefix="", popup=None):
        with zipfile.ZipFile(path, "w") as archive:
            for name in sorted(REQUIRED_FILES - {omit}):
                data = (ROOT / "extension" / name).read_bytes()
                if name == "manifest.json" and popup:
                    manifest = json.loads(data)
                    manifest["compose_action"]["default_popup"] = popup
                    data = json.dumps(manifest).encode()
                archive.writestr(prefix + name, data)

    def test_repeated_builds_are_identical_and_valid(self):
        first = build().read_bytes()
        second = build()
        self.assertEqual(first, second.read_bytes())
        self.assertEqual(validate_archive(second)["name"], "Markdown Diretto")

    def test_source_zip_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "project.zip"
            self.write_fixture(path, prefix="extension/")
            with self.assertRaisesRegex(ValueError, "Missing files at XPI root"):
                validate_archive(path)

    def test_missing_script_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "missing.xpi"
            self.write_fixture(path, omit="compose.js")
            with self.assertRaisesRegex(ValueError, "compose.js"):
                validate_archive(path)

    def test_missing_popup_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "entry.xpi"
            self.write_fixture(path, popup="absent.html")
            with self.assertRaisesRegex(ValueError, "Missing popup entry point"):
                validate_archive(path)


if __name__ == "__main__":
    unittest.main()
