#!/usr/bin/env python3
"""Test visibility transaction races with a deterministic compositor transport."""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(prefix='scratchpeek-visibility-') as directory:
    config = Path(directory)
    for name in ('Ui', 'Commons'):
        (config / name).symlink_to(Path('/usr/share/omarchy/shell') / name, target_is_directory=True)
    (config / 'ScratchPeek').symlink_to(root, target_is_directory=True)
    shutil.copyfile(root / 'tests/visibility.qml', config / 'shell.qml')
    env = dict(os.environ, XDG_STATE_HOME=str(config / 'state'), QT_QPA_PLATFORM='offscreen', QT_QUICK_BACKEND='software',
               QT_QUICK_CONTROLS_STYLE='Basic', QT_QPA_PLATFORMTHEME='')
    result = subprocess.run(['quickshell', '--no-color', '-p', str(config)],
                            env=env, text=True, capture_output=True, timeout=15)
    output = result.stdout + result.stderr
    print(output)
    raise SystemExit(0 if result.returncode == 0 and 'SCRATCHPEEK_VISIBILITY_PASS' in output
                     and 'SCRATCHPEEK_VISIBILITY_FAIL' not in output else 1)
