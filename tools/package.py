#!/usr/bin/env python3
"""Build a reproducible source archive from the explicit release file list."""
import json
from pathlib import Path, PurePosixPath
import re
import stat
import tempfile
import zipfile


def release_files(root):
    names = (root / "tools/package-files.txt").read_text().splitlines()
    if not names or len(names) != len(set(names)):
        raise ValueError("Release file list is empty or contains duplicates")
    for name in names:
        path = PurePosixPath(name)
        if not name or path.is_absolute() or ".." in path.parts or path.as_posix() != name:
            raise ValueError(f"Invalid release path: {name}")
        source = root
        for part in path.parts:
            source = source / part
            if source.is_symlink():
                raise ValueError(f"Refusing symlink: {name}")
        if not stat.S_ISREG(source.stat().st_mode):
            raise ValueError(f"Not a regular file: {name}")
    return sorted(names)


def package(root):
    root = Path(root).resolve()
    names = release_files(root)
    version = json.loads((root / "manifest.json").read_text())["version"]
    if not isinstance(version, str) or not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+", version):
        raise ValueError("Expected a stable X.Y.Z version")
    out = root / "dist" / f"ScratchPeek-{version}.zip"
    out.parent.mkdir(exist_ok=True)
    # Keep a previous archive intact if reading or compressing a file fails.
    with tempfile.TemporaryDirectory(prefix="package-", dir=out.parent) as staging:
        temporary = Path(staging) / out.name
        with zipfile.ZipFile(temporary, "w", zipfile.ZIP_DEFLATED) as archive:
            for name in names:
                info = zipfile.ZipInfo(f"scratchpeek/{name}", (2026, 1, 1, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = 0o100644 << 16
                archive.writestr(info, (root / name).read_bytes())
        temporary.replace(out)
    return out


if __name__ == "__main__":
    print(package(Path(__file__).resolve().parents[1]))
