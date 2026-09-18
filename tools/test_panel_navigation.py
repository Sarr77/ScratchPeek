#!/usr/bin/env python3
"""Exercise real panel/editor transitions with an offscreen panel window."""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
shell = Path('/usr/share/omarchy/shell')
with tempfile.TemporaryDirectory(prefix='scratchpeek-panel-navigation-') as directory:
    config = Path(directory)
    (config / 'Ui').mkdir()
    for source in (shell / 'Ui').iterdir():
        if source.name != 'KeyboardPanel.qml':
            (config / 'Ui' / source.name).symlink_to(source, target_is_directory=source.is_dir())
    shutil.copyfile(root / 'tests/panel-window.qml', config / 'Ui/KeyboardPanel.qml')
    (config / 'Commons').symlink_to(shell / 'Commons', target_is_directory=True)
    (config / 'ScratchPeek').symlink_to(root, target_is_directory=True)
    shutil.copyfile(root / 'tests/panel-navigation.qml', config / 'shell.qml')
    env = dict(os.environ, XDG_STATE_HOME=str(config / 'state'), QT_QPA_PLATFORM='offscreen',
               QT_QUICK_BACKEND='software', QT_QUICK_CONTROLS_STYLE='Basic', QT_QPA_PLATFORMTHEME='')
    result = subprocess.run(['quickshell', '--no-color', '-p', str(config)],
                            env=env, text=True, capture_output=True, timeout=15)
    output = result.stdout + result.stderr
    print(output)
    passed = result.returncode == 0 and 'SCRATCHPEEK_PANEL_NAVIGATION_PASS' in output
    passed = passed and 'SCRATCHPEEK_PANEL_NAVIGATION_FAIL' not in output
    raise SystemExit(0 if passed else 1)
