pragma Singleton
import QtQuick
import Quickshell.Hyprland

// One shared event-driven reader for all monitors. No polling shell commands,
// background processes, files, or external network access.
QtObject {
  id: root
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
        workspace: top.workspace ? { name: top.workspace.name } : raw.workspace });
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

  function refresh() {
    Hyprland.refreshMonitors();
    Hyprland.refreshToplevels();
  }

  // Coalesce Hyprland's related events and refresh specialWorkspace, which
  // is not a first-class property in all Quickshell builds.
  property Connections events: Connections {
    target: Hyprland
    function onRawEvent(event) {
      if (/^(activespecial|movewindow|openwindow|closewindow|monitoradded|monitorremoved|workspace|focusedmon|togglegroup|moveintogroup|moveoutofgroup|configreloaded)/.test(event.name))
        root.refreshTimer.restart();
    }
  }
  property Timer refreshTimer: Timer { interval: 120; onTriggered: root.refresh() }
  // Repair missed events after reconnect/reload without spawning any process.
  property Timer reconcile: Timer { interval: 5000; running: true; repeat: true; onTriggered: root.refresh() }
  Component.onCompleted: refresh()
}
