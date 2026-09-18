import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Hyprland
import qs.Ui
import qs.Commons
import "." as Local
import "Model.js" as Model
import "I18n.js" as I18n
import "Appearance.js" as Appearance
import "Transfers.js" as Transfers

BarWidget {
  id: root
  moduleName: "sarr.scratchpeek"
  readonly property var effectiveSettings: !settingsReady ? settings
    : (Local.ScratchState.preferences.hasSavedValues
      ? Local.ScratchState.preferences.values : Local.ScratchState.fallbackSettings)
  function preference(name, fallback) {
    var value = effectiveSettings ? effectiveSettings[name] : undefined;
    return value === undefined || value === null ? fallback : value;
  }
  readonly property string workspaceName: String(preference("workspace", "scratchpad"))
  readonly property string languageSetting: String(preference("language", "auto"))
  readonly property string detectedLanguage: I18n.language("auto", Qt.locale().uiLanguages, Qt.locale().name)
  readonly property string language: I18n.language(languageSetting, Qt.locale().uiLanguages, Qt.locale().name)
  readonly property var words: Model.words(language)
  readonly property var monitorDiagram: Model.monitorLayout(Local.ScratchState.monitors)
  property bool languageSaveFailed: false
  property bool hintsSaveFailed: false
  property bool updatesSaveFailed: false
  readonly property bool autoUpdates: preference("autoUpdates", true) !== false
  readonly property string updateStatus: Local.ScratchState.updates.status
  function toggleUpdates() { updatesSaveFailed = !persistSettings({autoUpdates: !autoUpdates}); }
  property bool settingsReady: false
  readonly property bool preferencesSaveFailed: Local.ScratchState.preferences.failed
  readonly property var hints: Model.hintState(effectiveSettings)
  readonly property string toggleShortcut: Model.toggleShortcut(Local.ScratchState.keyBindings, workspaceName)
  function recordHintShown() {
    if (hints.mode !== "auto" || hints.remaining <= 0) return false;
    hintsSaveFailed = !persistSettings({ hintsUsed: hints.used + 1 });
    return !hintsSaveFailed;
  }
  function setHintsMode(mode) {
    if (["auto", "on", "off"].indexOf(mode) < 0) return false;
    hintsSaveFailed = !persistSettings({ hintsMode: mode });
    return !hintsSaveFailed;
  }
  function toggleHints() { return setHintsMode(hints.enabled ? "off" : "on"); }
  readonly property var savedAppearance: Appearance.normalize(effectiveSettings)
  readonly property var appearance: Local.ScratchState.previewOwner !== "" ? Local.ScratchState.previewAppearance : savedAppearance
  readonly property string themeId: Local.ScratchState.themeId
  readonly property color accent: Appearance.resolve(appearance, themeId, String(Color.accent))
  readonly property color themeAccent: Color.accent
  readonly property real uiScale: appearance.uiScale
  readonly property real requestedBarFont: Style.font.body * appearance.barScale
  readonly property real effectiveBarFont: root.vertical ? requestedBarFont
    : Math.min(requestedBarFont, requestedBarFont * Math.max(1, root.barSize - Style.space(4)) / Math.max(1, barMetrics.height))
  readonly property real effectiveBarScale: effectiveBarFont / Style.font.body
  FontMetrics { id: barMetrics; font.family: root.bar ? root.bar.fontFamily : "monospace"; font.pixelSize: root.requestedBarFont }
  readonly property color underlineColor: Qt.rgba(accent.r + (1-accent.r)*0.22,
    accent.g + (1-accent.g)*0.22, accent.b + (1-accent.b)*0.22, 1)
  readonly property var savedLabels: Model.normalizeLabels(effectiveSettings)
  readonly property var labels: Local.ScratchState.labelsPreviewOwner !== "" ? Local.ScratchState.previewLabels : savedLabels
  readonly property string statusDescription: Model.statusText(scratchpadState, language, labels, workspaceName)
  readonly property real openPanelIndicatorWidth: button.labelWidth
  readonly property real openPanelIndicatorHeight: Math.max(Style.space(10), button.implicitHeight - Style.space(12))
  readonly property bool canShowTooltip: button.tooltipHovered && !opened && (!bar || !bar.activePopout)
  property bool tooltipReady: false
  onCanShowTooltipChanged: {
    tooltipReady = false;
    if (canShowTooltip) tooltipDelay.restart(); else tooltipDelay.stop();
  }
  readonly property string screenName: root.QsWindow.window && root.QsWindow.window.screen
    ? root.QsWindow.window.screen.name : ""
  readonly property var scratchpadState: Model.summarize(Local.ScratchState.clients, Local.ScratchState.monitors,
    workspaceName, screenName, Local.ScratchState.activeAddress)
  readonly property bool opened: panelLoader.item ? panelLoader.item.opened : false
  readonly property bool popoutSwitchClosing: panelLoader.item ? panelLoader.item.popoutSwitchClosing : false
  readonly property var destinations: Transfers.destinations(Local.ScratchState.workspaces, Local.ScratchState.monitors, screenName)
  readonly property string defaultDestination: destinations.current
  readonly property var destinationOptions: destinations.options.map(function(item) {
    return {value:item.value, label:I18n.format(words.workspaceLabel, {workspace:item.name}),
      description:item.monitor + (item.value === defaultDestination ? (item.monitor ? " · " : "") + words.currentWorkspace : "")};
  })
  readonly property var addWindowOptions: Transfers.candidates(Local.ScratchState.clients).map(function(win) {
    var entry = DesktopEntries.heuristicLookup(win.class || win.initialClass || "");
    return {value:win.address, label:(entry ? entry.name : (win.class || win.initialClass || words.unnamed)) + " · " + (win.title || words.unnamed),
      description:I18n.format(words.workspaceLabel, {workspace:win.workspace.name})};
  })
  readonly property bool transferBusy: Local.ScratchState.transfer.busy
  readonly property bool transferSupported: Hyprland.usingLua
  readonly property string transferError: Local.ScratchState.transfer.error
  readonly property bool visibilityBusy: Local.ScratchState.visibility.busy
  readonly property string visibilityError: Local.ScratchState.visibility.errorScreen === screenName ? Local.ScratchState.visibility.error : ""
  Connections {
    target: Local.ScratchState.visibility
    function onFailed(screen) { if (screen === root.screenName) root.open(); }
  }
  property string focusBeforePanel: ""
  signal transferCompleted()
  Connections { target: Local.ScratchState.transfer; function onCompleted() { root.transferCompleted(); } }
  function clearTransferError() { Local.ScratchState.transfer.error = ""; }
  function addWindow(address) {
    return Local.ScratchState.transfer.start(Transfers.plan(Local.ScratchState.clients, address, workspaceName, "", [], Hyprland.usingLua));
  }
  function addFocusedWindow() {
    if (transferBusy) return false;
    var address = Transfers.focusedCandidate(Local.ScratchState.clients, Local.ScratchState.activeAddress,
      opened ? focusBeforePanel : "", Local.ScratchState.monitors);
    if (!address) { Local.ScratchState.transfer.error = "noFocusedWindow"; return false; }
    return addWindow(address);
  }
  function extractWindow(address, destination) {
    if (!destination) return false;
    return Local.ScratchState.transfer.start(Transfers.plan(Local.ScratchState.clients, address, workspaceName, destination, destinations.options, Hyprland.usingLua));
  }
  function openExtraction(address) {
    if (!opened) focusBeforePanel = Local.ScratchState.activeAddress;
    return panelLoader.item ? panelLoader.item.openTransferAddress(address) : false;
  }

  function open() {
    if (!opened) focusBeforePanel = Local.ScratchState.activeAddress;
    if (panelLoader.item) panelLoader.item.open();
  }
  function close() { if (panelLoader.item) panelLoader.item.close() }
  function toggle() { if (opened) close(); else open(); }
  function closeForPopoutSwitch() { if (panelLoader.item) panelLoader.item.closeForPopoutSwitch() }

  function setLanguage(value) {
    if (value !== "auto" && !I18n.languages.some(function(item) { return item.code === value; })) return false;
    if (value === languageSetting) return true;
    root.languageSaveFailed = !persistSettings({ language: value });
    return !root.languageSaveFailed;
  }

  function persistSettings(values) {
    if (!settingsReady) return false;
    var current = Model.mergeSettings(effectiveSettings, {}, root.moduleName);
    var entry = Model.mergeSettings(current, values, root.moduleName);
    if (JSON.stringify(current) !== JSON.stringify(entry))
      entry = Model.stampSettings(entry, Local.ScratchState.preferences.values);
    // The worker reads this file too. Never publish an unsaved choice to the UI.
    if (!Local.ScratchState.preferences.save(entry)) return false;
    publishSettings(entry);
    return true;
  }

  onSettingsChanged: {
    if (!settingsReady || Local.ScratchState.publishingSettings) return;
    var saved = Model.mergeSettings(effectiveSettings, {}, root.moduleName);
    if (JSON.stringify(settings) === JSON.stringify(saved)) return;
    // Omarchy also changes settings in place, without recreating the widget.
    // A delayed host copy must not undo a newer choice from either monitor.
    var incoming = Model.restoreSettings(saved, settings, root.moduleName);
    if (!persistSettings(incoming)) publishSettings(saved);
  }

  function publishSettings(entry) {
    // Omarchy keeps a mirror; its API's false result can also mean "unchanged".
    // A stale mirror is reconciled from the durable revision on the next load.
    Local.ScratchState.publishingSettings = true;
    try {
      try {
        if (root.bar && root.bar.shell && typeof root.bar.shell.updateEntryInline === "function")
          root.bar.shell.updateEntryInline(root.moduleName, entry);
      } catch (error) { console.warn("ScratchPeek: bar settings mirror unavailable"); }
      root.settings = entry;
      var widgets = root.bar ? root.bar.moduleWidgets(root.moduleName) : [];
      for (var i = 0; i < widgets.length; i++) widgets[i].settings = entry;
    } finally { Local.ScratchState.publishingSettings = false; }
  }

  function previewAppearance(values) { Local.ScratchState.beginPreview(screenName, Appearance.merge(savedAppearance, values)); }
  function cancelAppearance() { Local.ScratchState.endPreview(screenName); }
  function saveAppearance(values) {
    if (!persistSettings(Appearance.merge(savedAppearance, values))) return false;
    cancelAppearance();
    return true;
  }

  function previewLabels(values) { Local.ScratchState.beginLabelsPreview(screenName, Model.normalizeLabels(values)); }
  function cancelLabels() { Local.ScratchState.endLabelsPreview(screenName); }
  function saveLabels(values) {
    if (!persistSettings(Model.normalizeLabels(values))) return false;
    cancelLabels();
    return true;
  }

  function toggleScratchpad() {
    Local.ScratchState.visibility.start(workspaceName, screenName, Hyprland.usingLua,
      function() { root.close(); }, function() { root.open(); });
  }

  function focusWindow(address) {
    // Ignore a stale list item if its window closed or left the scratchpad.
    if (!scratchpadState.windows.some(function(win) { return win.address === address; })) return;
    close();
    var command = Model.focusCommand(address, Hyprland.usingLua);
    if (command) Hyprland.dispatch(command);
  }

  function widgetOnScreen(name) {
    var screen = name || (Hyprland.focusedMonitor ? Hyprland.focusedMonitor.name : "");
    var widgets = root.bar ? root.bar.moduleWidgets(root.moduleName) : [root];
    for (var i = 0; i < widgets.length; i++) {
      if (widgets[i].screenName === screen) return widgets[i];
    }
    return null;
  }

  function injectPanel() {
    if (!panelLoader.item) return;
    panelLoader.item.bar = root.bar;
    panelLoader.item.anchorItem = button;
    panelLoader.item.hostWidget = root;
  }

  implicitWidth: button.implicitWidth
  implicitHeight: button.implicitHeight
  onBarChanged: { injectPanel(); initialSettingsTimer.restart(); }

  // Wait for host injection, then reconcile its layout snapshot with the durable
  // revision. A code reload can otherwise reinject an older ModuleSlot.entry.
  Timer {
    id: initialSettingsTimer
    interval: 60
    onTriggered: {
      if (!root.bar || root.settingsReady || !Local.ScratchState.preferences.ready) return;
      var current = Model.initialSettings(root.bar.layoutConfig, root.moduleName, root.settings);
      var stored = Local.ScratchState.preferences.values;
      var restored = Model.restoreSettings(stored, current, root.moduleName);
      // A missing or unreadable file is not an empty saved configuration.
      // Keep the original host entry for every monitor until a save succeeds.
      if (!Local.ScratchState.preferences.hasSavedValues) {
        if (Local.ScratchState.fallbackSettings === null)
          Local.ScratchState.fallbackSettings = JSON.parse(JSON.stringify(restored));
        restored = Local.ScratchState.fallbackSettings;
      }
      if (JSON.stringify(Model.mergeSettings(stored, {}, root.moduleName)) !== JSON.stringify(restored))
        restored = Model.stampSettings(restored, stored);
      var saved = Local.ScratchState.preferences.save(restored);
      root.settings = saved ? restored : Model.mergeSettings(
        Local.ScratchState.preferences.hasSavedValues ? stored : Local.ScratchState.fallbackSettings,
        {}, root.moduleName);
      root.settingsReady = true;
      if (saved) root.publishSettings(restored);
    }
  }
  Connections {
    target: Local.ScratchState.preferences
    function onReadyChanged() { if (Local.ScratchState.preferences.ready) initialSettingsTimer.restart(); }
  }
  Component.onCompleted: initialSettingsTimer.start()
  Timer {
    interval: 60000
    repeat: true
    running: root.settingsReady && root.autoUpdates
    onTriggered: Local.ScratchState.updates.check(root.bar ? root.bar.moduleWidgets(root.moduleName) : [root])
  }

  Rectangle {
    anchors.fill: parent
    anchors.margins: 2
    radius: 4
    color: root.accent
    opacity: root.scratchpadState.status === "here" ? (root.scratchpadState.focused ? 0.20 : 0.08) : 0
    Behavior on opacity {
      enabled: !root.bar || root.bar.foregroundAnimationEnabled
      NumberAnimation { duration: 140 }
    }
  }

  WidgetButton {
    id: button
    anchors.fill: parent
    bar: root.bar
    fontSize: root.effectiveBarFont
    text: Model.label(root.scratchpadState, root.language, root.preference("compact", false), root.vertical, root.labels, root.workspaceName)
    // A local popup supplies styled contents without changing other bar tooltips.
    tooltipText: ""
    pressable: !root.visibilityBusy
    Accessible.role: Accessible.Button
    Accessible.name: Model.tooltip(root.scratchpadState, root.language, root.workspaceName, root.labels)
    active: root.scratchpadState.status === "here"
    activeColor: root.accent
    dimmed: root.scratchpadState.status === "empty"
    fixedHeight: root.vertical ? Math.max(Style.space(44), barMetrics.height * 2 + Style.space(12)) : root.barSize
    onPressed: function(code) {
      if (code === Qt.LeftButton) root.toggleScratchpad();
      else if (code === Qt.RightButton || code === Qt.MiddleButton) root.toggle();
    }
  }

  // Details owns the coordinated popup; this widget paints its own mark so
  // custom accents work without changing the bar host or the global theme.
  Rectangle {
    readonly property string edge: root.bar ? root.bar.position : "top"
    readonly property int inset: Style.space(2)
    width: root.vertical ? Style.space(2) : root.openPanelIndicatorWidth
    height: root.vertical ? root.openPanelIndicatorHeight : Style.space(2)
    x: root.vertical ? (edge === "left" ? parent.width-width-inset : inset) : Math.round((parent.width-width)/2)
    y: root.vertical ? Math.round((parent.height-height)/2) : (edge === "top" ? parent.height-height-inset : inset)
    radius: Math.min(width, height)/2
    color: root.underlineColor
    opacity: root.opened ? 1 : 0
    visible: opacity > 0
    Behavior on opacity {
      enabled: !root.bar || root.bar.foregroundAnimationEnabled
      NumberAnimation { duration: 120 }
    }
  }

  Timer { id: tooltipDelay; interval: 350; onTriggered: root.tooltipReady = root.canShowTooltip }
  HoverTip { anchorItem: button; hostWidget: root; shown: root.tooltipReady && root.canShowTooltip }

  Loader {
    id: panelLoader
    active: true
    visible: false
    source: Qt.resolvedUrl("Details.qml")
    onLoaded: { root.injectPanel(); Qt.callLater(root.injectPanel); }
  }

  // Register exactly once, although the bar instantiates a widget per screen.
  // Optional scripting interface; the same methods are used by pointer input.
  IpcHandler {
    enabled: Local.ScratchState.monitors.length > 0
      && root.screenName === Local.ScratchState.monitors[0].name
    target: "sarr.scratchpeek"
    function status(): string {
      var widgets = root.bar ? root.bar.moduleWidgets(root.moduleName) : [root];
      return JSON.stringify(widgets.map(function(widget) {
        return { screen: widget.screenName, status: widget.scratchpadState.status,
          count: widget.scratchpadState.count, focused: widget.scratchpadState.focused,
          openOn: widget.scratchpadState.monitor, language: widget.language, languageSetting: widget.languageSetting,
          detectedLanguage: widget.detectedLanguage, workspace: widget.workspaceName, version: "0.11.1",
          hints: widget.hints, hintsSaveFailed: widget.hintsSaveFailed,
          autoUpdates: widget.autoUpdates, updateStatus: widget.updateStatus, updatesSaveFailed: widget.updatesSaveFailed,
          preferencesSaveFailed: widget.preferencesSaveFailed,
          preferencesReady: widget.settingsReady && Local.ScratchState.preferences.ready,
          toggleShortcut: widget.toggleShortcut,
          visibilityBusy: widget.visibilityBusy, visibilityError: widget.visibilityError,
          visibilityLastFailure: Local.ScratchState.visibility.lastFailure,
          accent: String(widget.accent), appearance: widget.appearance, savedAppearance: widget.savedAppearance,
          themeAccent: String(widget.themeAccent), themeId: widget.themeId, effectiveBarScale: widget.effectiveBarScale,
          underlineColor: String(widget.underlineColor), opened: widget.opened,
          description: widget.statusDescription, labels: widget.labels, savedLabels: widget.savedLabels,
          labelWidth: widget.openPanelIndicatorWidth, transferBusy:widget.transferBusy, transferError:widget.transferError };
      }));
    }
    function toggleScratchpad(screen: string): void {
      var widget = root.widgetOnScreen(screen);
      if (widget) widget.toggleScratchpad();
    }
    function showDetails(screen: string): void {
      var widget = root.widgetOnScreen(screen);
      if (widget) widget.open();
    }
    function closeDetails(): void { root.broadcast("close") }
    function focusWindow(address: string): void { root.focusWindow(address) }
    function addWindow(screen: string, address: string): bool {
      var widget = root.widgetOnScreen(screen);
      return widget ? widget.addWindow(address) : false;
    }
    function addFocusedWindow(screen: string): bool {
      var widget = root.widgetOnScreen(screen);
      return widget ? widget.addFocusedWindow() : false;
    }
    function extractWindow(screen: string, address: string, destination: string): bool {
      var widget = root.widgetOnScreen(screen);
      return widget ? widget.extractWindow(address, destination) : false;
    }
    function showExtraction(screen: string, address: string): bool {
      var widget = root.widgetOnScreen(screen);
      return widget ? widget.openExtraction(address) : false;
    }
    function setLanguage(language: string): bool { return root.setLanguage(language) }
    function setHintsMode(mode: string): bool { return root.setHintsMode(mode) }
    function showLanguages(screen: string): void {
      var widget = root.widgetOnScreen(screen);
      if (widget) { widget.open(); widget.openLanguagePicker(); }
    }
    function showAppearance(screen: string): void {
      var widget = root.widgetOnScreen(screen);
      if (widget) { widget.open(); widget.openAppearance(); }
    }
    function showLabels(screen: string): void {
      var widget = root.widgetOnScreen(screen);
      if (widget) { widget.open(); widget.openLabels(); }
    }
    function showScaling(screen: string): void {
      var widget = root.widgetOnScreen(screen);
      if (widget) { widget.open(); widget.openScaling(); }
    }
    function previewTexts(screen: string, json: string): bool {
      var widget = root.widgetOnScreen(screen);
      if (!widget) return false;
      try { widget.previewLabels(JSON.parse(json)); return true; } catch (e) { return false; }
    }
    function cancelTexts(screen: string): void { var widget = root.widgetOnScreen(screen); if (widget) widget.cancelLabels(); }
    function saveTexts(json: string): bool {
      try { return root.saveLabels(JSON.parse(json)); } catch (e) { return false; }
    }
    function previewStyle(screen: string, json: string): bool {
      var widget = root.widgetOnScreen(screen);
      if (!widget) return false;
      try { widget.previewAppearance(JSON.parse(json)); return true; } catch (e) { return false; }
    }
    function cancelStyle(screen: string): void { var widget = root.widgetOnScreen(screen); if (widget) widget.cancelAppearance(); }
    function saveStyle(json: string): bool {
      try { return root.saveAppearance(JSON.parse(json)); } catch (e) { return false; }
    }
  }

  function openLanguagePicker() {
    if (panelLoader.item) Qt.callLater(function() { panelLoader.item.openLanguages(); });
  }
  function openAppearance() {
    if (panelLoader.item) Qt.callLater(function() { panelLoader.item.openAppearance(); });
  }
  function openLabels() {
    if (panelLoader.item) Qt.callLater(function() { panelLoader.item.openLabels(); });
  }
  function openScaling() {
    if (panelLoader.item) Qt.callLater(function() { panelLoader.item.openScaling(); });
  }
  Component.onDestruction: { cancelAppearance(); cancelLabels(); }
}
