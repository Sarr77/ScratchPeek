# Validation

## Unreleased validation — 2026-09-17

- Nineteen updater tests use temporary profiles and real local Git repositories.
  Stable releases install through an atomic directory exchange; downloads,
  validation failures, wrong release versions, divergent commits, concurrent
  workers and changes made during a download leave the old installation intact.
  The daily schedule survives a new worker, and settings remain byte-for-byte
  unchanged. Native runs use Omarchy's actual manifest validator.
- The update switch synchronizes across both widgets. The isolated lifecycle
  test preserves a disabled update preference through restart, disable/re-enable,
  removal and reinstall. The native panel shows the switch and plain “by Sarr”
  credit. The development symlink is skipped without a network request.
- The real QML scheduler with a test launcher coalesces monitor requests,
  respects the next daily deadline, defers while a panel or transfer is active,
  and responds immediately to the saved update switch.
- Release downloads are simulated with local repositories in the automated
  tests. No new public release or live replacement of the development checkout
  was performed during these checks.
- The footer test reproduces the sticky highlight with the previous enter-only
  handlers and passes with shared pointer/keyboard selection. Actual Qt events
  cover help hover, leaving into the same footer row, keyboard activation,
  delayed leave events and 100%/200% scaling. The author credit stays plain
  text under the pointer and is skipped by keyboard navigation.
- A full 100-display test alternates between two real widget instances using
  the normal tooltip delay. Fresh processes resume at 50 and 100 from the
  private preference file. The 101st automatic hint cannot open; help remains
  available. Explicit manual re-enabling works without resetting the counter.
- Existing panel-action checks, 61 model/localization tests and Omarchy
  manifest validation pass. QML lint retains host-facade type warnings.
- The corrected panel loads in the native two-monitor shell without new
  ScratchPeek runtime errors. Native pointer routing is not simulated by the
  offscreen Qt tests above.

## 0.10.0 validation — 2026-09-17

- 61 portable tests pass, including preference migration, revision ordering,
  interrupted host writes, manual inline edits and all 30 translation catalogs.
- Real FileView tests verify atomic save, rapid consecutive changes, restoration
  in a new process, private directory permissions and omission of the placement
  ID. Invalid JSON stays untouched; a write error preserves the previous file
  and reports failure.
- The lifecycle test runs actual Omarchy commands and its installed
  PluginRegistry in a bubblewrap profile without desktop or network sockets.
  Its small offscreen host loads the real widget with a scoped settings API.
  Install, repeated enable, update, restart, disable/re-enable, removal and
  reinstall pass. Preferences and hint progress restore automatically; unrelated
  profile settings and the live desktop configuration remain unchanged.
- Two native shell restarts preserve existing language, appearance, labels,
  workspace preference and hint progress on both monitors. The shared durable
  file is readable and neither widget reports a persistence error.
- Actual Qt pointer/key events verify the author link's selected GitHub
  destination and disabled state. Appearance-editor and dropdown regression
  tests pass in temporary state directories.
- The native visibility regression test passes after the persistence changes:
  first action after restart, duplicate requests, open keyboard panel and
  cross-monitor actions. Original window membership and workspaces are preserved.
- Omarchy manifest validation, source archive CRC/required-file checks and local
  documentation links pass.
- Static QML checking still reports dynamic Omarchy host-property and QProcess
  metadata warnings. These are not presented as a clean static type check.

The isolated lifecycle test is not a complete second desktop session. Native
checks use the existing two-monitor machine. Translation checks establish
catalog coverage, not native-speaker review; physical hot-unplug and every
keyboard/pointer path remain outside the automated coverage.

## 0.9.0 validation — 2026-09-17

- 60 portable tests pass, including focused-window selection, missing monitors,
  complete visibility snapshots, changed workspace context, fresh client
  inventories, and matching translation keys/placeholders across 30 languages.
- `tools/test_visibility.py` exercises the real QML transaction controller with
  delayed/stale replies, duplicate requests across monitors, malformed JSON,
  command failure, obsolete responses, missing acknowledgment, timeout, empty
  scratchpad and legacy focus races. No mutation is automatically retried.
- `tools/test_live_visibility.py` uses the same public action as the bar on the
  native two-monitor shell. It checks the first action after restart, show/hide,
  duplicate invocation, an open keyboard panel, another monitor holding focus,
  and moving the overlay between monitors. Each action has one sampled state
  transition. Original overlays/focus are restored; window membership and ordinary
  workspaces stay unchanged.
- Production-generated Lua runs in Hyprland's actual interpreter against local
  mock monitor objects to check idempotence and workspace/unrelated-overlay/
  removed-monitor guards without changing user windows.
- The reported intermittent physical first-click flicker was **not reproduced**
  by the pre-fix IPC test. The change removes the identified focus/toggle race
  and stale-state dependency; IPC coverage does not simulate every native pointer
  routing path or physical monitor hot-unplug.
- Actual offscreen Qt clicks verify Ctrl-add versus ordinary dropdown toggling,
  disabled controls, hover-budget consumption and generic dropdown compatibility.
  The panel-actions test checks live footer wording when hints change.
- `tools/test_live_quick_add.py` confirms that opening a native keyboard panel
  preserves the intended focused window, and only that tab of a disposable group
  moves. Existing windows remain on their original workspaces.
- Transfer-controller regression tests, Omarchy plugin validation, source archive
  CRC and required-file checks pass. Native shell logs have no ScratchPeek errors.
  Static QML lint still reports host-facade and QProcess metadata warnings;
  these are not syntax failures, and the native process path was exercised above.

## 0.8.1 validation — 2026-09-17

- 55 model/localization checks pass with count-based onboarding: values 0–100,
  manual overrides, persisted progress, invalid counts and migration from the
  unused calendar timestamp. Time no longer controls hint availability.
- Real Qt hover events verify that brief passes consume nothing, a displayed
  hint counts once, remaining views update on both widget instances, the 100th
  hint stays readable, the 101st cannot open, and hovering help never consumes
  the budget. Manual activation restores hints without resetting the counter.
- The same offscreen suite retains Ctrl-click routing, 200% scale, keyboard
  activation, rapid-save and rejected-write checks. Plugin validation and QML
  syntax/import checks pass.

## 0.8.0 validation — 2026-09-17

- 55 portable checks cover seven-day expiry, each daily countdown boundary,
  manual overrides, reload preservation, invalid dates, clock rollback after
  expiry, binding detection, and complete keys/placeholders in all 30 languages.
- `python3 tools/test_panel_actions.py` sends actual Qt pointer/key events to
  offscreen controls: ordinary versus Ctrl clicks, hover hints, switching off
  while the help icon's tooltip remains visible, a live daily countdown, 200%
  scale, a disabled action, and keyboard activation.
- The same test mounts two real Widget instances with a scoped in-memory bar
  API. A stale layout snapshot reproduces rapid-toggle lost updates. Successive
  changes reach both widgets and saved settings; rejected writes preserve the
  prior state and report failure. Quickshell's offscreen backend cannot mount
  native KeyboardPanel windows; those are inspected in the live shell instead.
- Existing offscreen transfer tests pass. The native two-monitor check confirms
  rapid on/off changes, persistent manual mode after shell restart, an unchanged
  first-seen timestamp and preservation of appearance, language and labels.
- Native visual inspection confirms the help icon at bottom left, author at
  bottom right, and an explicit scratchpad shortcut beside the status. No new
  ScratchPeek errors appear in the shell log. Plugin validation and archive CRC
  checks pass; unrelated existing shell warnings are unchanged.

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

## 0.7.0 validation — 2026-09-17

- 51 model tests pass. Transfer cases cover candidate filtering, stale/invalid
  selection, numbered/named/empty workspace destinations, explicit client
  targeting, atomic membership/group guards and acknowledged completion.
- `python3 tools/test_transfers.py` runs the real QML controller and compact
  destination editor offscreen. Covers serialized requests, timeout without
  repeated dispatch, a window closing mid-operation, destination selection,
  current-workspace default and translation changes preserving the selection.
- `python3 tools/test_editor.py` still passes the appearance/preset regression
  checks. `omarchy plugin validate .` passes. QML lint has no syntax/import errors;
  the installed Omarchy UI kit still produces dynamic-property warnings.
- `python3 tools/test_live_transfers.py` is an **opt-in live desktop test** using
  two disposable foot windows on a unique named workspace. It checks adding,
  extracting to the current workspace, named destinations and both directions
  for a single grouped tab. It verifies existing user-window membership and
  active workspaces, then closes the test windows and restores focus.
- The grouped integration check intentionally creates a group through Hyprland's
  direct Lua API, which can leave the Quickshell IPC snapshot briefly stale.
  The transfer guards run inside Hyprland and still move just the selected tab.
- Native integration passed on Omarchy 4.0.4 / Hyprland 0.56.2, including grouped
  siblings staying in place. The compact destination panel was visually checked
  on DP-1. No desktop screenshots or private window titles are included here.

Implementation references, pinned to the tested compositor version:
[Lua dispatchers](https://github.com/hyprwm/Hyprland/blob/v0.56.2/src/config/lua/bindings/LuaBindingsDispatchers.cpp),
[window properties](https://github.com/hyprwm/Hyprland/blob/v0.56.2/src/config/lua/objects/LuaWindow.cpp),
[group membership API](https://github.com/hyprwm/Hyprland/blob/v0.56.2/src/config/lua/objects/LuaGroup.cpp).

## 0.7.1 validation — 2026-09-17

- Reproduced the reported reopen-on-second-click bug with real Qt mouse events
  on the unmodified dropdown. `python3 tools/test_dropdown.py` failed before
  the fix and passes after it. No desktop input is synthesized by this test.
- The regression test also covers a third click reopening, outside-click and
  Escape dismissal, typing to filter, Enter selecting exactly once, clearing
  search on close, and a 200% popup opening above its trigger near the window edge.
- 51 model checks, all 30 translation catalogs, the transfer controller/editor
  test and Omarchy's plugin validator pass.
- The labeled Move out… button was visually checked on the native panel on DP-3.
  Saved appearance settings were preserved. No new ScratchPeek runtime errors.

Qt's [popup close policy](https://doc.qt.io/qt-6/qml-qtquick-controls-popup.html#closePolicy-prop)
excludes the trigger (popup parent) from press-outside dismissal. The trigger
then handles its own click once, while clicks elsewhere continue to dismiss.

## 0.7.2 validation — 2026-09-17

- 51 model/translation checks and the existing offscreen appearance preview
  check pass; Omarchy's plugin validator passes.
- QML lint reports no syntax/import errors for the details panel. The native
  panel loads and displays Move out without an ellipsis; the full extraction
  tooltip retains its ellipsis.
- The focus hint is attached only to the icon/title click area, excluding the
  extraction button, and is hidden during scrolling or editing. Its final
  English wording is Click to focus this window or tab, translated into all
  30 languages, with an accessibility description and wrapped tooltip text.
- The bar tooltip footer now says Right-click: window list and settings in
  English and uses the corresponding wording in every other supported locale.

## 0.7.3 validation — 2026-09-17

- 51 model/translation checks pass, including complete new visibility hints
  and expanded add-window labels across all 30 locales.
- The real Qt dropdown pointer/keyboard regression test passes with the longer
  Add window to scratchpad… trigger label, including its 200% scaled variant.
- Omarchy plugin validation and QML syntax/import checks pass. Visibility hints
  reuse the native button tooltip and use explicit line breaks for compact text.
