#!/usr/bin/env python3
"""Check native preference migration and a second cold start without changing values."""
import json
import os
from pathlib import Path
import subprocess
import time

def run(*args):
    return subprocess.check_output(args,text=True,stderr=subprocess.PIPE,timeout=15).strip()

def status():
    return json.loads(run('omarchy-shell','sarr.scratchpeek','status'))

def restart():
    run('omarchy','restart','shell')
    deadline=time.monotonic()+15
    while time.monotonic()<deadline:
        try:
            result=status()
            if result and all(w.get('preferencesReady') for w in result): return result
        except (subprocess.SubprocessError,json.JSONDecodeError): pass
        time.sleep(.15)
    raise AssertionError('Preferences did not initialize')

def choices(items):
    keys=('languageSetting','hints','savedAppearance','savedLabels','workspace')
    return {w['screen']:{k:w[k] for k in keys} for w in items}

before=status()
after=restart()
assert choices(after)==choices(before),'Startup changed existing preferences'
assert not any(w['preferencesSaveFailed'] for w in after)
state=Path(os.environ.get('XDG_STATE_HOME') or Path.home()/'.local/state')/'scratchpeek/preferences.json'
saved=json.loads(state.read_text())
assert saved['version']==1 and saved['settings']['hintsUsed']==after[0]['hints']['used']
assert saved['settings']['language']==after[0]['languageSetting']
again=restart()
assert choices(again)==choices(before),'Second cold start changed preferences'
assert not any(w['preferencesSaveFailed'] for w in again)
for w in before:
    if w['opened']: run('omarchy-shell','sarr.scratchpeek','showDetails',w['screen'])
print('PASS native migration, shared durable state and two cold starts preserve all existing choices')
