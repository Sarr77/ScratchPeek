# Changelog

## 0.11.2

- Added the loaded version in the panel footer. Click it to copy
  the version number, or select it with the keyboard and press Enter or Space.
- The panel and status command now read the version from the same manifest.
- Fixed settings dropdowns reopening when clicked again.

## 0.11.1

- Automatic updates now require an immutable GitHub release and marketplace
  verification of its exact commit. The updater checks both again before installing.
- Added checks of downloaded file contents and permissions. Git runs with isolated
  configuration, and checkouts with hidden local changes are left alone.
- Pinned GitHub Actions to full commit SHAs.
- Settings from the panel and Omarchy are saved to disk before controls change.
  Failed writes keep the saved choice; retrying after a write failure works correctly.
  Delayed settings from another monitor cannot overwrite a newer choice.
- If preferences cannot be read or saved on startup, the widget keeps Omarchy's
  existing settings. A failed edit no longer clears that copy or selects the default scratchpad.
- Release archives now use an explicit file list, excluding local notes and caches.
- Simplified editor navigation and rewrote the documentation.

## 0.11.0 — 2026-09-17

- Added daily automatic updates for stable GitHub releases. Modified and linked
  development copies are skipped; settings are preserved during installation.
- Added a small update switch in the footer with confirmation before disabling it.
- Fixed hover highlights remaining active after the pointer left a footer control.
- Changed the author credit to plain “by Sarr”, without a link.
- Added tests of the full 100-hint count across monitors and restarts. Manually
  enabled hints remain on without a limit.
- Changed visibility labels to “visible here” and “visible on …”, preserving
  custom labels and the separate “active here” state.
- Kept “scratchpad” in the bar preview’s click description even when hints are off.
  Removed final full stops from hover hints in all 30 languages.
- Added local diagnostics for show/hide failures, without window titles or raw
  compositor responses.

## 0.10.0 — 2026-09-17

- Moved saved settings and hint counts outside the bar layout so they survive
  disabling, restarts, removal and reinstalls.
- Added settings migration, revision checks and read/write error reporting.
  Damaged settings files are left intact.
- Made the author credit a keyboard-accessible link to Sarr’s GitHub profile.
- Prepared the first public release with installation documentation, a preview
  and tests of the install/update/remove cycle.

## 0.9.0 — 2026-09-17

- Added Ctrl + click on **Add window to scratchpad…** to add the focused app.
  This also works when opening the panel has temporarily taken keyboard focus.
- Added “scratchpad” to the bar preview’s click description when hints are on.
- Show/hide actions now read the current state, including the first action after
  restart. With Lua Hyprland, they explicitly show or hide on the chosen monitor.
- Prevented overlapping visibility actions and added completion checks. Changed
  workspaces, missing monitors, duplicate requests and timeouts are handled
  without automatically repeating a toggle.
- Added tests for startup visibility, monitor changes and adding a grouped tab.

## 0.8.2 — 2026-09-17

- Clarified the remaining-hints description, with separate lines for switching
  hints off and turning them on again.

## 0.8.1 — 2026-09-17

- Replaced the seven-day hint period with a saved count of 100 displays.
  Passing over a control before its hint opens does not count. The help icon
  does not use the count, and the last allowed hint stays open until the pointer leaves.
- Added the remaining count and reminder that hints can be turned on again.
  Manually enabled hints have no limit; existing manual choices are preserved.
- Shortened the shortcut reminder to just the keys when hints are off.
- Changed the move shortcut hint to “Ctrl + click: to this workspace”.

## 0.8.0 — 2026-09-17

- Added the **?** hint switch in the footer. Its own description is always available.
- Initially enabled hints for seven days, with a saved countdown and manual override.
- Added Ctrl + click on **Move out** to use the panel monitor’s current workspace.
- Shortened the move and hide hints, and added a reminder of the detected
  scratchpad keybinding.
- Fixed rapid settings changes being overwritten by an older bar configuration.
- Added translations and tests for the new controls.

## 0.7.3 — 2026-09-17

- Renamed the add-window picker to **Add window to scratchpad…**.
- Added hover descriptions for **Hide** and **Show here**, also available to
  accessibility tools.

## 0.7.2 — 2026-09-17

- Removed the ellipsis from **Move out**, keeping it in the longer hover description.
- Added a hint explaining that clicking a window’s icon or name focuses it.
  The hint hides while scrolling or editing and is available to accessibility tools.
- Changed the bar tooltip footer to “Right-click: window list and settings”.

## 0.7.1 — 2026-09-17

- Fixed a second click on an open dropdown reopening it instead of closing it.
- Replaced the small extraction arrow with a labeled **Move out…** button.
- Added separate search hints for windows and workspaces.
- Added dropdown tests for pointer and keyboard input, dismissal, filtering and scaling.

## 0.7.0 — 2026-09-17

- Added a searchable picker for adding windows to the scratchpad.
- Added window extraction to named or numbered workspaces, including empty
  workspaces 1–10, with monitor names shown in the destination list.
- Moving a grouped tab now separates only that tab and leaves the current
  workspace selected. Locked groups stay in place.
- Added checks for stale windows, overlapping requests and failed moves.
- Added the destination editor, keyboard controls and translations in all 30 languages.
- Transfers require Hyprland 0.56+ with Lua. Older Hyprland versions keep the
  indicator, with transfer controls hidden.

## 0.6.1 — 2026-09-16

- Replaced the theme-color shortcut with **Restore saved color**, showing its HEX.
  It restores the saved color mode and scope without resetting other editor changes.
- Updated the button label in all 30 languages.

## 0.6.0 — 2026-09-16

- Added Adapted color mode: pink for Tokyo Night, theme accents elsewhere.
- Added exact theme accents and custom colors for one theme or all themes.
- Added named color presets with editing and deletion. Preset changes are saved
  with Apply and discarded with Cancel. Earlier manual colors are preserved.
- Kept the color picker first, with other color settings in a collapsed section.
- Added translations and an offscreen appearance-editor test.

## 0.5.1 — 2026-09-16

- Made the left and right margins equal in scrolling panels. The scrollbar
  uses the outer padding.

## 0.5.0 — 2026-09-16

- Added separate panel/tooltip and bar-text scaling from 80% to 200%, with
  sliders, percentage fields, ± buttons, reset and live preview.
- Panels now fit the screen and scroll. Bar text fits the existing bar height,
  with the effective size shown in the editor.
- Preserved other appearance settings when changing scale or color.
- Added the current theme HEX to the theme-color button.
- Added themed scrollbars and dropdown placement that accounts for scale.
- Translated the scaling controls into all 30 languages.

## 0.4.0 — 2026-09-16

- Added Short, With Scratchpad, ON/OFF and custom state descriptions for the
  bar, panel and tooltip.
- Added six custom text fields with placeholders, live preview, Apply/Cancel
  and fallback for empty fields. Custom text survives language and preset changes.
- Made the full-width underline follow the selected accent, using a lighter shade.
- Added horizontal padding to the tooltip and translated the new controls.

## 0.3.0 — 2026-09-16

- Added the appearance editor with a color palette, hue slider, HEX field,
  theme-color shortcut and preview across monitors.
- Added Apply/Cancel. Closing the editor discards unsaved changes.
- Added Spacious and Compact tooltip styles with app icons and theme colors.
- Added the full-width panel underline and translated appearance controls.

## 0.2.0 — 2026-09-16

- Added 30 interface languages, including separate Portuguese and Chinese variants.
- Added automatic language detection with regional matching and English fallback.
- Added a searchable language picker with saved choices shared across monitors.
- Added Arabic right-to-left layout while preserving physical monitor positions.
- Added theme colors, app icons, group markers, a monitor diagram and author credit.
- Added keyboard access to language selection and tests for languages, groups
  and monitor layouts.

## 0.1.0 — 2026-09-16

Initial release by Sarr.

- Window count, including inactive grouped tabs, and scratchpad visibility states.
- Show/hide on a chosen monitor, an app preview and a keyboard-accessible window list.
- English and Polish, compact labels and named special workspaces.
- Quickshell/Hyprland integration without network requests.
