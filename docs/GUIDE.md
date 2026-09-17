# Using ScratchPeek

[Back to the overview](../README.md)

## Reading the indicator

| Label | Meaning |
|---|---|
| `○ 0 · empty` | No windows in the scratchpad. |
| `◌ 4 · hidden` | Four windows stored, overlay hidden. |
| `● 4 · visible here` | Overlay visible on this monitor; focus can be elsewhere. |
| `● 4 · active here` | A scratchpad window has keyboard focus on this monitor. |
| `↗ 4 · visible on DP-3` | Overlay visible on the named other monitor. |
| `? ? · status unknown` | State is unavailable or the configured name is invalid. |

An empty scratchpad can still be open; in that case the label shows `0 · visible here`.
Hidden tabs count separately, because switching tabs does not remove windows.
Visible scratchpads use your theme accent; a focused scratchpad has a stronger
background. Grouped windows share a small marker and group number in the list.
The monitor diagram preserves physical positions even in an RTL interface.

Clicking a label for an empty, hidden scratchpad opens help instead of displaying
an empty overlay. Clicking a window in the details panel follows that window;
use **Show here** to bring the scratchpad to the panel's monitor instead.

Each visibility action reads the current compositor state before releasing the
panel's keyboard focus. On Lua Hyprland it explicitly shows or hides on the
named monitor, without a separate monitor-focus toggle. Repeating that operation
cannot reverse it. Requests are serialized across monitors until the compositor
confirms the result and a brief transition guard ends. A changed workspace,
missing monitor or failed reply stops the action and shows an error; there is
no automatic toggle retry. Legacy Hyprland uses a fresh read after focusing the
monitor but cannot provide the same atomic workspace guard.

## Moving windows

Right-click ScratchPeek to open the window list:

- **Add window to scratchpad…** searches windows on ordinary workspaces by application,
  title or workspace. Select one to send it to the configured scratchpad.
  Click **Add window to scratchpad…** again, press Escape or click outside to close the list.
- **Ctrl + click Add window to scratchpad…** adds the focused application window
  immediately. If opening the panel took keyboard focus, it uses the application
  that was focused just before opening, provided it is still on a visible ordinary
  workspace. An unavailable window produces a message instead of selecting another.
- **↗ Move out**, beside a scratchpad window, opens **Take out of scratchpad…**. Select
  a destination and press **Move**. The picker offers existing numbered and
  named workspaces, plus empty workspaces **1–10**. Existing destinations show
  their monitor; the ordinary workspace on the panel’s monitor is selected first.
- **Ctrl + click Move out** sends the selected window straight to the currently
  active ordinary workspace on the panel’s monitor, without opening the picker.
- Moves are silent: you stay on the current workspace. To see an extracted
  window, open its destination workspace. The panel’s **Show here / Hide**
  action continues to control the whole scratchpad overlay. Its hover hint
  explains the action; hiding keeps the windows inside the scratchpad.

Hovering a window’s icon or name explains that clicking focuses that window or
tab. The separate **Move out** button opens the destination picker.

The small **?** at the bottom left switches panel hover hints on or off; its own
description always stays available. Automatic hints turn off after the first
**100 displayed hints**, with the remaining count shown on **?**. A quick pass
before the tooltip delay consumes nothing, and staying over one hint counts once.
The 100th hint stays readable until you move away. The help icon itself never
uses the budget. Counts are shared across monitors and survive restarts/updates.
Manually enabled hints stay on without a limit until you turn them off yourself.
You can always turn them on again, including after the automatic budget runs out.
The bar's window preview remains available; the panel shortcut reminder shows
only the key combination while hints are off. The bar preview always says
**Click: show / hide scratchpad here**, regardless of the hint setting.

Only the selected window moves. Hyprland checks its current workspace and group
inside one Lua operation, separates that tab if necessary, then moves it by
address. A locked group is left alone. The app waits for compositor confirmation
and reports an unavailable/blocked window instead of moving the whole group.
No applications are closed, no keybindings are changed, and other special
workspaces are excluded from the add picker. All controls support the 30 UI languages.

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
| Short (default) | visible here | active here | hidden |
| With Scratchpad | Scratchpad: visible here | Scratchpad: active here | Scratchpad: hidden |
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
- `language`: `auto` (default) or a code from [Languages](LANGUAGES.md).
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

The plugin does not change keybindings. The panel reads the active global binding
for the shortcut reminder (normally **Super + S · show / hide scratchpad**).
It recognizes Omarchy's **Toggle scratchpad** Lua binding and legacy
`togglespecialworkspace` bindings; unrecognized or unbound shortcuts are hidden.


## Saved preferences

ScratchPeek keeps an atomic settings file in
`$XDG_STATE_HOME/scratchpeek/preferences.json`, defaulting to
`~/.local/state/scratchpeek/preferences.json`. It is shared across monitors and
loaded automatically. Existing inline preferences migrate on first start.
The file survives disable/removal so enabling or reinstalling restores it.
It contains preferences only, never window titles. Read/write failures appear
in the panel; a malformed existing file is left intact.

The bar entry mirrors this file. A revision marker prevents an older, unfinished
host write from replacing newer saved preferences after a restart. Use the panel
for normal configuration.
