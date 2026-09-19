# ScratchPeek

ScratchPeek adds a window list to Omarchy’s scratchpad, usually opened with
**Super + S**. The bar shows how many windows are in it and which monitor it’s
open on. From the list, you can switch to a window, move it to another workspace,
or add a window to the scratchpad. Individual tabs in Hyprland window groups
are listed separately.

[Polski](docs/README.pl.md) · [Preview](preview.png) ·
[User guide](docs/GUIDE.md) · [Changelog](CHANGELOG.md)

![ScratchPeek bar indicator and window list](preview.png)

## Installation

```sh
omarchy plugin add https://github.com/Sarr77/ScratchPeek --enable
```

The widget appears on the left of the bar. You can move it with Omarchy’s bar
editor.

Requires Omarchy Quattro with the Quickshell bar. Moving windows requires
Hyprland 0.56+ with Lua configuration. Tested on Omarchy 4.0.4 and Hyprland
0.56.2; no additional runtime packages are needed.

## Using it

Click the bar indicator to show or hide the scratchpad on that monitor.
Right-click it to open the window list and settings.

| In the panel | Action |
| --- | --- |
| Click a window’s name | Switch to that window or tab |
| **Move out** | Choose a workspace to move the window to |
| **Ctrl + click Move out** | Move it to this monitor’s current workspace |
| **Add window to scratchpad…** | Choose a window to add |
| **Ctrl + click Add window…** | Add the focused application window |

Moving a tab leaves the other windows in its group where they are.
Hiding the scratchpad leaves its windows inside.

## Settings

The panel has controls for language, colors, presets, scale and labels.
Appearance changes preview as you edit them. **Apply** saves them;
**Cancel** restores the previous settings.

The **?** button switches hover hints on or off. They start enabled and hide
automatically after 100 displays. You can turn them back on at any time.
Settings and the hint count are kept through restarts, updates and reinstalls.

## Updates

Automatic updates are enabled by default and checked once a day while the
widget is running. From 0.11.1, an update must be an immutable GitHub release
whose exact commit has been verified in the Omarchy marketplace. If a download
or verification fails, the installed version stays in place.

You can disable updates using the small switch beside **?**; this asks for
confirmation. Linked development copies, forks and locally modified code are
not updated automatically. See [update details](docs/UPDATES.md).

To update manually, or to get automatic updates when upgrading from 0.10.0:

```sh
omarchy plugin update sarr.scratchpeek
```

## Removal

```sh
omarchy plugin remove sarr.scratchpeek
```

Removing the widget leaves your windows and workspaces as they are. Settings
are kept in `~/.local/state/scratchpeek/preferences.json`, or under
`$XDG_STATE_HOME/scratchpeek` if set. Delete that file after removal if you
also want to reset your preferences.

## Data and permissions

ScratchPeek reads local window and monitor state, theme information and app
icons. It uses `hyprctl` to read state and carry out window actions. Window
titles are not saved to disk. It does not change your keybindings.

Automatic updates contact GitHub and the Omarchy marketplace using Python 3
and Git. Update times and results are stored locally alongside preferences.
There is no telemetry. The plugin runs inside Omarchy’s shell with your user
permissions and does not need administrator access.

## Help and development

[Report a bug](https://github.com/Sarr77/ScratchPeek/issues) ·
[Development](docs/DEVELOPMENT.md) · [Tests and limitations](docs/TESTING.md)

MIT · © 2026 [Sarr](https://github.com/Sarr77).
Adapted Omarchy controls retain [their MIT notice](vendor/omarchy/LICENSE).
