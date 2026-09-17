pragma Singleton
import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Hyprland
import "Appearance.js" as Appearance

// One shared event-driven reader for all monitors, without network access.
// Bindings are read only at startup/config reload, never by a polling command.
QtObject {
  id: root
  property var keyBindings: []
  property Process readBindings: Process {
    command: ["hyprctl", "-j", "binds"]
    stdout: StdioCollector {
      onStreamFinished: {
        try { var bindings = JSON.parse(text); root.keyBindings = Array.isArray(bindings) ? bindings : []; }
        catch (error) { root.keyBindings = []; }
      }
    }
  }
  // Omarchy's stable theme slug, independent of the theme's accent or wallpaper.
  property string themeId: ""
  property FileView themeFile: FileView {
    path: Quickshell.env("HOME") + "/.local/state/omarchy/current/theme.name"
    watchChanges: true
    printErrors: false
    onLoaded: root.themeId = Appearance.themeId(text())
    onFileChanged: reload()
    onLoadFailed: root.themeId = ""
  }
  // Transient editor state shared across bar instances; never saved until Apply.
  property string previewOwner: ""
  property var previewAppearance: ({})
  function beginPreview(owner, values) { previewAppearance = values; previewOwner = owner; }
  function endPreview(owner) { if (previewOwner === owner) { previewOwner = ""; previewAppearance = {}; } }
  property string labelsPreviewOwner: ""
  property var previewLabels: ({})
  function beginLabelsPreview(owner, values) { previewLabels = values; labelsPreviewOwner = owner; }
  function endLabelsPreview(owner) { if (labelsPreviewOwner === owner) { labelsPreviewOwner = ""; previewLabels = {}; } }
  readonly property var clients: {
    var result = [];
    var values = Hyprland.toplevels.values;
    for (var i = 0; i < values.length; i++) {
      var top = values[i];
      var raw = top.lastIpcObject;
      if (!raw || !raw.address) continue;
      result.push({ address: raw.address, title: top.title, class: raw.class,
        initialClass: raw.initialClass, mapped: raw.mapped, grouped: raw.grouped,
        workspace: top.workspace ? { name: top.workspace.name, id: top.workspace.id } : raw.workspace });
    }
    return result;
  }
  readonly property var monitors: {
    var result = [];
    var values = Hyprland.monitors.values;
    for (var i = 0; i < values.length; i++) result.push(values[i].lastIpcObject);
    return result;
  }
  readonly property string activeAddress: Hyprland.activeToplevel
    ? "0x" + Hyprland.activeToplevel.address.replace(/^0x/, "") : "";

  readonly property var workspaces: {
    var result = [], values = Hyprland.workspaces.values;
    for (var i = 0; i < values.length; i++) result.push(values[i].lastIpcObject);
    return result;
  }
  property WindowTransfer transfer: WindowTransfer {
    clients: root.clients
    dispatch: function(command) { Hyprland.dispatch(command); }
    refresh: function() { root.refresh(); }
  }

  function refresh() {
    Hyprland.refreshMonitors();
    Hyprland.refreshToplevels();
    Hyprland.refreshWorkspaces();
  }

  // Coalesce Hyprland's related events and refresh specialWorkspace, which
  // is not a first-class property in all Quickshell builds.
  property Connections events: Connections {
    target: Hyprland
    function onRawEvent(event) {
      if (event.name === "configreloaded") root.readBindings.running = true;
      if (/^(activespecial|movewindow|openwindow|closewindow|monitoradded|monitorremoved|workspace|createworkspace|destroyworkspace|renameworkspace|moveworkspace|focusedmon|togglegroup|moveintogroup|moveoutofgroup|configreloaded)/.test(event.name))
        root.refreshTimer.restart();
    }
  }
  property Timer refreshTimer: Timer { interval: 120; onTriggered: root.refresh() }
  // Repair missed events after reconnect/reload without spawning any process.
  property Timer reconcile: Timer { interval: 5000; running: true; repeat: true; onTriggered: root.refresh() }
  Component.onCompleted: { refresh(); readBindings.running = true; }
}
