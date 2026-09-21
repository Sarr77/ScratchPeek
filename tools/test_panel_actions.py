#!/usr/bin/env python3
"""Exercise hint switching and Ctrl-click routing without desktop input."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
shell = Path('/usr/share/omarchy/shell')
with tempfile.TemporaryDirectory(prefix='scratchpeek-panel-actions-') as directory:
    config = Path(directory)
    for name in ('Ui', 'Commons'):
        (config / name).symlink_to(shell / name, target_is_directory=True)
    (config / 'ScratchPeek').symlink_to(root, target_is_directory=True)
    shutil.copyfile(root / 'tests/panel-actions.qml', config / 'shell.qml')
    state = config / 'state' / 'scratchpeek'
    state.mkdir(parents=True)
    (state / 'updates.json').write_text(json.dumps({'lastCheck': 1000, 'nextCheck': 87400, 'status': 'current'}))
    env = dict(os.environ, XDG_STATE_HOME=str(config / 'state'), QT_QPA_PLATFORM='offscreen', QT_QUICK_BACKEND='software',
               QT_QUICK_CONTROLS_STYLE='Basic', QT_QPA_PLATFORMTHEME='')
    try:
        result = subprocess.run(['quickshell', '--no-color', '-p', str(config)],
                                env=env, text=True, capture_output=True, timeout=25)
    except subprocess.TimeoutExpired as error:
        print(error.stdout or '')
        print(error.stderr or '')
        raise SystemExit('Panel actions test timed out')
    output = result.stdout + result.stderr
    print(output)
    passed = result.returncode == 0 and 'SCRATCHPEEK_PANEL_ACTIONS_PASS' in output
    passed = passed and 'SCRATCHPEEK_PANEL_ACTIONS_FAIL' not in output
    raise SystemExit(0 if passed else 1)
