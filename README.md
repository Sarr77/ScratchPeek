# ScratchPeek

**Know what is in your scratchpad — and where it is open.**

An Omarchy bar widget by **Sarr**. ScratchPeek shows the scratchpad's window
count and whether it is empty, hidden, open on this monitor, or open elsewhere.
When you are working inside it, the label says **active here**.

![Illustrated ScratchPeek preview with example windows](docs/preview.svg)

[Polski](docs/README.pl.md) · [Publishing](docs/PUBLISHING.md) · [Validation](docs/TESTING.md)

## What it does

- Always shows the state, including when the scratchpad is empty.
- Shows a separate, accurate status on every monitor.
- Counts all windows, including inactive tabs in Hyprland window groups.
- Left-click shows or hides the scratchpad on the clicked monitor.
- Hover lists applications; right-click opens a scrollable list with window titles.
- Select a window to focus it. Up/Down or Tab navigate windows, the action, and
  the language picker; Enter activates and Escape closes.
- Uses the current Omarchy theme and supports all four bar edges.
- 30 interface translations, first-start language detection, a searchable
  language picker, and compact labels. Arabic uses a right-to-left layout.
- Application icons, adjacent grouped tabs, and a diagram of your monitor layout.
- Supports the default `scratchpad` and other named special workspaces.

This is the **window scratchpad** opened with Super + S in the default Omarchy
configuration. Clipboard history for copied text and images is a separate feature.

## Requirements

- Omarchy Quattro with `omarchy-shell` and its built-in bar.
- Hyprland and Omarchy's Quickshell Hyprland integration.

No additional runtime packages, API keys, network services, or background daemons.
The old Waybar-based Omarchy bar is not supported. Lua and legacy Hyprland
dispatch syntax are selected through Quickshell's `Hyprland.usingLua` property;
the legacy path needs a Quickshell build exposing that property.

## Install

The source is backed up in [Sarr77/ScratchPeek](https://github.com/Sarr77/ScratchPeek).
The repository is currently private. After the public release, install with:

```bash
omarchy plugin add https://github.com/Sarr77/ScratchPeek --enable
```

For a local checkout, link it into your plugin directory and enable it:

```bash
mkdir -p ~/.config/omarchy/plugins
ln -s /absolute/path/to/scratchpeek ~/.config/omarchy/plugins/sarr.scratchpeek
omarchy-shell shell rescanPlugins
omarchy plugin enable sarr.scratchpeek
```

The default section is **left**, beside the workspace numbers. Use Omarchy's
bar editor or `omarchy bar move sarr.scratchpeek --section left` to reposition it.

## Reading the indicator

| Label | Meaning |
|---|---|
| `○ 0 · empty` | No windows in the scratchpad. |
| `◌ 4 · hidden` | Four windows stored, overlay hidden. |
| `● 4 · open here` | Overlay visible on this monitor; focus can be elsewhere. |
| `● 4 · active here` | A scratchpad window has keyboard focus on this monitor. |
| `↗ 4 · open on DP-3` | Overlay visible on the named other monitor. |
| `? ? · status unknown` | State is unavailable or the configured name is invalid. |

An empty scratchpad can still be open; in that case the label shows `0 · open here`.
Hidden tabs count separately, because switching tabs does not remove windows.
Visible scratchpads use your theme accent; a focused scratchpad has a stronger
background. Grouped windows share a small marker and group number in the list.
The monitor diagram preserves physical positions even in an RTL interface.

Clicking a label for an empty, hidden scratchpad opens help instead of displaying
an empty overlay. Clicking a window in the details panel follows that window;
use **Show here** to bring the scratchpad to the panel's monitor instead.

## Settings

Right-click → **Scale** changes panel/tooltip size and bar text independently.
Both controls accept **80–200%**, through a slider, ± buttons or a percentage
field; **100%** follows Omarchy's current font and display settings. The panel's
text, buttons, icons, inputs and dropdowns scale together. The panel fits the
screen and scrolls when necessary. Thin accent-colored scrollbars have their
own gutter, so they do not cover buttons or text. Bar text fits the bar's existing height;
if that limits the requested size, the editor shows the effective percentage.
Changes preview across monitors. **Apply** saves, while **Cancel**, Escape or
closing the panel restores the saved sizes. Scaling preserves colors and labels.

Right-click the indicator and choose **Appearance** to edit the highlight color.
The panel starts with the saturation/value palette, hue slider and HEX field.
These update the preview on every monitor immediately. HEX accepts `#RGB` or
`#RRGGBB` (the `#` is optional). Invalid values cannot be applied.

**Restore saved color**, below the HEX field, previews the last applied color
for the current theme and displays its HEX. It restores the saved color mode
and scope, so an automatic choice continues to follow themes. Preset edits,
tooltip style and scaling are preserved. It also recovers from invalid HEX input.
The button does not save or close the editor.

**Color presets**, below the picker, is collapsed every time the editor opens.
Expand it for three modes:

- **Adapted (default):** ScratchPeek pink `#EF98F5` for the exact `tokyo-night`
  theme ID; every other theme uses its own accent. Wallpaper and color similarity
  do not determine this exception. Unknown theme IDs use the Omarchy accent.
- **Omarchy accent:** the exact accent supplied by the current theme, including
  Tokyo Night's blue `#7AA2F7`.
- **Custom:** a HEX color chosen using the picker or a saved preset.

**Use for → Only [theme]** stores an independent choice for this theme. Themes
without a saved choice use Adapted. **All themes** applies the selected mode
across themes and temporarily overrides individual choices without deleting
them. Return to Only [theme] to reactivate them. The default scope is Only [theme].
If the theme ID is unavailable, only All themes can be selected.

The built-in **ScratchPeek pink** swatch is always available. **Save color** adds
one of up to 24 named presets. Select a swatch to preview it; **Edit preset** can
rename it, update it to the picker's current color, or delete it. Names are plain
text, unique without regard to case and limited to 40 characters. Deleting a
preset keeps the currently selected color. Presets are reusable across themes;
applying one honors the selected scope.

**Apply** saves colors, scope and preset edits together. **Cancel**, Escape or
closing the panel discards all these edits. Existing manual HEX colors remain
global during upgrades; existing explicit theme-color settings keep following
the exact Omarchy accent. Choose Adapted to opt into the new behavior.

The same editor previews two hover-tooltip styles: **Spacious** (icons, rounded
corners, more spacing) and **Compact** (shorter rows, fewer decorations).
Tooltip backgrounds follow the Omarchy theme, while their border and status
use the chosen accent. The tooltip is passive and never takes keyboard focus.
The open-panel underline spans the entire label and uses a lighter version of
the chosen accent (22% white blend), including during live preview. Tooltip
content has an extra 4 px of padding on each horizontal side.

Right-click → **Labels and text** selects the descriptions used in the bar,
details panel, hover tooltip and accessible name:

| Preset | Visible here | Focused here | Hidden |
|---|---|---|---|
| Short (default) | open here | active here | hidden |
| With Scratchpad | Scratchpad: open here | Scratchpad: active here | Scratchpad: hidden |
| Scratchpad ON / OFF | Scratchpad ON | Scratchpad ACTIVE | Scratchpad OFF |
| Custom | your text | your text | your text |

Custom has separate fields for empty, hidden, visible here, focused here,
visible elsewhere, and unknown. Blank fields fall back to **With Scratchpad**.
Use `{monitor}`, `{count}` and `{workspace}` to insert live values, for example
`My shelf: {count} @ {monitor}`. Text is limited to 100 characters per field and
rendered literally. Custom text stays as written when switching interface
languages or presets. All standard presets are translated; ON/OFF/ACTIVE/EMPTY
are intentionally conventional English labels. The symbol and count remain on
the bar; compact and vertical bars show descriptions in the panel and tooltip.
**Apply** saves across monitors; **Cancel**, Escape or dismissal discards the preview.

Right-click the indicator and use **Language** at the bottom of the panel.
Search by a language's native name or code. Changes apply on every monitor
immediately and are saved in the plugin's Omarchy entry. **Automatic** restores
system-language detection. Existing explicit choices are preserved on upgrade.

Change the existing entry in `~/.config/omarchy/shell.json`:

```json
{
  "id": "sarr.scratchpeek",
  "workspace": "scratchpad",
  "language": "auto",
  "compact": false,
  "accentColor": "",
  "colorMode": "adaptive",
  "colorScope": "theme",
  "themeColors": {},
  "colorPresets": [],
  "tooltipStyle": "panel",
  "labelStyle": "short",
  "customLabels": {},
  "uiScale": 1,
  "barScale": 1
}
```

- `workspace`: the name without `special:`; letters, digits, `.`, `_`, and `-`.
- `language`: `auto` (default) or a code from [Languages](docs/LANGUAGES.md).
  A missing setting on first start behaves exactly like `auto`.
- `compact`: a state symbol and count instead of a sentence. Vertical bars use
  two lines automatically. The tooltip always explains the full state.
- `colorMode`: `adaptive`, `theme` or `custom`; used when `colorScope` is `all`.
- `colorScope`: `theme` (default) or `all`. Theme scope uses the matching
  `themeColors` entry, falling back to Adapted for themes without an entry.
- `accentColor`: global custom HEX, used by `colorMode: custom` with scope `all`.
- `themeColors`: map from stable theme IDs to `{ "mode": "custom", "color": "#EF98F5" }`
  (or `mode: adaptive` / `theme`). Manage these in the editor.
- `colorPresets`: saved `{ "id": "preset-1", "name": "My pink", "color": "#EF98F5" }`
  swatches. The editor manages IDs and validates unique names.
- `tooltipStyle`: `panel` (spacious) or `compact`.
- `uiScale`: panel and tooltip multiplier from `0.8` to `2`, default `1`.
- `barScale`: requested bar text multiplier from `0.8` to `2`, default `1`.
  The displayed size is capped by the available bar height.
- `labelStyle`: `short` (default), `explicit`, `switch`, or `custom`.
- `customLabels`: optional `empty`, `hidden`, `here`, `active`, `elsewhere`,
  `unknown` strings. Edit these in **Labels and text**.

The plugin does not change keybindings. Help text refers to default Omarchy
bindings; users with custom bindings should use their own shortcuts.

## Remove

```bash
omarchy plugin remove sarr.scratchpeek
```

Removing the plugin leaves every window and workspace untouched. For a linked
development checkout, Omarchy removes the link and leaves your source directory.

## How it works and privacy

A shared QML singleton reads Quickshell's Hyprland IPC models. It refreshes after
workspace/window events, with a five-second reconciliation timer for missed
events. It does not spawn `hyprctl`, a shell, or any other process.

Only explicit clicks dispatch focus/toggle operations. Workspace names and
window addresses are validated before constructing Hyprland commands. Window
titles are displayed as plain text. No window is closed or moved to an ordinary
workspace by this plugin.

There is no telemetry, external network access, or storage of window titles.
The plugin watches Omarchy’s local `theme.name` file to identify theme changes.
The plugin reads application names/icons through Quickshell's desktop-entry
index. Explicit language, appearance and label changes persist through Omarchy's own settings API;
the plugin never reads or rewrites the whole shell configuration itself.
Titles appear only in the details panel; the hover tooltip lists app names.
Like other Omarchy plugins, its QML runs inside the shell and is not sandboxed.

## Development

```bash
node --test tests/model.test.cjs
omarchy plugin validate .
```

Run `python3 tools/test_editor.py` on an Omarchy machine for an offscreen test of
the real QML editor with an in-memory settings host. It never edits desktop settings.

Node is needed only for tests. If a recent Node release reports only the test
file, `node tests/model.test.cjs` prints all individual checks.
See [TESTING.md](docs/TESTING.md) for compositor and
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
```

Use your actual monitor name. `status` returns counts, visibility, and focus for
each bar monitor, selected/detected language, and version; it does not return window titles. `focusWindow <address>`
selects a window only if it still belongs to the configured scratchpad.

The two dropdown components in `vendor/omarchy/` are adapted from Omarchy
4.0.4's UI kit with explicit scaled window bounds and retain its MIT notice.
Qt Controls popup items use a separate overlay; the implementation follows
[Qt's popup scaling guidance](https://doc.qt.io/qt-6/qml-qtquick-controls-popup.html#popup-sizing).

## License

MIT. Copyright © 2026 **Sarr**.
