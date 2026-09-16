# Validation

## Automated

Run `node --test tests/model.test.cjs`. The suite covers empty/hidden/open states,
per-monitor reporting, focus, inactive tabs, duplicates, other special
workspaces, unavailable state, disabled monitors, input validation, dispatch
syntax, language selection, and tooltip limits.

Run `omarchy plugin validate .` on an Omarchy machine. This verifies the actual
manifest contract. CI's manifest check is a small portability check and does
not replace the Omarchy validator or live QML testing.

## Live compositor checks

Use a disposable window or workspace where possible. Restore the original
visibility, active monitor, and focus after testing.

- Empty: shows zero and help; no accidental app launch or empty overlay.
- Hidden with windows: count remains stable while the overlay is hidden.
- Open: only the correct monitor says `open here`.
- Focus: focusing a scratchpad window says `active here`; focusing an ordinary
  window keeps the overlay visible but removes the active label.
- Click: shows/hides on the clicked monitor, including when another monitor
  previously held focus.
- Groups: inactive tabs are counted, and group/un-group updates the list.
- Window picker: selects a hidden tab and a hidden scratchpad window; no
  unexpected close, ungroup, or move to an ordinary workspace.
- Close/move: count updates when an application exits or leaves the scratchpad.
- Panel: mouse, Up/Down, Enter, Escape, scroll, outside-click dismissal.
- Layout: top/bottom/left/right edges, long titles, many windows, small screens.
- Localization: every catalog, region/script matching, unsupported locale fallback,
  manual override, Auto, first start with no language key, and Arabic RTL.
- Language picker: native names, code search, keyboard navigation, no matches,
  saved choice on both monitors, reload persistence, failure feedback.
- Reconnect: monitor removal, shell reload, and unavailable compositor data.

Check the shell journal for plugin-specific QML errors after each live change.
No screenshots containing personal window titles belong in the repository.

## Initial validation record — 2026-09-16

Tested on Omarchy **4.0.4-1**, with its Lua Hyprland and built-in omarchy-shell
bar, on two 1920×1080 monitors.

- **15/15** model checks passed using `node tests/model.test.cjs`.
- Omarchy's manifest validation passed.
- QML loaded in the real shell without plugin-specific runtime errors.
- Confirmed a four-window scratchpad including three grouped tabs matches
  Hyprland's client inventory (groups do not reduce the count).
- Confirmed hiding, showing on either monitor, moving the overlay between
  monitors, focused versus merely open, and selecting a hidden grouped window.
- Confirmed the empty state and empty-click help using a separate workspace name.
- Confirmed Polish full labels, compact labels, and the details panel visually.
- Confirmed saved settings survive a plugin rescan after inline changes.
- A clean shell restart loaded the plugin successfully.

The static QML checker still reports dynamic-property type warnings for the
Omarchy/Quickshell host objects (`QObject` facades and Loader items). These are
not claimed as a clean static type check; the runtime paths above were exercised.
Legacy dispatch, physical monitor hot-unplug, and tiny-screen layouts have not
been exercised on real hardware. See the remaining manual checks above.

## 0.2 validation — 2026-09-16

- 23/23 model checks pass, including all 30 complete catalogs and placeholder
  parity, preference order, Chinese scripts, Portuguese regions, aliases,
  preserved settings, group labels and scaled/rotated monitor geometry.
- Omarchy manifest validation passes. Static QML lint reports host-facade
  missing-property warnings, but no syntax/import errors.
- Loaded 0.2.0 in the real Quickshell on both monitors. Verified Polish/German/
  Arabic switching through the same persistence function used by the picker.
- Inspected the native panel, application icons, monitor diagram, and open
  searchable language menu. Arabic mirrors the interface but not the diagram.
- Removed only the language override and restarted the shell to exercise
  first-start defaults: Auto correctly selected the session's English locale.
- Returning to Polish preserved the scratchpad name and compact preference.
- Polish survived a subsequent clean shell restart. Inspected Japanese rendering
  and the corrected Arabic header/application alignment.
- Integration check switched through all 30 languages on both real monitors,
  rejected an unsupported code, restored Polish, and compared the complete shell
  configuration before/after. The check waits for Omarchy's queued disk write;
  an immediate read can still contain the preceding language.

Native-speaker review of all translations, every physical monitor arrangement,
and exhaustive GUI keyboard/search testing remain release-review tasks. No
automated test is presented as evidence of native-speaker translation quality.

## 0.3 validation — 2026-09-16

- 26 model tests pass: HEX validation, HSV/RGB endpoints and round trips, theme
  fallback, settings preservation and all 30 expanded translation catalogs.
- Manifest validation passes; QML lint has no syntax/import errors (dynamic
  host-property warnings remain).
- Loaded the editor in the real Quickshell and inspected the full palette,
  hue slider, HEX field, tooltip preview, Apply/Cancel and theme-color control.
- Verified shared live preview on two monitors: a temporary color/style leaves
  saved values unchanged, and cancellation restores the saved choice.
- Confirmed the selected custom accent appears in the panel border and survives
  in the plugin's shell settings. The host underline now uses the full text extent.

Omarchy's QML imports require the Quickshell executable's registered modules;
the standalone `qmltestrunner` cannot load them in this installation. Runtime
checks above are distinct from the portable Node model tests. Before publication,
also manually exercise dragging at every panel edge, all keyboard-only paths,
tiny screens, and opening/closing the hover tooltip beside other plugins.

## 0.4 validation — 2026-09-16

- 31 model checks pass, including six-state preset semantics, empty-but-open,
  custom placeholder substitution, RTL variable isolation, plain-text handling,
  blank fallback, input limits, preserved preferences and all 30 catalogs.
- Omarchy manifest validation passes. QML lint has no syntax/import errors;
  dynamic host-facade warnings remain.
- Loaded the native Labels and text editor and inspected both the preset
  examples and all six custom input fields in the real Quickshell.
- Verified shared custom preview on both monitors, unchanged saved values
  during preview, and restoration when the panel closes without applying.
- Applied custom text through the editor's persistence method, confirmed the
  plugin entry on disk, and verified it survives a clean shell restart on both
  monitors. Restored the original Short style, automatic language and accent.
- Inspected the full-width underline in the native bar. Confirmed the lighter
  pink accent and checked that a temporary blue preview also updates the
  underline on both monitors; closing restores the original pink.
- Inspected the tooltip component with its increased horizontal inset in the
  appearance preview. Opening the details panel on the second monitor closes
  the first one correctly with the new popup owner.

Keyboard-only text editing, all four physical bar edges and native-speaker
translation review remain manual release checks; model/IPC checks above do not
claim to simulate every pointer or key gesture.


## 0.5 validation — 2026-09-16

- 35 portable tests pass, including scale validation/limits, partial appearance
  updates, preservation of unrelated preferences, scaled popup bounds at window
  edges and above/below placement. All 30 catalogs include the new controls.
- Loaded the scale editor in the real Quickshell and inspected 100%, 125%,
  150%, 160% and 200% panel layouts during the iteration. Confirmed the live
  scale preview is shared across monitors and cancellation restores saved sizes.
- Saved scale changes, confirmed their values on disk, and verified they
  survive shell restarts. Restored the original 100% sizes after checks.
- Confirmed bar text reports its effective cap at a requested 200% with the
  machine's existing bar height. No global bar/font/theme setting was changed.
- Verified the 200% language picker opens above its trigger and fits vertically
  after its lazily-created Quickshell window receives the real monitor size.
- Inspected the final accent scrollbar at 160%: it has its own gutter and does
  not overlap the buttons. The window-list scrollbar uses the same styling.
- Confirmed the live theme accent is #7AA2F7 (Tokyo Night), distinct from the
  saved custom pink #EF98F5. The theme-color button displays its source HEX.

Tiny screens, physical DPI changes, all bar edges, and every keyboard/drag
combination remain manual release checks. Scaling uses Qt Quick scene
transforms, including the Qt Controls popup overlay; local Omarchy dropdown
copies add explicit scaled bounds and preserve the upstream MIT attribution.


## 0.5.1 validation — 2026-09-16

- Inspected the Scale editor and an overflowing details panel at 160% in the
  real shell: equal content insets on both sides, with the existing scrollbar
  remaining in the outer padding. Closing the preview restores saved sizes.
- Manifest validation passes; QML lint reports no syntax errors.

## 0.6 validation — 2026-09-16

- 43 portable checks pass, including adapted/exact/custom modes, stable theme
  identity, legacy preferences, per-theme and global scope, dormant overrides,
  named preset CRUD, validation, draft isolation and all 30 expanded catalogs.
- `python3 tools/test_editor.py` loads the real editor in Quickshell offscreen.
  It exercises preset creation/rename, Apply, Cancel after deletion, rejected
  saves, a theme change while editing, restoration on return and Polish labels.
  It also asserts that the new section starts collapsed and the palette stays
  before the HEX row. The host is in memory; desktop settings are not changed.
- Inspected the native panel with the picker first and additional controls
  behind Color presets. Confirmed 0.6.0 loads on both bar monitors, reads
  `tokyo-night`, preserves the previous custom pink and shares color previews.
- Manifest validation passes. QML lint reports no syntax/import errors;
  existing dynamic host-property type warnings remain.

The theme-switch scenario is exercised through the editor's real property
bindings with a test host. It does not switch the entire desktop theme.
Native-speaker review and exhaustive keyboard/pointer checks remain part of
public-release review.

## 0.6.1 validation — 2026-09-16

- 45 portable checks pass. Saved-color restoration covers custom, exact-theme
  and adapted choices, scope restoration, preservation of other theme drafts,
  preset edits, tooltip style and scaling, and immutable saved input.
- The real offscreen QML editor test clicks Restore saved color, checks its
  saved HEX label, restores after invalid input, preserves an unsaved preset,
  and confirms the target changes after Apply. All 30 catalogs remain complete.
- Inspected the Polish button in the rendered editor; the compact layout and
  collapsed color settings remain unchanged.
