import QtQuick
import Quickshell.Io
import "Visibility.js" as Visibility

// One transaction shared by all bar instances. It reads before closing a
// keyboard panel, applies an explicit state once, then verifies the result.
QtObject {
  id: root
  property var job: null
  property string phase: ""
  property string error: ""
  property string errorScreen: ""
  property var lastFailure: ({})
  property int generation: 0
  property int elapsed: 0
  readonly property bool busy: job !== null || runner.running
  property var refresh: function() {}
  // Replaceable transport for deterministic tests of delayed/stale IPC replies.
  property var execute: function(argv, token) {
    runner.token = token;
    runner.command = argv;
    runner.running = true;
  }
  signal failed(string screen)
  signal completed(string screen)

  function start(workspace, screen, lua, beforeApply, whenEmpty) {
    if (busy) return false;
    error = ""; errorScreen = "";
    generation++; elapsed = 0;
    job = {workspace:workspace, screen:screen, lua:lua, beforeApply:beforeApply, whenEmpty:whenEmpty, plan:null};
    watchdog.start();
    request("snapshot", ["hyprctl", "-j", "monitors"]);
    return true;
  }
  function request(nextPhase, argv) {
    phase = nextPhase;
    execute(argv, generation);
  }
  function fail(reason) {
    if (!job) return;
    var screen = job.screen;
    lastFailure = {phase:phase, reason:reason || "unspecified", elapsedMs:elapsed};
    console.warn("ScratchPeek visibility: " + JSON.stringify(lastFailure));
    watchdog.stop(); job = null; phase = "";
    runner.running = false;
    error = "visibilityError"; errorScreen = screen;
    refresh(); failed(screen);
  }
  function finish(empty) {
    var old = job;
    watchdog.stop(); job = null; phase = "";
    refresh();
    if (empty && old.whenEmpty) old.whenEmpty();
    else completed(old.screen);
  }
  function apply() {
    elapsed = 0;
    // Capture the intent before releasing the panel's keyboard focus.
    if (job.beforeApply) job.beforeApply();
    if (job.lua) request("apply", ["hyprctl", "eval", Visibility.command(job.plan)]);
    else {
      // Older Hyprland lacks the explicit monitor setter. Serialize its legacy
      // focus, re-read, then toggle only if the desired state is still missing.
      request("legacyFocus", ["hyprctl", "dispatch", "focusmonitor", job.screen]);
    }
  }
  function receive(token, code, output) {
    if (!job || token !== generation) return;
    if (code !== 0) { fail("command-failed"); return; }
    var reply;
    if (["snapshot", "clients", "verify", "legacyRead"].indexOf(phase) >= 0) {
      try { reply = JSON.parse(output); } catch (e) { fail("invalid-reply"); return; }
    } else if (String(output).trim() !== "ok") { fail("command-rejected"); return; }
    if (phase === "snapshot") {
      job.plan = Visibility.plan(reply, job.workspace, job.screen);
      if (!job.plan) { fail("monitor-unavailable"); return; }
      if (job.plan.show) request("clients", ["hyprctl", "-j", "clients"]);
      else apply();
    } else if (phase === "clients") {
      var occupied = Visibility.occupied(reply, job.plan);
      if (occupied === null) fail("invalid-clients");
      else if (!occupied) finish(true);
      else apply();
    } else if (phase === "legacyFocus") {
      request("legacyRead", ["hyprctl", "-j", "monitors"]);
    } else if (phase === "legacyRead") {
      var state = Visibility.progress(reply, job.plan);
      if (state === "error") fail("context-changed");
      else if (state === "done") phase = "wait";
      else {
        var current = Visibility.plan(reply, job.workspace, job.screen);
        var focused = reply.some(function(m) { return m && m.name === root.job.screen && m.focused; });
        if (!focused || current.previous !== job.plan.previous) fail("focus-changed");
        else request("apply", ["hyprctl", "dispatch", "togglespecialworkspace", job.workspace]);
      }
    } else if (phase === "apply") {
      refresh();
      request("verify", ["hyprctl", "-j", "monitors"]);
    } else if (phase === "verify") {
      var result = Visibility.progress(reply, job.plan);
      if (result === "error") fail("context-changed");
      // Keep one short shared guard while the panel/monitor transition settles.
      // A duplicate forwarded click cannot start an opposite transaction.
      else if (result === "done" && elapsed >= 250) finish(false);
      else phase = "wait";
    }
  }
  property Process runner: Process {
    property int token: 0
    stdout: StdioCollector { id: response }
    onExited: function(code) { root.receive(token, code, response.text); }
  }
  property Timer watchdog: Timer {
    interval: 50; repeat: true
    onTriggered: {
      root.elapsed += interval;
      if (root.elapsed >= 2500) { root.fail("timeout"); return; }
      if (root.phase === "wait") root.request("verify", ["hyprctl", "-j", "monitors"]);
    }
  }
}
