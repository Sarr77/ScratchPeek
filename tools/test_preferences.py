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
    def check(scenario, language='pl'):
        result=subprocess.run(['quickshell','--no-color','-p',str(config)],
            env=dict(env,SCRATCHPEEK_PREFERENCES_CASE=scenario,SCRATCHPEEK_EXPECTED_LANGUAGE=language),text=True,capture_output=True,timeout=10)
        output=result.stdout+result.stderr
        assert result.returncode==0 and 'SCRATCHPEEK_PREFERENCES_PASS' in output and 'SCRATCHPEEK_PREFERENCES_FAIL' not in output,output
        print('PASS preferences:',scenario)
    check('save')
    assert state.stat().st_mode & 0o777 == 0o700
    assert json.loads(file.read_text())['settings'].get('id') is None
    check('restore')
    good=file.read_bytes()
    file.write_text(json.dumps({'version':1, 'settings':{}}))
    check('empty')
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

    shutil.copyfile(root/'tests/settings.qml', config/'shell.qml')
    initial = {'version':1, 'settings':{'autoUpdates':True, 'language':'pl', '_scratchpeekRevision':100}}
    for scenario in ('readonly-settings', 'mirror-rejected', 'mirror-error'):
        file.write_text(json.dumps(initial))
        if scenario == 'readonly-settings':
            state.chmod(0o500)
        try:
            check(scenario)
            saved = json.loads(file.read_text())['settings']
            assert saved['autoUpdates'] is False and saved['language'] == 'pl', saved
        finally:
            state.chmod(0o700)
        check('restored-settings')

    for scenario in ('host-change', 'readonly-host'):
        file.write_text(json.dumps(initial))
        if scenario == 'readonly-host':
            state.chmod(0o500)
        try:
            check(scenario)
            saved = json.loads(file.read_text())['settings']
            assert saved['autoUpdates'] is False and saved['language'] == 'de', saved
        finally:
            state.chmod(0o700)
        check('restored-settings', language='de')
        check('removed-entry', language='de')

    original_host = {'workspace':'music', 'language':'pl', 'autoUpdates':False, 'compact':True,
                     'hintsMode':'auto', 'hintsUsed':37, 'uiScale':1.25,
                     'customLabels':{'active':'Music'}, '_scratchpeekRevision':1}
    for scenario in ('startup-corrupt', 'startup-unreadable', 'startup-readonly-panel',
                     'startup-readonly-host', 'startup-readonly-same'):
        file.unlink(missing_ok=True)
        if scenario == 'startup-corrupt':
            file.write_text('{invalid json')
        elif scenario == 'startup-unreadable':
            file.write_text(json.dumps({'version':1, 'settings':original_host}))
            file.chmod(0o000)
        else:
            state.chmod(0o500)
        language = 'de' if scenario in ('startup-readonly-panel', 'startup-readonly-host') else 'pl'
        try:
            check(scenario, language=language)
        finally:
            state.chmod(0o700)
            if file.exists(): file.chmod(0o600)
        if scenario == 'startup-corrupt':
            assert file.read_text() == '{invalid json', 'Damaged preferences were overwritten'
            # Simulate repairing the file, then restarting the shell.
            file.write_text(json.dumps({'version':1, 'settings':original_host}))
        expected = dict(original_host, language=language)
        saved = json.loads(file.read_text())['settings']
        assert {k:v for k,v in saved.items() if k != '_scratchpeekRevision'} == {
            k:v for k,v in expected.items() if k != '_scratchpeekRevision'}, saved
        check('startup-restored', language=language)
