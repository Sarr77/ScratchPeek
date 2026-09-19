# Testing

The portable tests need Node.js, Python 3 and Git. Run them from the repository
root:

```sh
node tests/model.test.cjs
python3 -B tests/test_updates.py
python3 -B tests/test_package.py
```

On Omarchy, also run `omarchy plugin validate .`. GitHub CI runs the portable
tests and checks the manifest entry points.

## Test coverage

| Test | What it checks |
| --- | --- |
| `tests/model.test.cjs` | Window states, groups, command arguments, colors, settings revisions, hint counts and translation keys |
| `tests/test_updates.py` | Release and marketplace checks, file integrity, local changes, atomic installation and failures |
| `tests/test_package.py` | Archive contents, repeatable output, missing files, invalid paths and symlinks |
| `tools/test_preferences.py` | Panel and host settings, failed writes and retries, startup with corrupt or inaccessible preferences, restarts, stale copies and repeated host notifications |
| `tools/test_panel_actions.py` | Hover hints, Ctrl-click, rapid settings changes, update timing and disable confirmation |
| `tools/test_footer_hover.py` | Pointer exit and keyboard selection at 100% and 200% scale, manifest version and copying it |
| `tools/test_hint_budget.py` | 100 displayed hints across two widgets, with restarts at 50 and 100 |
| `tools/test_dropdown.py` | Opening, closing, search, keyboard selection and scaled placement |
| `tools/test_editor.py` | Color presets, Apply/Cancel, saved colors, theme changes and failed saves |
| `tools/test_panel_navigation.py` | Switching editors, clearing previews, Apply/Cancel and panel close/reopen |
| `tools/test_transfers.py` | Requests arriving during a move, closed windows, timeouts and destination selection |
| `tools/test_visibility.py` | Current state, duplicate clicks, changed workspaces, rejected commands and timeouts |
| `tools/test_lifecycle.py` | Install, settings through Omarchy’s CLI, update, restart, disable, removal and settings restored after reinstall |

Run a Qt integration test with, for example:

```sh
python3 -B tools/test_preferences.py
```

These tests need Quickshell and the installed Omarchy UI kit. They use temporary
settings directories. The hint-count test takes about a minute.

The lifecycle test also needs bubblewrap. It runs the actual Omarchy CLI and
PluginRegistry in a private profile without desktop sockets or network access.
Adding `--remote https://github.com/Sarr77/ScratchPeek` first checks a public
clone without authentication.

## Tests on the desktop

The `test_live_*` scripts interact with the current compositor. Run them
separately from other window automation:

| Script | What it checks |
| --- | --- |
| `tools/test_live_preferences.py` | Settings through two shell restarts |
| `tools/test_live_visibility.py` | Startup state, duplicate requests and showing/hiding |
| `tools/test_live_transfers.py` | Moving one window or grouped tab while leaving siblings in place |
| `tools/test_live_quick_add.py` | Adding the focused window |

They restore the affected layout and focus. Check panel placement, keyboard
navigation, scaling and dropdowns on both monitors as well. The repository’s
preview uses example windows and a separately rendered panel; it does not
document these live checks.

## What these tests do not cover

The tested desktop is Omarchy 4.0.4 with Hyprland 0.56.2 and Lua configuration.
Offscreen tests do not check native focus or monitor behavior. The panel
navigation test uses a regular Qt window in place of the layer-shell window.
QML lint also reports dynamic host-property warnings, so its output is not a
clean static type check.

Updater tests use local Git repositories and controlled release/catalog data.
The final public commit still needs marketplace review and an installation
check. A valid manifest alone does not prove that the plugin works correctly.

Translation tests check keys and placeholders, not language quality. Physical
monitor removal, legacy Hyprland without Lua, small screens and every bar-edge
or DPI combination are not fully covered.

An intermittent show/hide failure was reported during development. Its original
cause remains unconfirmed. Current tests cover the known failure paths, and
visibility errors include local diagnostics for further investigation.
