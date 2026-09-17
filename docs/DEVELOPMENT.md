# Development

```bash
node --test tests/model.test.cjs
omarchy plugin validate .
```

Run `python3 tools/test_editor.py` on an Omarchy machine for an offscreen test of
the real QML editor with an in-memory settings host. It never edits desktop settings.
`python3 tools/test_panel_actions.py` checks hover hints, Ctrl-click routing and
rapid preference changes on two widget instances, also without changing the desktop.

`python3 tools/test_footer_hover.py` checks hover exit and keyboard selection at
100% and 200% scale. `python3 tools/test_hint_budget.py` displays 100 delayed hints
across two widgets, with cold starts at 50 and 100; it takes about a minute and
uses a temporary preference file.

Node is needed only for tests. If a recent Node release reports only the test
file, `node tests/model.test.cjs` prints all individual checks.
See [TESTING.md](TESTING.md) for compositor and
visual checks. Contributions should preserve the distinction between scratchpad
membership, overlay visibility, and keyboard focus.

Optional IPC for scripts and reproducible checks:

```bash
omarchy-shell sarr.scratchpeek status
omarchy-shell sarr.scratchpeek showDetails DP-1
omarchy-shell sarr.scratchpeek closeDetails
omarchy-shell sarr.scratchpeek toggleScratchpad DP-1
omarchy-shell sarr.scratchpeek showLanguages DP-1
omarchy-shell sarr.scratchpeek showAppearance DP-1
omarchy-shell sarr.scratchpeek showScaling DP-1
omarchy-shell sarr.scratchpeek showLabels DP-1
omarchy-shell sarr.scratchpeek setLanguage auto
omarchy-shell sarr.scratchpeek setHintsMode on
```

Use your actual monitor name. `status` returns counts, visibility, and focus for
each bar monitor, selected/detected language, hint mode/remaining views, detected shortcut
and version; it does not return window titles. `setHintsMode` accepts `on`, `off`,
or `auto` (resumes the remaining automatic budget; never resets it). `focusWindow <address>`
selects a window only if it still belongs to the configured scratchpad.

The two dropdown components in `vendor/omarchy/` are adapted from Omarchy
4.0.4's UI kit with explicit scaled window bounds and retain its MIT notice.
Qt Controls popup items use a separate overlay; the implementation follows
[Qt's popup scaling guidance](https://doc.qt.io/qt-6/qml-qtquick-controls-popup.html#popup-sizing).


## Release checks

`python3 tools/test_preferences.py` checks atomic file writes, restoration in a
new process, malformed files and write failures in a temporary state directory.
`python3 tools/test_live_preferences.py` checks existing settings across two
native shell restarts without changing their values.

`python3 tools/test_lifecycle.py` uses bubblewrap, actual Omarchy commands and
the installed PluginRegistry in a private profile. It checks install, update,
restart, disable/re-enable, removal and automatic preference restoration after
reinstall. Desktop sockets and the network are unavailable inside the namespace.
`--remote https://github.com/Sarr77/ScratchPeek` also checks an unauthenticated
public clone before the isolated lifecycle test.

Offscreen tests redirect `XDG_STATE_HOME` into their temporary directory.
Tests prefixed `test_live_` interact with the current compositor and restore
the original window layout; run them only in a suitable desktop session.

`AuthorCredit.qml` displays the author as plain text, without a link or hover action.

`python3 tests/test_updates.py` tests release updates with local Git repositories
and temporary profiles, without network or desktop access. It uses the actual
Omarchy validator when available. [UPDATES.md](UPDATES.md) describes scheduling,
staging and the boundary between GitHub releases and marketplace verification.
