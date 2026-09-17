# ScratchPeek

**Know what’s in your scratchpad — and where it’s open.**

A small Omarchy bar widget by [Sarr](https://github.com/Sarr77).

![ScratchPeek: scratchpad status, window list and move controls. Illustrated with example windows.](preview.png)

[Polski](docs/README.pl.md) · [User guide](docs/GUIDE.md) · [Changelog](CHANGELOG.md)

ScratchPeek keeps your scratchpad easy to find. See its windows, bring it to
this monitor, or move a single window in or out — even when it belongs to a tab group.

- **Know the state.** Empty, hidden, visible here, active here, or visible on another monitor.
- **Find your window.** Preview apps on hover; open the panel for the full list.
- **Make it yours.** Theme colors, a color picker, presets, readable scaling and your own labels.
- **Feel at home.** 30 languages, automatic language detection and optional hints.

This is the **window scratchpad** normally opened with **Super + S**, not clipboard history.

## Install

```sh
omarchy plugin add https://github.com/Sarr77/ScratchPeek --enable
```

The widget appears on the left of the bar. Move it with Omarchy’s bar editor.
Built for **Omarchy Quattro** with its native Quickshell bar. Tested on Omarchy
4.0.4 and Hyprland 0.56.2. Window transfers require Hyprland 0.56+ with Lua
configuration. No extra runtime packages are needed.

## A few useful gestures

| Action | What happens |
| --- | --- |
| Click the bar indicator | Show or hide the scratchpad on this monitor |
| Right-click the indicator | Open the window list and settings |
| Click a window’s name | Focus that window or tab |
| **Move out** | Choose its destination workspace |
| **Ctrl + click Move out** | Move it to this monitor’s current workspace |
| **Add window to scratchpad…** | Pick a window to add |
| **Ctrl + click Add window…** | Add the focused application window immediately |

Only the selected window moves. Hiding the scratchpad keeps its windows inside.
Keyboard navigation, named workspaces and monitor behavior are covered in the
[user guide](docs/GUIDE.md).

## Make it comfortable

Right-click → **Appearance**, **Scale**, **Labels and text**, or the language picker.
Changes preview live; **Apply** saves and **Cancel** restores your saved choice.

The small **?** switches panel hints on or off. They start enabled for the first
100 displayed hints, with a remaining count. You can always turn them on again.

Your preferences and hint progress are saved automatically. They survive
restarts, updates, disabling the widget and reinstalling it.

## Updates

Automatic updates are on by default. While ScratchPeek is running, it checks
once a day for a newer stable GitHub release and installs it in the background.
The small **Automatic updates** switch sits beside **?** in the footer.
Turning it off asks for confirmation; turning it back on takes one click.
Your preferences stay saved. Downloads or validation failures leave the installed
version in place; another check happens the next day.

This works with the normal `omarchy plugin add` installation. Linked development
copies, forks and locally modified checkouts are skipped. Users of 0.10.0 need
one manual update to get this feature in 0.11.0:

```sh
omarchy plugin update sarr.scratchpeek
```

See [how updates work](docs/UPDATES.md) for the release and marketplace details.

## Remove

```sh
omarchy plugin remove sarr.scratchpeek
```

Your windows and workspaces stay where they are. Preferences are kept for a
future reinstall in `~/.local/state/scratchpeek/preferences.json`, or under
`$XDG_STATE_HOME/scratchpeek` when that variable is set. Delete that file after
removing the plugin if you also want to forget its preferences.

## What it accesses

ScratchPeek reads local window metadata, monitor state, theme information and
application icons. Window titles stay in memory and appear as plain text.
User actions can focus windows, show/hide the scratchpad or move a chosen window.

It runs short-lived `hyprctl` commands for current state and explicit actions,
and `mkdir` to prepare its preference directory. Settings use an atomic local
file and Omarchy’s scoped widget settings API. It does not rewrite unrelated
settings or change keybindings.

Automatic updates contact GitHub's public API and this plugin's repository,
using Python 3 and Git already included in Omarchy. Update timing and results
are saved locally alongside preferences. Turning updates off stops future checks.
No telemetry, additional daemon or elevated privileges.
Like other Omarchy plugins, ScratchPeek runs inside the shell with your user permissions.

## Help and development

[Report a bug](https://github.com/Sarr77/ScratchPeek/issues) ·
[Development and tests](docs/DEVELOPMENT.md) · [Validation notes](docs/TESTING.md)

MIT · © 2026 [Sarr](https://github.com/Sarr77). Adapted Omarchy controls retain
[their MIT notice](vendor/omarchy/LICENSE).
