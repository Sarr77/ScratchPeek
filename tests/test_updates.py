"""Real local Git updates and atomic swaps; no network or desktop access."""
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("scratchpeek_update", ROOT / "update.py")
updates = importlib.util.module_from_spec(spec)
spec.loader.exec_module(updates)


class LocalUpdater(updates.Updater):
    def __init__(self, home, state, upstream):
        super().__init__(home, state)
        self.upstream = upstream
        self.requests = 0
        self.reloads = 0
        self.release = {"tag_name": "v0.11.0", "draft": False, "prerelease": False}

    def latest(self):
        self.requests += 1
        return self.release

    def git(self, directory, *args):
        args = tuple(str(self.upstream) if part == updates.REPOSITORY else part for part in args)
        return super().git(directory, *args)

    def validate(self, directory):
        if shutil.which("omarchy"):
            super().validate(directory)
        else:
            # CI has no Omarchy installation. The native run above uses its CLI.
            manifest = json.loads((directory / "manifest.json").read_text())
            if not all((directory / item).is_file() for item in manifest["entryPoints"].values()):
                raise ValueError("missing entry point")

    def reload(self):
        self.reloads += 1


class UpdatesTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="scratchpeek-updates-test-")
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.remote = self.base / "upstream"
        self.remote.mkdir()
        self.worker = LocalUpdater(self.base / "home", self.base / "state", self.remote)
        self.worker.git(self.remote, "init", "-q")
        self.write_release("0.10.0")
        self.worker.plugin.parent.mkdir(parents=True)
        self.worker.command("git", "clone", "-q", str(self.remote), str(self.worker.plugin))
        self.worker.command("git", "-C", str(self.worker.plugin), "remote", "set-url", "origin", updates.REPOSITORY)
        self.original = self.worker.git(self.worker.plugin, "rev-parse", "HEAD")
        self.worker.state.mkdir(parents=True)
        self.prefs = self.worker.state / "preferences.json"
        self.prefs.write_text(json.dumps({"version": 1, "settings": {
            "autoUpdates": True, "language": "pl", "hintsMode": "auto", "hintsUsed": 61,
            "accentColor": "#EF98F5"}}))
        self.saved = self.prefs.read_bytes()
        self.write_release("0.11.0")

    def write_release(self, value):
        manifest = {"schemaVersion": 1, "id": updates.PLUGIN_ID, "name": "ScratchPeek", "author": "Sarr",
                    "version": value, "kinds": ["bar-widget"], "entryPoints": {"barWidget": "Widget.qml"}}
        (self.remote / "manifest.json").write_text(json.dumps(manifest))
        (self.remote / "Widget.qml").write_text('import QtQuick\nItem { property string release: "' + value + '" }\n')
        self.commit(self.remote)
        self.worker.git(self.remote, "tag", "v" + value)

    def commit(self, path):
        self.worker.git(path, "add", ".")
        self.worker.git(path, "-c", "user.name=Test", "-c", "user.email=test@example.invalid", "commit", "-qm", "Fixture")

    def assert_unchanged(self):
        self.assertEqual(self.worker.git(self.worker.plugin, "rev-parse", "HEAD"), self.original)
        self.assertEqual(self.prefs.read_bytes(), self.saved)
        self.assertFalse(list(self.worker.plugin.parent.parent.glob(".scratchpeek-update-*")))

    def test_stable_release_swaps_whole_tree_and_keeps_preferences(self):
        inode = self.worker.plugin.stat().st_ino
        self.assertEqual(self.worker.run(now=1000), "updated")
        self.assertNotEqual(self.worker.plugin.stat().st_ino, inode)
        self.assertEqual(json.loads((self.worker.plugin / "manifest.json").read_text())["version"], "0.11.0")
        self.assertEqual(self.worker.git(self.worker.plugin, "status", "--porcelain"), "")
        self.assertEqual(self.prefs.read_bytes(), self.saved)
        self.assertEqual(self.worker.reloads, 1)
        self.assertFalse(list(self.worker.plugin.parent.parent.glob(".scratchpeek-update-*")))

    def test_once_daily_across_new_processes(self):
        self.worker.release["tag_name"] = "v0.10.0"
        self.assertEqual(self.worker.run(now=1000), "current")
        fresh = LocalUpdater(self.worker.home, self.worker.state.parent, self.remote)
        self.assertEqual(fresh.run(now=1001), "not-due")
        self.assertEqual(fresh.requests, 0)
        self.assertEqual(fresh.run(now=1000 + updates.DAY), "updated")
        self.assertEqual(fresh.requests, 1)

    def test_disabled_survives_a_new_worker(self):
        data = json.loads(self.prefs.read_text())
        data["settings"]["autoUpdates"] = False
        self.prefs.write_text(json.dumps(data))
        fresh = LocalUpdater(self.worker.home, self.worker.state.parent, self.remote)
        self.assertEqual(fresh.run(now=1000), "disabled")
        self.assertEqual(fresh.requests, 0)
        self.assertFalse(fresh.result.exists())

    def test_first_start_defaults_to_enabled(self):
        data = json.loads(self.prefs.read_text())
        del data["settings"]["autoUpdates"]
        self.prefs.write_text(json.dumps(data))
        self.assertTrue(self.worker.enabled())

    def test_invalid_preferences_never_start_network(self):
        for raw in ('bad json', '{"version":1,"settings":[]}', '{"version":2,"settings":{}}'):
            with self.subTest(raw=raw):
                self.prefs.write_text(raw)
                self.assertEqual(self.worker.run(now=1000), "disabled")
                self.assertEqual(self.worker.requests, 0)

    def test_lock_prevents_concurrent_updates(self):
        with (self.worker.state / "updates.lock").open("w") as lock:
            updates.fcntl.flock(lock, updates.fcntl.LOCK_EX | updates.fcntl.LOCK_NB)
            self.assertEqual(self.worker.run(now=1000), "busy")
            self.assertEqual(self.worker.requests, 0)

    def test_offline_keeps_old_version_and_waits_until_tomorrow(self):
        with patch.object(self.worker, "latest", side_effect=OSError("offline")):
            self.assertEqual(self.worker.run(now=1000), "failed")
        self.assertEqual(self.worker.run(now=1001), "not-due")
        self.assert_unchanged()

    def test_draft_prerelease_bad_tags_and_malformed_responses_are_rejected(self):
        for release in ([], None, {}, {"draft": True}, {"prerelease": True},
                        {"draft": False, "prerelease": False, "tag_name": "v0.11.0-beta"},
                        {"draft": False, "prerelease": False, "tag_name": "v0.11.0;touch /tmp/x"}):
            with self.subTest(release=release):
                self.worker.release = release
                self.worker.result.unlink(missing_ok=True)
                self.assertEqual(self.worker.run(now=1000), "failed")
                self.assert_unchanged()

    def test_modified_and_untracked_files_prevent_network(self):
        (self.worker.plugin / "local.txt").write_text("user file")
        self.assertEqual(self.worker.run(now=1000), "local-changes")
        self.assertEqual(self.worker.requests, 0)
        self.assert_unchanged()

    def test_custom_origin_is_not_replaced(self):
        self.worker.command("git", "-C", str(self.worker.plugin), "remote", "set-url", "origin", "https://example.invalid/fork")
        self.assertEqual(self.worker.run(now=1000), "local-changes")
        self.assertEqual(self.worker.requests, 0)
        self.assert_unchanged()

    def test_development_symlink_is_skipped(self):
        real = self.base / "development"
        self.worker.plugin.rename(real)
        self.worker.plugin.symlink_to(real, target_is_directory=True)
        self.assertEqual(self.worker.run(now=1000), "local-changes")
        self.assertEqual(self.worker.requests, 0)
        self.assert_unchanged()

    def test_local_commit_is_not_discarded(self):
        (self.worker.plugin / "local.txt").write_text("local feature")
        self.commit(self.worker.plugin)
        self.original = self.worker.git(self.worker.plugin, "rev-parse", "HEAD")
        self.assertEqual(self.worker.run(now=1000), "failed")
        self.assert_unchanged()

    def test_validation_failure_does_not_change_installed_tree(self):
        with patch.object(self.worker, "validate", side_effect=ValueError("invalid manifest")):
            self.assertEqual(self.worker.run(now=1000), "failed")
        self.assert_unchanged()

    def test_release_version_must_match_manifest(self):
        self.worker.git(self.remote, "tag", "v0.12.0")
        self.worker.release["tag_name"] = "v0.12.0"
        self.assertEqual(self.worker.run(now=1000), "failed")
        self.assert_unchanged()

    def test_failed_atomic_swap_leaves_original_in_place(self):
        with patch.object(updates, "exchange", side_effect=OSError("no space")):
            self.assertEqual(self.worker.run(now=1000), "failed")
        self.assert_unchanged()

    def test_disabling_while_downloading_prevents_install(self):
        def disable(stage):
            data = json.loads(self.prefs.read_text())
            data["settings"]["autoUpdates"] = False
            self.prefs.write_text(json.dumps(data))
        with patch.object(self.worker, "validate", side_effect=disable):
            self.assertEqual(self.worker.run(now=1000), "disabled")
        self.saved = self.prefs.read_bytes()
        self.assert_unchanged()

    def test_edit_while_downloading_is_preserved(self):
        with patch.object(self.worker, "validate", side_effect=lambda stage: (self.worker.plugin / "local.txt").write_text("editing")):
            self.assertEqual(self.worker.run(now=1000), "local-changes")
        self.assertEqual((self.worker.plugin / "local.txt").read_text(), "editing")
        self.assert_unchanged()

    def test_reload_failure_is_reported_without_reinstalling(self):
        with patch.object(self.worker, "reload", side_effect=OSError("shell closed")):
            self.assertEqual(self.worker.run(now=1000), "restart-pending")
        self.assertEqual(self.worker.run(now=1001), "not-due")
        self.assertEqual(json.loads((self.worker.plugin / "manifest.json").read_text())["version"], "0.11.0")

    def test_state_is_private(self):
        self.worker.release["tag_name"] = "v0.10.0"
        self.worker.run(now=1000)
        self.assertEqual(self.worker.result.stat().st_mode & 0o777, 0o600)
        self.assertEqual((self.worker.state / "updates.lock").stat().st_mode & 0o777, 0o600)


if __name__ == "__main__":
    unittest.main()
