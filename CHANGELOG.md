# Changelog

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
