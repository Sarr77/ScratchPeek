#!/usr/bin/env python3
"""Opt-in visibility checks. Never moves/closes user windows; restores overlays."""
import json
from pathlib import Path
import subprocess
import time


def run(*args):
    return subprocess.check_output(args, text=True, stderr=subprocess.PIPE, timeout=10).strip()


def query(name):
    return json.loads(run('hyprctl', '-j', name))


def ipc(*args):
    return run('omarchy-shell', 'sarr.scratchpeek', *args)


def set_overlay(screen, name):
    args = '{workspace=' + json.dumps(name) + '}' if name else '{}'
    code = 'local m=hl.get_monitor(' + json.dumps(screen) + '); if m then m:set_special_workspace(' + args + ') end'
    assert run('hyprctl', 'eval', code) == 'ok'


def shown(screen):
    return next(m for m in query('monitors') if m['name'] == screen)['specialWorkspace']['name'] == 'special:scratchpad'


def check_toggle(screen, expected, label, duplicate=False):
    before = shown(screen)
    ipc('toggleScratchpad', screen)
    if duplicate:
        ipc('toggleScratchpad', screen)
    observations = [before]
    for _ in range(30):
        value = shown(screen)
        if value != observations[-1]:
            observations.append(value)
        time.sleep(.02)
    assert observations[-1] == expected, f'{label}: wrong final state {observations}'
    assert len(observations) == 2, f'{label}: extra/missing transition {observations}'
    status = next(w for w in json.loads(ipc('status')) if w['screen'] == screen)
    assert not status['visibilityBusy'] and not status['visibilityError'], status.get('visibilityError')
    print('PASS', label, observations)


monitors = query('monitors')
clients = {w['address']: w['workspace']['name'] for w in query('clients')}
assert 'special:scratchpad' in clients.values(), 'Needs an occupied scratchpad'
focus = query('activewindow').get('address')
initial_panels = [w['screen'] for w in json.loads(ipc('status')) if w['opened']]
screen = next((m['name'] for m in monitors if m['specialWorkspace']['name'] == 'special:scratchpad'), monitors[0]['name'])
try:
    ipc('closeDetails')
    set_overlay(screen, 'special:scratchpad')
    run('omarchy', 'restart', 'shell')
    deadline = time.monotonic() + 12
    while True:
        try:
            state = json.loads(ipc('status'))
            if any(w['screen'] == screen for w in state):
                break
        except (subprocess.SubprocessError, json.JSONDecodeError):
            pass
        assert time.monotonic() < deadline, 'Plugin state did not initialize after restart'
        time.sleep(.15)
    check_toggle(screen, False, 'first action after restart hides an open scratchpad')
    check_toggle(screen, True, 'second action shows it again')
    check_toggle(screen, False, 'duplicate invocation hides only once', duplicate=True)
    check_toggle(screen, True, 'duplicate invocation shows only once', duplicate=True)
    ipc('showDetails', screen)
    time.sleep(.3)
    check_toggle(screen, False, 'hiding while the keyboard panel is open')
    ipc('showDetails', screen)
    time.sleep(.3)
    check_toggle(screen, True, 'showing while the keyboard panel is open')
    other = next((m['name'] for m in monitors if m['name'] != screen), None)
    if other:
        assert run('hyprctl', 'dispatch', 'hl.dsp.focus({monitor=' + json.dumps(other) + '})') == 'ok'
        check_toggle(screen, False, 'hide on a different monitor from keyboard focus')
        check_toggle(screen, True, 'show on the requested monitor')
        check_toggle(other, True, 'bring an open scratchpad to the other monitor')
        assert not shown(screen), 'Scratchpad remained on both monitors'
        check_toggle(other, False, 'hide after changing monitors')
    assert all(clients.get(w['address'], w['workspace']['name']) == w['workspace']['name'] for w in query('clients'))
    assert {m['name']:m['activeWorkspace']['name'] for m in query('monitors')} == {m['name']:m['activeWorkspace']['name'] for m in monitors}
    print('PASS existing window membership and ordinary workspaces unchanged')

    # Execute production-generated commands in Hyprland's actual Lua runtime,
    # substituting only local monitor objects. This cannot touch user windows.
    source = str(Path(__file__).resolve().parents[1] / 'Visibility.js')
    generator = "const vm=require('vm'),fs=require('fs');const c=vm.createContext({});vm.runInContext(fs.readFileSync(process.argv[1],'utf8'),c);const p=c.plan([{name:'DP-3',activeWorkspace:{name:'2'},specialWorkspace:{name:'special:scratchpad'}}],'scratchpad','DP-3');console.log(JSON.stringify([c.command(p),c.command({...p,show:true,previous:''})]));"
    hide, show = json.loads(run('node', '-e', generator, source))
    script = '''
local calls=0
local monitor={active_workspace={name="2"},active_special_workspace={name="special:scratchpad"}}
function monitor:set_special_workspace(args) calls=calls+1; self.active_special_workspace=args.workspace and {name=args.workspace} or nil end
local hl={get_monitor=function(name) assert(name=="DP-3"); return monitor end}
local hide=function() %s end
local show=function() %s end
hide(); hide(); assert(calls==1 and monitor.active_special_workspace==nil,"duplicate hide")
show(); show(); assert(calls==2 and monitor.active_special_workspace.name=="special:scratchpad","duplicate show")
monitor.active_special_workspace={name="special:other"}; hide(); show(); assert(calls==2,"unrelated overlay changed")
monitor.active_special_workspace={name="special:scratchpad"}; monitor.active_workspace.name="3"; hide(); assert(calls==2,"workspace changed")
monitor.active_special_workspace=nil; show(); assert(calls==2,"show after workspace changed")
monitor=nil; hide(); show(); assert(calls==2,"monitor unplugged")
''' % (hide, show)
    assert run('hyprctl', 'eval', script) == 'ok'
    print('PASS native Lua: duplicate setters, other overlay, changed workspace, removed monitor')
finally:
    ipc('closeDetails')
    for m in monitors:
        set_overlay(m['name'], '')
    for m in monitors:
        if m['specialWorkspace']['name']:
            set_overlay(m['name'], m['specialWorkspace']['name'])
    original_monitor = next(m['name'] for m in monitors if m['focused'])
    run('hyprctl', 'dispatch', 'hl.dsp.focus({monitor=' + json.dumps(original_monitor) + '})')
    if focus and any(w['address'] == focus for w in query('clients')):
        run('hyprctl', 'dispatch', 'hl.dsp.focus({window="address:' + focus + '"})')
    for panel in initial_panels:
        ipc('showDetails', panel)
