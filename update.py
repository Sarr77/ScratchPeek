#!/usr/bin/env python3
"""Install a stable ScratchPeek release into an unmodified Omarchy checkout.

Started by the widget, with no persistent service. The worker survives a shell
reload. Network requests go only to the public ScratchPeek release/repository.
"""
import ctypes
import fcntl
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import time
import urllib.request

PLUGIN_ID = "sarr.scratchpeek"
REPOSITORY = "https://github.com/Sarr77/ScratchPeek"
RELEASE_URL = "https://api.github.com/repos/Sarr77/ScratchPeek/releases/latest"
DAY = 86400


def version(value):
    if not isinstance(value, str) or not re.fullmatch(r"(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)", value):
        raise ValueError("not a stable version")
    return tuple(map(int, value.split(".")))


def atomic_json(path, value):
    fd, temporary = tempfile.mkstemp(prefix=".update-", dir=path.parent)
    try:
        with os.fdopen(fd, "w") as stream:
            json.dump(value, stream)
            stream.write("\n")
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def exchange(left, right):
    """One Linux rename exposes the complete validated tree, never half an update."""
    rename = getattr(ctypes.CDLL(None, use_errno=True), "renameat2", None)
    if rename is None:
        raise OSError("atomic directory exchange is unavailable")
    rename.argtypes = [ctypes.c_int, ctypes.c_char_p, ctypes.c_int, ctypes.c_char_p, ctypes.c_uint]
    rename.restype = ctypes.c_int
    if rename(-100, os.fsencode(left), -100, os.fsencode(right), 2):
        error = ctypes.get_errno()
        raise OSError(error, os.strerror(error))


class Updater:
    def __init__(self, home, state):
        self.home = Path(home)
        self.state = Path(state) / "scratchpeek"
        self.plugin = self.home / ".config/omarchy/plugins" / PLUGIN_ID
        self.result = self.state / "updates.json"

    def enabled(self):
        try:
            prefs = json.loads((self.state / "preferences.json").read_text())
            return prefs["version"] == 1 and prefs["settings"].get("autoUpdates", True) is True
        except (OSError, ValueError, KeyError, TypeError, AttributeError):
            return False

    def command(self, *args, timeout=60):
        environment = dict(os.environ, GIT_TERMINAL_PROMPT="0", GIT_CONFIG_NOSYSTEM="1",
                           GIT_CONFIG_GLOBAL="/dev/null")
        return subprocess.run(args, check=True, capture_output=True, text=True,
                              timeout=timeout, env=environment).stdout.strip()

    def git(self, directory, *args):
        # Updates never run repository hooks or use saved GitHub credentials.
        return self.command("git", "-c", "core.hooksPath=/dev/null", "-c", "credential.helper=",
                            "-C", str(directory), *args)

    def latest(self):
        request = urllib.request.Request(RELEASE_URL, headers={
            "Accept": "application/vnd.github+json", "User-Agent": "ScratchPeek-Updater"})
        with urllib.request.urlopen(request, timeout=20) as response:
            raw = response.read(262145)
        if len(raw) > 262144:
            raise ValueError("release response too large")
        return json.loads(raw)

    def validate(self, directory):
        self.command("omarchy", "plugin", "validate", str(directory))

    def reload(self):
        self.command("omarchy-shell", "shell", "rescanPlugins", timeout=15)

    def clean(self):
        return not self.git(self.plugin, "status", "--porcelain", "--untracked-files=all", "--ignored")

    def eligible(self):
        if self.plugin.is_symlink() or not (self.plugin / ".git").is_dir() or (self.plugin / ".git").is_symlink():
            return False
        origin = self.git(self.plugin, "remote", "get-url", "origin").rstrip("/").removesuffix(".git")
        return origin.lower() == REPOSITORY.lower() and self.clean()

    def install(self, release):
        if not isinstance(release, dict) or release.get("draft") is not False or release.get("prerelease") is not False:
            raise ValueError("release is not stable")
        tag = release.get("tag_name", "")
        if not isinstance(tag, str) or not tag.startswith("v"):
            raise ValueError("invalid release tag")
        target_version = version(tag[1:])
        current = json.loads((self.plugin / "manifest.json").read_text())
        if not isinstance(current, dict) or current.get("id") != PLUGIN_ID:
            raise ValueError("wrong installed plugin")
        if target_version <= version(current["version"]):
            return "current"
        original = self.git(self.plugin, "rev-parse", "HEAD")
        identity = self.plugin.stat().st_ino
        # Outside plugins/: staging must not be discovered as another widget.
        with tempfile.TemporaryDirectory(prefix=".scratchpeek-update-", dir=self.plugin.parent.parent) as temporary:
            stage = Path(temporary) / "plugin"
            shutil.copytree(self.plugin, stage, symlinks=True)
            self.git(stage, "fetch", "--no-tags", REPOSITORY, "refs/tags/" + tag)
            target = self.git(stage, "rev-parse", "FETCH_HEAD^{commit}")
            self.git(stage, "merge-base", "--is-ancestor", original, target)
            self.git(stage, "merge", "--ff-only", target)
            manifest = json.loads((stage / "manifest.json").read_text())
            if not isinstance(manifest, dict) or manifest.get("id") != PLUGIN_ID or manifest.get("version") != tag[1:]:
                raise ValueError("release manifest mismatch")
            self.validate(stage)
            # A user can disable updates, edit code or remove the widget while
            # a download is running. Recheck before touching the installed tree.
            if not self.enabled():
                return "disabled"
            if (not self.eligible() or self.plugin.stat().st_ino != identity
                    or self.git(self.plugin, "rev-parse", "HEAD") != original):
                return "local-changes"
            exchange(stage, self.plugin)
        return "updated"

    def run(self, now=None):
        if not self.enabled():
            return "disabled"
        self.state.mkdir(parents=True, exist_ok=True, mode=0o700)
        descriptor = os.open(self.state / "updates.lock", os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
        with os.fdopen(descriptor, "w") as lock:
            try:
                fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError:
                return "busy"
            now = int(time.time()) if now is None else now
            try:
                previous = json.loads(self.result.read_text())
                if now < previous["nextCheck"] <= now + DAY:
                    return "not-due"
            except (OSError, ValueError, KeyError, TypeError):
                pass
            result = {"lastCheck": now, "nextCheck": now + DAY, "status": "checking"}
            atomic_json(self.result, result)
            try:
                result["status"] = self.install(self.latest()) if self.eligible() else "local-changes"
            except (OSError, ValueError, KeyError, TypeError, subprocess.SubprocessError):
                result["status"] = "failed"
            atomic_json(self.result, result)
            if result["status"] == "updated":
                try:
                    self.reload()
                except (OSError, subprocess.SubprocessError):
                    result["status"] = "restart-pending"
                    atomic_json(self.result, result)
            return result["status"]


if __name__ == "__main__":
    home = Path.home()
    state = os.environ.get("XDG_STATE_HOME") or str(home / ".local/state")
    try:
        print(Updater(home, state).run())
    except (OSError, ValueError):
        # An unwritable state directory must not start an unrecorded update.
        raise SystemExit(1)
