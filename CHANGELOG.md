# Changelog

## 0.8.0 — 2026-09-17

- Add a small help toggle opposite the author in the panel footer. Its own hover
  description is always available, even with other panel hints disabled.
- Enable hints for the first seven calendar days, showing a daily countdown;
  persist the start and expiry across restarts and updates. Manual choices last
  until changed by the user and apply to all monitors.
- Ctrl+click Move out moves the selected window directly to this monitor's
  active ordinary workspace. Ordinary clicks still open the destination picker.
- Shorten the transfer hint to Ctrl+click: to this workspace, and Hide's hint to
  one sentence describing temporary hiding.
- Add a compact reminder explicitly naming the scratchpad, using the detected
  global shortcut. Keep the bar preview and shortcut visible when hints are off.
- Fix rapid settings writes using the current widget settings after startup
  hydration, avoiding the host's stale layout snapshot. Translate all new copy
  into 30 languages and test real Qt clicks, persistence and countdown boundaries.

## 0.7.3 — 2026-09-17

- Label the add-window picker Add window to scratchpad… in all 30 languages.
- Explain Hide on hover: hides the scratchpad on this monitor while keeping
  its windows inside. Show here has a corresponding monitor-specific hint.
- Use compact multiline text and expose visibility hints to accessibility.

## 0.7.2 — 2026-09-17

- Remove the ellipsis from the Move out button in all 30 languages; preserve
  the full extraction tooltip and its ellipsis.
- Hovering a window's icon/name now explains that clicking focuses that
  window or tab. The extraction button keeps its separate tooltip and action.
- Clarify the bar tooltip footer: Right-click: window list and settings.
- Translate the focus hint into all 30 languages, expose it to accessibility,
  and wrap it within the panel width. Hide it while scrolling or editing.

## 0.7.1 — 2026-09-17

- Clicking an open dropdown's trigger now closes it instead of reopening it
  during the same click. Applies to all ScratchPeek searchable dropdowns.
- Replace the small extraction arrow with a bordered, labeled Move out… button
  beside each window; the destination-workspace picker remains one click away.
- Use separate window/workspace search hints instead of Search languages…,
  translated along with the new action label into all 30 languages.
- Added an offscreen Qt pointer/keyboard regression test for dropdown dismissal,
  reopening, filtering, selection and 200% scaling with the popup above its trigger.

## 0.7.0 — 2026-09-17

- Add windows to the scratchpad through a searchable application/window picker.
- Take out a window with its ↗ action and choose a numbered or named workspace;
  show monitor names and offer empty workspaces 1–10 as destinations.
- Atomically check live membership and separate only the selected grouped tab
  before moving it silently, avoiding stale IPC state and focus-based moves.
- Confirm moves through compositor state, serialize requests across monitors,
  and report failed/blocked moves. Locked groups stay in place.
- Compact transfer editor, keyboard actions, scaling and 30-language coverage.
- Transfers require Hyprland's Lua window/group API (0.56+). Legacy indicator
  support remains; unsupported transfer controls are hidden.

## 0.6.1 — 2026-09-16

- Replaced the theme-color shortcut with Restore saved color and its saved HEX.
  Restores the saved mode/scope for the current theme, including automatic
  behavior, while preserving preset edits, tooltip style and scaling.
- Updated the button label in all 30 languages.

## 0.6.0 — 2026-09-16

- Adapted color mode: ScratchPeek pink for Tokyo Night, theme accents elsewhere.
- Exact Omarchy accent and custom colors, scoped to one theme or all themes.
- Named color presets with preview, rename, recolor and deletion; Apply/Cancel
  includes preset edits. Previous manual color choices survive upgrades.
- Picker remains first; additional color settings live in a collapsed section
  below it. Keyboard focus scrolls controls into view when expanded.
- New controls translated into all 30 supported languages.
- Added an offscreen test of the real QML editor with an in-memory settings host.

## 0.5.1 — 2026-09-16

- Equal left/right content margins in scrolling panels; the scrollbar remains
  in the outer padding without reserving an additional inner gutter.

## 0.5.0 — 2026-09-16

- Independent panel/tooltip and bar text scaling from 80% to 200%, with sliders,
  editable percentages, step buttons, system-size reset and shared live preview.
- Panels scale controls, icons and typography together, fit the screen and scroll.
  Bar text respects the existing bar height and reports its effective limit.
- Appearance updates preserve unedited color, tooltip and scale preferences.
- The theme-color button displays the actual theme accent HEX.
- Scaling controls translated in all 30 interface catalogs.
- Thin accent-colored scrollbars occupy a separate gutter beside the content.
- Scaled dropdowns choose space above/below and cap their scrollable height.

## 0.4.0 — 2026-09-16

- Full-width underline now uses the selected accent with a 22% white blend,
  updates during live preview, and needs no global theme or bar source changes.
- Short, explicit Scratchpad, ON/OFF and custom state descriptions, shared by
  the bar, panel, hover tooltip and accessible name.
- Native label editor with six custom state fields, live preview, Apply/Cancel,
  safe literal placeholders, persistent settings and blank-field fallback.
- Custom strings survive preset/language changes; controls translated in all
  30 catalogs. ON/OFF/ACTIVE/EMPTY remain conventional English switch labels.
- Added 4 px horizontal tooltip padding on each side, retaining content width.

## 0.3.0 — 2026-09-16

- Full-label open-panel underline using Omarchy's extent hint.
- Appearance editor with saturation/value palette, hue slider, HEX input,
  live preview across monitors, Apply, Cancel and return to theme color.
- Preview is transient; closing the editor without Apply restores saved values.
- Scoped, passive hover tooltip with spacious/compact styles, application
  icons, left/start-aligned content and accent-colored border/status.
- Appearance controls translated in all 30 catalogs.

## 0.2.0 — 2026-09-16

- 30 complete interface catalogs, including separate Portuguese and Chinese variants.
- Auto detection on first launch using Qt UI-language preferences, region/script
  matching, and English fallback. Explicit choices survive updates and restarts.
- Searchable native-language picker with persistent settings shared by all monitors.
- RTL layout for Arabic, with monitor positions kept in their physical order.
- Theme-accent state highlighting, shorter bar text, desktop application icons,
  grouped window markers, monitor diagram, and author credit in the footer.
- Keyboard access to language selection, guarded settings updates, and new
  coverage for locales, catalog completeness, group identity and monitor geometry.

## 0.1.0 — 2026-09-16

Initial release by **Sarr**.

- Scratchpad window count, including inactive grouped tabs.
- Empty, hidden, open here, active here, and open-on-another-monitor states.
- Monitor-specific toggle, application tooltip, and keyboard-accessible window list.
- English/Polish text, compact labels, and support for named special workspaces.
- Native Quickshell/Hyprland integration with no added processes or network access.
