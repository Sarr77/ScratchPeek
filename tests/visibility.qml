import QtQuick
import Quickshell
import "ScratchPeek" as Plugin

ShellRoot {
  id: suite
  property var requests: []
  property int closed: 0
  property int empty: 0
  property int failures: 0
  property int completions: 0
  property int stage: 0
  function check(value, message) { if (!value) throw new Error(message); }
  function snapshot(special, workspace) {
    return [{name:"DP-3",id:73,focused:true,activeWorkspace:{name:workspace || "2"},specialWorkspace:{name:special}}];
  }
  function answer(value, code, token) {
    control.receive(token === undefined ? control.generation : token, code || 0,
      typeof value === "string" ? value : JSON.stringify(value));
  }
  function start(lua) {
    return control.start("scratchpad", "DP-3", lua !== false,
      function() { suite.closed++; }, function() { suite.empty++; });
  }
  function mutations() { return requests.filter(function(args) { return args[1] === "eval" || args[1] === "dispatch"; }); }
  Plugin.ScratchVisibility {
    id: control
    execute: function(argv, token) { suite.requests = suite.requests.concat([argv]); }
    onFailed: suite.failures++
    onCompleted: suite.completions++
  }
  Timer {
    interval: 80; running: true; repeat: true
    onTriggered: {
      try {
        if (suite.stage === 0) {
          suite.check(suite.start(), "first request after startup accepted");
          suite.check(suite.mutations().length === 0 && suite.closed === 0, "read before closing panel or dispatching");
          suite.check(!suite.start() && !control.start("scratchpad","DP-1",true,null,null), "duplicate and other-monitor request serialized");
          suite.answer(suite.snapshot("special:scratchpad"));
          suite.check(control.job.plan.show === false && suite.closed === 1, "live open state determines hide before panel closes");
          suite.check(suite.mutations().length === 1 && suite.mutations()[0][1] === "eval", "one explicit operation, no monitor-focus step");
          suite.answer("ok");
          suite.answer(suite.snapshot("special:scratchpad"));
          suite.check(control.busy, "stale acknowledgment does not finish request");
          suite.check(suite.mutations().length === 1, "stale result never triggers a second toggle");
          control.phase = "verify"; suite.answer(suite.snapshot(""));
          suite.check(control.busy && !suite.start(), "forwarded duplicate blocked during settling");
          control.elapsed = 300; control.phase = "verify"; suite.answer(suite.snapshot(""));
          suite.check(!control.busy && suite.completions === 1, "confirmed hide completes");

          suite.start(); suite.answer(suite.snapshot(""));
          suite.check(control.phase === "clients", "startup does not trust cached zero count");
          suite.answer([{mapped:true,workspace:{name:"special:scratchpad"}}]);
          suite.check(control.job.plan.show, "fresh occupied scratchpad is shown");
          suite.answer("ok"); control.elapsed = 300; suite.answer(suite.snapshot("special:scratchpad"));
          suite.check(!control.busy && suite.completions === 2, "confirmed show completes");

          var before = suite.mutations().length;
          suite.start(); suite.answer(suite.snapshot("")); suite.answer([]);
          suite.check(suite.empty === 1 && !control.busy && suite.mutations().length === before, "empty scratchpad opens help without an overlay");

          suite.start(); suite.answer("not json");
          suite.check(!control.busy && control.error === "visibilityError", "bad IPC data fails closed");
          suite.start(); suite.answer([]);
          suite.check(!control.busy, "removed monitor fails closed");
          suite.start(); suite.answer(suite.snapshot("special:scratchpad")); suite.answer("compositor error");
          suite.check(!control.busy && control.error !== "", "non-ok response does not pretend success");
          suite.start(); suite.answer(suite.snapshot("special:scratchpad")); suite.answer("ok");
          suite.answer(suite.snapshot("", "3"));
          suite.check(!control.busy && control.error !== "", "workspace change aborts acknowledgment");

          suite.start(); var oldToken = control.generation; control.fail(); suite.start();
          suite.answer(suite.snapshot("special:scratchpad"), 0, oldToken);
          suite.check(control.phase === "snapshot" && control.job.plan === null, "late response from an older generation ignored");
          control.fail();

          // Legacy focus can already hide a special workspace. Re-read before
          // deciding whether a toggle is needed, so it cannot reopen that one.
          suite.start(false); suite.answer(suite.snapshot("special:scratchpad"));
          suite.answer("ok"); suite.answer(suite.snapshot(""));
          suite.check(control.phase === "wait", "legacy focus-induced hide is not toggled back");
          control.elapsed = 300; control.phase = "verify"; suite.answer(suite.snapshot(""));
          suite.check(!control.busy, "legacy acknowledgment completes");

          suite.start(false); suite.answer(suite.snapshot("special:scratchpad"));
          suite.answer("ok"); suite.answer(suite.snapshot("special:scratchpad"));
          suite.check(control.phase === "apply", "legacy toggles only after fresh focus check");
          suite.answer("ok"); control.elapsed = 300; suite.answer(suite.snapshot(""));
          suite.check(!control.busy, "legacy toggle is acknowledged");
          suite.start(false); suite.answer(suite.snapshot("special:scratchpad")); suite.answer("ok");
          var wrongFocus = suite.snapshot("special:scratchpad"); wrongFocus[0].focused = false;
          suite.answer(wrongFocus);
          suite.check(!control.busy && control.error !== "", "legacy does not toggle a different focused monitor");

          suite.start(); suite.stage = 1;
        } else if (suite.stage === 1 && !control.busy) {
          suite.check(control.error === "visibilityError", "missing IPC reply times out and unlocks");
          suite.start(); suite.answer(suite.snapshot("special:scratchpad")); suite.answer("ok");
          suite.stage = 2;
        } else if (suite.stage === 2) {
          if (control.busy && control.phase === "verify") suite.answer(suite.snapshot("special:scratchpad"));
          if (!control.busy) {
            suite.check(control.error !== "", "unacknowledged action times out without retry");
            console.info("SCRATCHPEEK_VISIBILITY_PASS"); stop(); Qt.quit();
          }
        }
      } catch (error) { console.error("SCRATCHPEEK_VISIBILITY_FAIL: " + error); stop(); Qt.quit(); }
    }
  }
}
