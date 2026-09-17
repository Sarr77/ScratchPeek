import QtQuick
import Quickshell
import Quickshell.Io

QtObject {
  id: root
  required property var preferences
  readonly property string path: preferences.directory + "/updates.json"
  property double nextCheck: 0
  property double lastLaunch: 0
  property bool ready: false
  property string status: ""
  property bool runtimeAvailable: Quickshell.env("QT_QPA_PLATFORM") !== "offscreen"
  property var launch: function() {
    Quickshell.execDetached(["python3", decodeURIComponent(Qt.resolvedUrl("update.py").toString().replace(/^file:\/\//, ""))]);
  }
  readonly property bool enabled: preferences.ready && !preferences.failed && preferences.values.autoUpdates !== false
  property FileView state: FileView {
    path: root.path
    watchChanges: true
    printErrors: false
    onLoaded: {
      try {
        var value = JSON.parse(text());
        root.nextCheck = Number(value.nextCheck) || 0;
        root.status = value.status || "";
      } catch (error) { root.nextCheck = 0; root.status = ""; }
      root.ready = true;
    }
    onLoadFailed: root.ready = true
    onFileChanged: reload()
  }
  function check(widgets, now) {
    if (!enabled || !ready || !runtimeAvailable) return;
    if (widgets.some(function(widget) { return widget.opened || widget.transferBusy || widget.visibilityBusy; })) return;
    if (now === undefined) now = Date.now() / 1000;
    if ((now < nextCheck && nextCheck <= now + 86400) || (now >= lastLaunch && now - lastLaunch < 300)) return;
    lastLaunch = now;
    // A detached worker can finish its atomic install even when the shell reloads.
    launch();
  }
}
