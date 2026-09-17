#!/usr/bin/env python3
"""Display 100 real delayed hints across two widgets, with cold starts at 50/100."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(prefix='scratchpeek-hint-budget-') as directory:
    config = Path(directory)
    for name in ('Ui', 'Commons'):
        (config / name).symlink_to(Path('/usr/share/omarchy/shell') / name, target_is_directory=True)
    (config / 'ScratchPeek').symlink_to(root, target_is_directory=True)
    shutil.copyfile(root / 'tests/hint-budget.qml', config / 'shell.qml')
    env = dict(os.environ, XDG_STATE_HOME=str(config / 'state'), QT_QPA_PLATFORM='offscreen',
               QT_QUICK_BACKEND='software', QT_QUICK_CONTROLS_STYLE='Basic', QT_QPA_PLATFORMTHEME='')
    for scenario, expected in [('first',50), ('second',100), ('exhausted',100)]:
        result = subprocess.run(['quickshell', '--no-color', '-p', str(config)],
            env=dict(env,SCRATCHPEEK_HINT_CASE=scenario),text=True,capture_output=True,timeout=50)
        output = result.stdout + result.stderr
        assert result.returncode == 0 and 'SCRATCHPEEK_HINT_BUDGET_PASS' in output and 'SCRATCHPEEK_HINT_BUDGET_FAIL' not in output, output
        stored = json.loads((config/'state/scratchpeek/preferences.json').read_text())['settings']
        assert stored['hintsUsed'] == expected
        assert stored['hintsMode'] == ('off' if scenario == 'exhausted' else 'auto')
        print('PASS',scenario,': persisted',expected,'/ 100',flush=True)
