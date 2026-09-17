import QtQuick
import "Transfers.js" as Transfers

// Shared by all bar instances. Wait for compositor acknowledgment of the move.
QtObject {
  id: root
  property var clients: []
  property var dispatch: null
  property var refresh: null
  property var job: null
  property string error: ""
  readonly property bool busy: job !== null
  property int elapsed: 0
  signal completed()

  function start(plan) {
    if (busy) return false;
    error = "";
    if (!plan) { error = "transferError"; return false; }
    job = plan;
    elapsed = 0;
    dispatch(job.move);
    refresh();
    poll.start();
    return true;
  }
  function fail() { poll.stop(); job = null; error = "transferError"; }
  property Timer poll: Timer {
    interval: 100
    repeat: true
    onTriggered: {
      root.elapsed += interval;
      var step = Transfers.progress(root.job, root.clients);
      if (step === "error") { root.fail(); return; }
      if (step === "done") { stop(); root.job = null; root.completed(); return; }
      if (root.elapsed >= 2500) { root.fail(); return; }
      root.refresh();
    }
  }
}
