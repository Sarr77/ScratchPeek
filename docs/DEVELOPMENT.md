# Development

ScratchPeek is a Quickshell bar widget. Its QML uses Omarchy’s UI components and
Hyprland integration. The automatic updater is a separate Python process started
by the widget.

## Code layout

| Files | Responsibility |
| --- | --- |
| `Widget.qml`, `Details.qml` | Bar indicator, panel and editor navigation |
| `ScratchState.qml` | Shared window/monitor state and previews across monitors |
| `Model.js`, `Appearance.js` | State labels, settings and color calculations |
| `ScratchVisibility.qml`, `Visibility.js` | Show/hide requests and confirmation |
| `WindowTransfer.qml`, `Transfers.js`, `TransferEditor.qml` | Moving a selected window and choosing its destination |
| `Preferences.qml` | Reading and writing the saved settings file |
| `Updates.qml`, `update.py` | Daily schedule, release checks and installation |
| `I18n.js` | Languages and translations |
| `vendor/omarchy/` | Adapted dropdown controls with their upstream license |

Window membership, scratchpad visibility and keyboard focus are separate states.
A window can belong to a hidden scratchpad, and a visible scratchpad may not have
focus. Keep those distinctions when changing the indicator or window actions.

Settings from the panel and Omarchy go through `Widget.persistSettings`.
The interface reads saved preferences, so a failed write cannot make an unsaved
choice appear active. Omarchy’s bar entry keeps a copy. Revision checks reject
older copies at startup and during use; publishing a copy back to Omarchy does
not trigger another save.

`Preferences.hasSavedValues` distinguishes a valid saved file, including empty
settings, from a file that could not be read or created. Until a valid file is
available, widgets share a snapshot of the initial Omarchy entry. Failed edits
restore that snapshot; the updater stays blocked. A successful retry saves the
whole entry, including fields the edit did not change.

## Running checks

```sh
node tests/model.test.cjs
python3 -B tests/test_updates.py
python3 -B tests/test_package.py
omarchy plugin validate .
```

Node is needed only for tests. The Qt integration scripts also need Quickshell
and the installed Omarchy UI kit. See [Testing](TESTING.md) for the scripts,
what they check and which ones interact with the desktop.

## IPC commands

These commands work while the widget is running. Replace `DP-1` with your
monitor’s name:

```sh
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

`status` returns JSON for each monitor: window count, visibility, focus, settings,
hint count, update state and version. It does not include window titles.
`setHintsMode` accepts `on`, `off` or `auto`. Returning to `auto` uses the remaining
count; it does not reset it. `focusWindow <address>` focuses a window only while
it still belongs to the configured scratchpad.

For visibility errors, `visibilityError` is the currently displayed error.
`visibilityLastFailure` is the last failure in this shell session, including
its phase, reason and elapsed time. That diagnostic is also written to the
Quickshell log, without window titles or raw compositor output.

## Dropdowns and scaling

The dropdowns in `vendor/omarchy/` are adapted from Omarchy 4.0.4. Their changes
keep popups within the window when the panel is scaled. Qt Controls puts popups
in a separate overlay, so that overlay needs the panel’s scale too. See
[Qt’s popup sizing documentation](https://doc.qt.io/qt-6/qml-qtquick-controls-popup.html#popup-sizing).
Keep the [upstream MIT notice](../vendor/omarchy/LICENSE).

## Building a source archive

```sh
python3 -B tools/package.py
```

The output is `dist/ScratchPeek-<version>.zip`. It contains only files listed in
`tools/package-files.txt`. Update that list when adding or removing release files.
Missing files and symlinks stop the build. Local notes and caches are not included.

[Updates](UPDATES.md) describes the updater. [Publishing](PUBLISHING.md) covers
release and marketplace steps.
