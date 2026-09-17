#!/usr/bin/env python3
"""Exercise real Qt pointer events in the dropdown, without desktop input."""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
shell = Path('/usr/share/omarchy/shell')
with tempfile.TemporaryDirectory(prefix='scratchpeek-dropdown-') as directory:
    config = Path(directory)
    for name in ('Ui', 'Commons'):
        (config / name).symlink_to(shell / name, target_is_directory=True)
    (config / 'ScratchPeek').symlink_to(root, target_is_directory=True)
    shutil.copyfile(root / 'tests/dropdown.qml', config / 'shell.qml')
    env = dict(os.environ, QT_QPA_PLATFORM='offscreen', QT_QUICK_BACKEND='software',
               QT_QUICK_CONTROLS_STYLE='Basic', QT_QPA_PLATFORMTHEME='')
    try:
        result = subprocess.run(['quickshell', '--no-color', '-p', str(config)],
                                env=env, text=True, capture_output=True, timeout=25)
    except subprocess.TimeoutExpired as error:
        print(error.stdout or '')
        print(error.stderr or '')
        raise SystemExit('Dropdown test timed out')
    output = result.stdout + result.stderr
    print(output)
    passed = result.returncode == 0 and 'SCRATCHPEEK_DROPDOWN_PASS' in output
    passed = passed and 'SCRATCHPEEK_DROPDOWN_FAIL' not in output
    raise SystemExit(0 if passed else 1)
