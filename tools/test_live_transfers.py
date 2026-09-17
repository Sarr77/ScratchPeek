#!/usr/bin/env python3
"""Live opt-in test. Creates disposable foot windows in an isolated workspace.

Never moves existing user windows. Requires the installed ScratchPeek checkout,
Hyprland's Lua dispatchers and foot. Temporary windows are closed in finally.
"""
import json
import os
import subprocess
import time


def run(*args):
    return subprocess.check_output(args, text=True, timeout=5).strip()


def query(name):
    return json.loads(run('hyprctl', '-j', name))


def dispatch(command):
    result = run('hyprctl', 'dispatch', command)
    if result != 'ok':
        raise RuntimeError(result)


def wait(predicate, message, timeout=5):
    end = time.monotonic()+timeout
    while time.monotonic()<end:
        result = predicate()
        if result:
            return result
        time.sleep(.12)
    raise AssertionError(message)


identity = f'scratchpeek-transfer-test-{os.getpid()}'
workspace = f'ScratchPeek-Test-{os.getpid()}'
initial = {w['address']: w['workspace']['name'] for w in query('clients')}
monitors = query('monitors')
screen = next(m['name'] for m in monitors if m.get('focused'))
ordinary_target = str(next(m for m in monitors if m['name']==screen)['activeWorkspace']['name'])
focus = query('activewindow').get('address')


def windows():
    return [w for w in query('clients') if w['class']==identity]


def window(address):
    return next((w for w in windows() if w['address']==address), None)


def move(action, address, destination=None):
    assert window(address), 'Refusing to move a non-test window'
    args = ['omarchy-shell', 'sarr.scratchpeek', action, screen, address]
    if destination is not None:
        args.append(destination)
    assert run(*args)=='true', f'{action} refused'
    wait(lambda: not json.loads(run('omarchy-shell','sarr.scratchpeek','status'))[0]['transferBusy'], 'Transfer did not finish')
    status=json.loads(run('omarchy-shell','sarr.scratchpeek','status'))
    assert not status[0]['transferError'], status[0]['transferError']

try:
    for label in ('A','B'):
        command=f'foot --app-id={identity} --title=ScratchPeek-Test-{label} sleep 120'
        dispatch('hl.dsp.exec_cmd('+json.dumps(command)+', {workspace = '+json.dumps('name:'+workspace+' silent')+', no_initial_focus = true})')
    wait(lambda: len(windows())==2, 'Test terminals did not open')
    a,b = sorted(windows(),key=lambda w:w['title'])
    a,b = a['address'],b['address']
    assert all(w['workspace']['name']==workspace for w in windows())
    assert all(set(w.get('grouped',[]))<={a,b} for w in windows()), 'Unexpected group membership'
    time.sleep(.4)
    move('addWindow',a)
    assert window(a)['workspace']['name']=='special:scratchpad'
    assert window(b)['workspace']['name']==workspace
    move('extractWindow',a,ordinary_target)
    assert window(a)['workspace']['name']==ordinary_target
    print('PASS add and extract to current workspace')
    move('addWindow',a)
    move('extractWindow',a,'name:'+workspace)
    assert window(a)['workspace']['name']==workspace
    print('PASS named workspace destination')
    if not window(a).get('grouped'):
        dispatch('hl.dsp.group.toggle({window = "address:'+a+'"})')
    result=run('hyprctl','eval','hl.get_window("address:'+a+'").group:add(hl.get_window("address:'+b+'"))')
    assert result == 'ok', result
    assert set(window(a)['grouped'])=={a,b}, 'Could not create isolated test group'
    time.sleep(.4)
    move('addWindow',a)
    assert window(a)['workspace']['name']=='special:scratchpad'
    assert window(b)['workspace']['name']==workspace
    print('PASS adding one grouped tab leaves its sibling on the original workspace')
    # Regroup only the two explicit test windows, without a directional/focus dependency.
    move('extractWindow',a,'name:'+workspace)
    if not window(b).get('grouped'):
        dispatch('hl.dsp.group.toggle({window = "address:'+b+'"})')
    result=run('hyprctl','eval','hl.get_window("address:'+b+'").group:add(hl.get_window("address:'+a+'"))')
    assert result == 'ok', result
    assert set(window(a)['grouped'])=={a,b}
    # Native compositor move intentionally moves this disposable group together.
    dispatch('hl.dsp.window.move({window = "address:'+a+'", workspace = "special:scratchpad", follow = false})')
    wait(lambda: all(w['workspace']['name']=='special:scratchpad' for w in windows()), 'Group did not reach scratchpad')
    time.sleep(.4)
    move('extractWindow',a,ordinary_target)
    assert window(a)['workspace']['name']==ordinary_target
    assert window(b)['workspace']['name']=='special:scratchpad'
    print('PASS extracting one grouped tab leaves its sibling in the scratchpad')
    assert all(initial.get(w['address'],w['workspace']['name'])==w['workspace']['name'] for w in query('clients'))
    assert [(m['name'],m['activeWorkspace']['name']) for m in query('monitors')]==[(m['name'],m['activeWorkspace']['name']) for m in monitors]
    print('PASS existing window membership and active workspaces unchanged')
finally:
    run('omarchy-shell','sarr.scratchpeek','closeDetails')
    for w in windows():
        dispatch('hl.dsp.window.close({window = "address:'+w['address']+'"})')
    if focus and any(w['address']==focus for w in query('clients')):
        dispatch('hl.dsp.focus({window = "address:'+focus+'"})')
