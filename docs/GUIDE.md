# User guide

[README](../README.md) · [Languages](LANGUAGES.md) · [Updates](UPDATES.md)

## The bar indicator

| Label | Meaning |
| --- | --- |
| `○ 0 · empty` | The scratchpad has no windows |
| `◌ 4 · hidden` | It contains four windows and is hidden |
| `● 4 · visible here` | It is visible on this monitor; keyboard focus may be elsewhere |
| `● 4 · active here` | One of its windows has keyboard focus on this monitor |
| `↗ 4 · visible on DP-3` | It is visible on the named monitor |
| `? ? · status unknown` | Its state could not be read, or its configured name is invalid |

An empty scratchpad can still be visible. Tabs in Hyprland window groups count
as separate windows, including tabs hidden behind another tab. Group members
have a shared marker and group number in the list.

Click the indicator to show or hide the scratchpad on that monitor. Clicking
an empty, hidden scratchpad opens the panel with help. Right-click opens the
window list and settings. Hovering shows a preview of the window list.

**Show here** brings the scratchpad to the panel’s monitor. Clicking a window’s
name instead takes you to that window. Hiding the scratchpad leaves its windows
inside. If the current state cannot be confirmed, the panel shows an error
instead of repeatedly trying to toggle it.

## Adding and moving windows

**Add window to scratchpad…** opens a searchable list of windows on ordinary
workspaces. Search by app, title or workspace, then select a window. Click the
button again, press Escape or click outside the list to close it.

**Ctrl + click Add window to scratchpad…** adds the focused application window
immediately. If the panel has taken focus, ScratchPeek uses the application
that was focused before the panel opened, provided it is still on a visible
ordinary workspace. If that window is unavailable, the panel shows a message.

**Move out**, beside each window, opens the workspace picker. Select a
destination and press **Move**. The list includes existing named and numbered
workspaces, plus empty workspaces 1–10. The current workspace on the panel’s
monitor is selected initially. **Ctrl + click Move out** uses that workspace
without opening the picker.

Moving a window does not switch your current workspace. To see the moved
window, open its destination workspace. Only the selected tab moves; its group
members stay where they are. Locked groups are left in place. A closed window
or a rejected move produces an error in the panel.

Moving windows requires Hyprland 0.56+ with Lua configuration. Transfer controls
are hidden when that API is unavailable.

## Hover hints

The **?** button at the bottom left switches panel hints on or off. Its own
hover description is always available.

Hints start enabled for 100 displays. Hover over **?** to see how many remain.
Passing over a control before its hint appears does not count. Staying over
one hint counts once, and the help button does not use the count. The count
is shared across monitors and saved between sessions.

After 100 displays, hints turn off. Turning them on yourself keeps them on
until you switch them off again. The bar’s window preview remains available
in either mode. With hints off, the panel’s shortcut reminder shows just the
keys, usually **Super + S**.

## Appearance

Open **Appearance** to change the highlight color. Use the color palette,
hue slider or HEX field. HEX accepts `#RGB` and `#RRGGBB`, with or without `#`.
Changes preview on every monitor. Invalid HEX values cannot be applied.

**Restore saved color** previews the last saved color for the current theme.
It also restores whether that color follows the theme. It leaves your draft
presets, tooltip style and scale alone, and does not save or close the editor.

Expand **Color presets** below the picker to choose a color mode:

| Mode | Color used |
| --- | --- |
| **Adapted** (default) | Pink `#EF98F5` for Tokyo Night; the theme’s accent for other themes |
| **Omarchy accent** | The theme’s own accent, including Tokyo Night’s blue `#7AA2F7` |
| **Custom** | The color selected in the picker or a saved preset |

The Tokyo Night choice is based on its `tokyo-night` theme ID. If the theme
cannot be identified, ScratchPeek uses Omarchy’s accent.

**Use for → Only [theme]** saves a choice for the current theme. Themes without
a saved choice use Adapted. **All themes** applies the chosen mode everywhere.
It keeps your individual theme choices, so returning to Only [theme] restores
them. If the theme cannot be identified, only All themes is available.

**Save color** stores a named preset. You can keep up to 24, with names of up
to 40 characters. Names must be unique, ignoring case. Select a preset to
preview it; **Edit preset** lets you rename it, replace its color with the
current picker color, or delete it. Deleting a preset does not change the
selected color. The built-in **ScratchPeek pink** swatch is always available.

**Tooltip style** changes the bar’s window preview: **Spacious** uses more
spacing and icons; **Compact** uses shorter rows. Both follow the current theme
and chosen highlight color.

**Apply** saves your changes. **Cancel**, Escape or closing the panel discards
them. Color presets are saved together with the other appearance settings.
When upgrading from older versions, existing manual colors and explicit theme
colors are preserved; select Adapted if you want the current default behavior.

## Scale

Open **Scale** to adjust the panel and tooltip separately from the bar text.
Both accept 80–200%, using a slider, ± buttons or a percentage field. At 100%,
they follow Omarchy’s font and display settings.

The panel scrolls when its content does not fit. Bar text is limited by the
bar’s height; the editor shows the effective percentage if it cannot fit the
requested size. Changes preview across monitors. **Apply** saves them;
**Cancel**, Escape or closing the panel restores the saved scale.

## Labels and text

This editor changes state descriptions in the bar, panel and tooltip:

| Preset | Visible here | Focused here | Hidden |
| --- | --- | --- | --- |
| Short (default) | visible here | active here | hidden |
| With Scratchpad | Scratchpad: visible here | Scratchpad: active here | Scratchpad: hidden |
| Scratchpad ON / OFF | Scratchpad ON | Scratchpad ACTIVE | Scratchpad OFF |
| Custom | your text | your text | your text |

Custom has a field for each state: empty, hidden, visible here, active here,
visible elsewhere and unknown. An empty field uses **With Scratchpad** instead.
Each field accepts up to 100 characters, displayed as plain text.

Use `{monitor}`, `{count}` and `{workspace}` to include current values, for
example `My shelf: {count} @ {monitor}`. Changing language or label preset
preserves your custom text. Standard descriptions are translated; the
ON/OFF/ACTIVE/EMPTY labels stay in English.

The symbol and window count remain on the bar. Compact and vertical bars show
the full description in the panel and tooltip. **Apply** saves your edits;
**Cancel**, Escape or closing the panel discards them.

## Language

Use **Language** in the panel to search by native language name or code.
The choice applies to every monitor and is saved immediately. **Automatic**
uses the system language reported by Qt. See [Languages](LANGUAGES.md) for the
supported languages and detection rules.

Arabic uses a right-to-left layout. The monitor diagram keeps the monitors’
physical positions.

## Custom scratchpads and compact labels

Omarchy’s bar settings expose two options outside the panel:

- `workspace`: the special workspace name, without `special:`. Use 1–80 letters,
  digits or the characters `.`, `_` and `-`. The default is `scratchpad`.
- `compact`: show only the state symbol and count on the bar. Vertical bars
  use two lines automatically.

The panel reads your existing scratchpad keybinding for its shortcut reminder.
It recognizes Omarchy’s Lua binding and the older `togglespecialworkspace`
binding. If neither is found, the reminder is hidden. ScratchPeek does not
change keybindings.

## Saved settings

Settings are saved in `~/.local/state/scratchpeek/preferences.json`, or under
`$XDG_STATE_HOME/scratchpeek` when that variable is set. The file is shared
across monitors and loaded at startup. It contains preferences and the hint
count, not window titles.

Omarchy’s bar entry keeps a copy. Changes from the panel or Omarchy’s bar settings
are saved to the preference file before taking effect. A failed write leaves the
previous choice active. Older bar copies cannot replace newer saved settings.
Existing bar settings are imported on first use.

Settings survive disabling, removal and reinstalling. Read or write errors
appear in the panel. If the preference file cannot be read or created at startup,
the widget keeps Omarchy's existing settings and leaves automatic updates blocked.
A damaged file is left intact. After fixing a read error or damaged file, restart
the shell. A failed write can be retried without a restart once writing is possible.

For normal changes, use the panel. The [README](../README.md#removal) explains
how to remove saved settings.
