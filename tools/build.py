"""Build and validate a reproducible XPI using only Python's standard library."""
import argparse
import json
from pathlib import Path, PurePosixPath
import zipfile

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_FILES = {
    "manifest.json", "popup.html", "popup.js", "popup.css", "compose.js",
    "renderer.js", "vendor/marked.js", "vendor/marked-LICENSE.md",
}


def validate_archive(path):
    """Reject source ZIPs, missing runtime files and damaged archives."""
    with zipfile.ZipFile(path) as archive:
        names = archive.namelist()
        if len(names) != len(set(names)):
            raise ValueError("Duplicate ZIP members")
        missing = REQUIRED_FILES - set(names)
        if missing:
            raise ValueError("Missing files at XPI root: " + ", ".join(sorted(missing)))
        if archive.testzip() is not None:
            raise ValueError("ZIP checksum failure")
        for name in names:
            member = PurePosixPath(name)
            if member.is_absolute() or ".." in member.parts:
                raise ValueError("Unsafe archive path: " + name)
        manifest = json.loads(archive.read("manifest.json"))
        if manifest.get("manifest_version") != 2:
            raise ValueError("This build expects Manifest V2")
        if manifest.get("permissions") != ["compose"]:
            raise ValueError("Unexpected extension permissions")
        popup = manifest["compose_action"]["default_popup"]
        if popup not in names:
            raise ValueError("Missing popup entry point: " + popup)
        if not manifest["browser_specific_settings"]["gecko"].get("id"):
            raise ValueError("Missing Thunderbird extension ID")
        return manifest


def build():
    extension = ROOT / "extension"
    manifest = json.loads((extension / "manifest.json").read_text(encoding="utf-8"))
    package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
    if package["version"] != manifest["version"]:
        raise ValueError("Package and manifest versions differ")
    destination = ROOT / "dist"
    destination.mkdir(exist_ok=True)
    output = destination / f'markdown-diretto-{manifest["version"]}.xpi'
    temporary = output.with_suffix(".xpi.tmp")
    try:
        with zipfile.ZipFile(temporary, "w", zipfile.ZIP_DEFLATED) as archive:
            for name in sorted(REQUIRED_FILES):
                # Fixed timestamps, ordering and permissions make repeat builds identical.
                info = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                info.create_system = 3
                info.external_attr = 0o100644 << 16
                archive.writestr(info, (extension / name).read_bytes())
        validate_archive(temporary)
        temporary.replace(output)
    finally:
        temporary.unlink(missing_ok=True)
    return output


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--verify", type=Path, help="Validate an existing XPI")
    args = parser.parse_args()
    try:
        if args.verify:
            validate_archive(args.verify)
            print(f"Valid XPI structure: {args.verify}")
        else:
            print(build())
    except (ValueError, KeyError, OSError, zipfile.BadZipFile) as error:
        parser.exit(1, f"Packaging error: {error}\n")
