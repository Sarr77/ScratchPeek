import QtQuick
import Quickshell
import Quickshell.Io

QtObject {
  id: root
  required property var preferences
  readonly property string path: preferences.directory + "/updates.json"
  readonly property int checkInterval: 6 * 60 * 60
  property double lastCheck: 0
  property double nextCheck: 0
  property double lastLaunch: 0
  property bool startupPending: true
  property bool ready: false
  property string status: ""
  property bool runtimeAvailable: Quickshell.env("QT_QPA_PLATFORM") !== "offscreen"
  property var launch: function(startup) {
    var command = ["python3", "-I", "-B", decodeURIComponent(Qt.resolvedUrl("update.py").toString().replace(/^file:\/\//, ""))];
    if (startup) command.push("--startup");
    Quickshell.execDetached(command);
  }
  readonly property bool enabled: preferences.ready && !preferences.failed && preferences.values.autoUpdates !== false
  property FileView state: FileView {
    path: root.path
    watchChanges: true
    printErrors: false
    onLoaded: {
      try {
        var value = JSON.parse(text());
        root.lastCheck = Number(value.lastCheck) || 0;
        // Keep the last check when shortening an older daily schedule.
        root.nextCheck = Math.min(Number(value.nextCheck) || 0,
                                  root.lastCheck + root.checkInterval);
        root.status = value.status || "";
      } catch (error) { root.lastCheck = 0; root.nextCheck = 0; root.status = ""; }
      root.ready = true;
    }
    onLoadFailed: root.ready = true
    onFileChanged: reload()
  }
  function check(widgets, now) {
    if (!enabled || !ready || !runtimeAvailable) return;
    if (widgets.some(function(widget) { return widget.opened || widget.transferBusy || widget.visibilityBusy; })) return;
    if (now === undefined) now = Date.now() / 1000;
    var startup = startupPending;
    startupPending = false;
    var startupDue = startup && new Date(lastCheck * 1000).toDateString() !== new Date(now * 1000).toDateString();
    if ((!startupDue && now < nextCheck && nextCheck <= now + checkInterval) || (now >= lastLaunch && now - lastLaunch < 300)) return;
    lastLaunch = now;
    // A detached worker can finish its atomic install even when the shell reloads.
    launch(startup);
  }
}
