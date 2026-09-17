#!/usr/bin/env python3
"""Exercise real atomic preference IO, cold restore, corrupt data and write errors."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

root=Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(prefix='scratchpeek-preferences-') as directory:
    config=Path(directory)
    for name in ('Ui','Commons'):
        (config/name).symlink_to(Path('/usr/share/omarchy/shell')/name,target_is_directory=True)
    (config/'ScratchPeek').symlink_to(root,target_is_directory=True)
    shutil.copyfile(root/'tests/preferences.qml',config/'shell.qml')
    state=config/'state/scratchpeek'
    file=state/'preferences.json'
    env=dict(os.environ,XDG_STATE_HOME=str(config/'state'),QT_QPA_PLATFORM='offscreen',
             QT_QUICK_BACKEND='software',QT_QUICK_CONTROLS_STYLE='Basic',QT_QPA_PLATFORMTHEME='')
    def check(scenario):
        result=subprocess.run(['quickshell','--no-color','-p',str(config)],
            env=dict(env,SCRATCHPEEK_PREFERENCES_CASE=scenario),text=True,capture_output=True,timeout=10)
        output=result.stdout+result.stderr
        assert result.returncode==0 and 'SCRATCHPEEK_PREFERENCES_PASS' in output and 'SCRATCHPEEK_PREFERENCES_FAIL' not in output,output
        print('PASS preferences:',scenario)
    check('save')
    assert state.stat().st_mode & 0o777 == 0o700
    assert json.loads(file.read_text())['settings'].get('id') is None
    check('restore')
    good=file.read_bytes()
    file.write_text('{invalid json')
    check('corrupt')
    assert file.read_text() == '{invalid json'
    file.write_bytes(good)
    state.chmod(0o500)
    try:
        check('readonly')
        assert file.read_bytes() == good
    finally:
        state.chmod(0o700)
