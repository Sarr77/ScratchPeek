"""Release archives must contain only the reviewed file list."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("package", ROOT / "tools/package.py")
packager = importlib.util.module_from_spec(spec)
spec.loader.exec_module(packager)


class PackageTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="scratchpeek-package-test-")
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        (self.root / "tools").mkdir()
        (self.root / "docs").mkdir()
        (self.root / "manifest.json").write_text(json.dumps({"version": "0.11.1"}))
        (self.root / "docs/guide.md").write_text("User guide\n")
        self.names = ["manifest.json", "docs/guide.md", "tools/package-files.txt"]
        self.write_list(self.names)

    def write_list(self, names):
        (self.root / "tools/package-files.txt").write_text("\n".join(names) + "\n")

    def test_only_listed_files_and_reproducible_bytes(self):
        (self.root / "docs/private-note.md").write_text("local only")
        (self.root / "tools/__pycache__").mkdir()
        (self.root / "tools/__pycache__/package.pyc").write_bytes(b"cache")
        archive = packager.package(self.root)
        original = archive.read_bytes()
        (self.root / "docs/guide.md").touch()
        self.assertEqual(original, packager.package(self.root).read_bytes())
        with zipfile.ZipFile(archive) as result:
            self.assertEqual(result.namelist(), ["scratchpeek/" + name for name in sorted(self.names)])
            self.assertIsNone(result.testzip())
            self.assertEqual(result.read("scratchpeek/docs/guide.md"), b"User guide\n")

    def test_rejects_missing_files_without_replacing_previous_archive(self):
        archive = packager.package(self.root)
        original = archive.read_bytes()
        (self.root / "docs/guide.md").unlink()
        with self.assertRaises(FileNotFoundError):
            packager.package(self.root)
        self.assertEqual(original, archive.read_bytes())

    def test_rejects_symlink_file_and_parent(self):
        original = self.root / "docs/guide.md"
        original.rename(self.root / "guide.md")
        original.symlink_to("../guide.md")
        with self.assertRaisesRegex(ValueError, "symlink"):
            packager.package(self.root)
        original.unlink()
        (self.root / "docs").rmdir()
        (self.root / "elsewhere").mkdir()
        (self.root / "elsewhere/guide.md").write_text("outside docs")
        (self.root / "docs").symlink_to("elsewhere", target_is_directory=True)
        with self.assertRaisesRegex(ValueError, "symlink"):
            packager.package(self.root)

    def test_rejects_directory(self):
        self.write_list(self.names + ["docs"])
        with self.assertRaisesRegex(ValueError, "regular file"):
            packager.package(self.root)

    def test_rejects_unsafe_paths_and_duplicates(self):
        for name in ("../private", "/etc/passwd", "docs/../manifest.json", "./manifest.json", "docs//guide.md", "", "manifest.json"):
            with self.subTest(name=name):
                self.write_list(self.names + [name])
                with self.assertRaises(ValueError):
                    packager.package(self.root)

    def test_rejects_unsafe_version(self):
        (self.root / "manifest.json").write_text(json.dumps({"version": "../../private"}))
        with self.assertRaisesRegex(ValueError, "version"):
            packager.package(self.root)

    def test_project_runtime_and_file_list_are_complete(self):
        names = set(packager.release_files(ROOT))
        self.assertIn("tools/package-files.txt", names)
        for path in ROOT.iterdir():
            if path.suffix in (".qml", ".js", ".py") or path.name in ("manifest.json", "qmldir", "README.md", "LICENSE", "preview.png"):
                self.assertIn(path.name, names)
        for line in (ROOT / "qmldir").read_text().splitlines():
            if line.strip():
                self.assertIn(line.split()[-1], names)


if __name__ == "__main__":
    unittest.main()
