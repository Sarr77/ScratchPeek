#!/usr/bin/env python3
"""Opt-in live focus test using only disposable, isolated foot windows."""
import json
import os
import subprocess
import time


def run(*args):
    return subprocess.check_output(args, text=True, timeout=8).strip()


def query(name):
    return json.loads(run('hyprctl', '-j', name))


def dispatch(command):
    assert run('hyprctl', 'dispatch', command) == 'ok'


def ipc(*args):
    return run('omarchy-shell', 'sarr.scratchpeek', *args)


def wait(predicate, message):
    end = time.monotonic() + 5
    while time.monotonic() < end:
        value = predicate()
        if value:
            return value
        time.sleep(.1)
    raise AssertionError(message)


identity = f'scratchpeek-quick-add-{os.getpid()}'
workspace = f'ScratchPeek-Quick-Add-{os.getpid()}'
initial_windows = {w['address']: w['workspace']['name'] for w in query('clients')}
initial_monitors = query('monitors')
initial_focus = query('activewindow').get('address')
initial_panels = [w['screen'] for w in json.loads(ipc('status')) if w['opened']]
screen = next(m['name'] for m in initial_monitors if m['focused'])


def windows():
    return [w for w in query('clients') if w['class'] == identity]


def window(address):
    return next((w for w in windows() if w['address'] == address), None)


try:
    ipc('closeDetails')
    for label in ('A', 'B'):
        command = f'foot --app-id={identity} --title=ScratchPeek-Quick-Add-{label} sleep 120'
        dispatch('hl.dsp.exec_cmd(' + json.dumps(command) + ', {workspace = '
                 + json.dumps('name:' + workspace + ' silent') + ', no_initial_focus = true})')
    wait(lambda: len(windows()) == 2, 'Test windows did not open')
    a, b = [w['address'] for w in sorted(windows(), key=lambda w: w['title'])]
    if not window(a).get('grouped'):
        dispatch('hl.dsp.group.toggle({window = "address:' + a + '"})')
    assert run('hyprctl', 'eval', 'hl.get_window("address:' + a + '").group:add(hl.get_window("address:' + b + '"))') == 'ok'
    assert set(window(a)['grouped']) == {a, b}, 'Unexpected group membership'
    dispatch('hl.dsp.focus({window = "address:' + a + '"})')
    wait(lambda: query('activewindow').get('address') == a, 'Test window did not gain focus')
    time.sleep(.3)
    ipc('showDetails', screen)
    time.sleep(.4)
    # Abort if the user focused any other application during the test.
    assert query('activewindow').get('address') in (None, '', a), 'Focus changed outside the test'
    assert ipc('addFocusedWindow', screen) == 'true', 'Focused-window add was refused'
    wait(lambda: window(a)['workspace']['name'] == 'special:scratchpad', 'Focused window did not move')
    wait(lambda: not json.loads(ipc('status'))[0]['transferBusy'], 'Move not acknowledged')
    assert window(b)['workspace']['name'] == workspace, 'Sibling tab moved unexpectedly'
    assert all(initial_windows.get(w['address'], w['workspace']['name']) == w['workspace']['name'] for w in query('clients'))
    print('PASS focus survives opening the keyboard panel; only the focused grouped tab moves')
finally:
    ipc('closeDetails')
    for w in windows():
        dispatch('hl.dsp.window.close({window = "address:' + w['address'] + '"})')
    for original in initial_monitors:
        current = next((m for m in query('monitors') if m['name'] == original['name']), None)
        if not current:
            continue
        if current['activeWorkspace']['name'] != original['activeWorkspace']['name']:
            dispatch('hl.dsp.focus({workspace = ' + json.dumps('name:' + original['activeWorkspace']['name']) + '})')
        special = original['specialWorkspace']['name']
        expr = 'local m=hl.get_monitor(' + json.dumps(original['name']) + '); if m then m:set_special_workspace('
        expr += '{workspace=' + json.dumps(special) + '}' if special else '{}'
        assert run('hyprctl', 'eval', expr + ') end') == 'ok'
    focused_monitor = next(m['name'] for m in initial_monitors if m['focused'])
    dispatch('hl.dsp.focus({monitor = ' + json.dumps(focused_monitor) + '})')
    if initial_focus and any(w['address'] == initial_focus for w in query('clients')):
        dispatch('hl.dsp.focus({window = "address:' + initial_focus + '"})')
    for panel in initial_panels:
        ipc('showDetails', panel)
