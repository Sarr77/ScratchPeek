import QtQuick
import Quickshell
import "ScratchPeek" as Plugin

ShellRoot {
  id: suite
  Plugin.Preferences { id: preferences }
  property string scenario: Quickshell.env("SCRATCHPEEK_PREFERENCES_CASE")
  function check(value, message) { if (!value) throw new Error(message); }
  Timer {
    interval:50; running:true; repeat:true
    onTriggered: {
      if (!preferences.ready) return;
      try {
        if (suite.scenario === "corrupt") {
          suite.check(preferences.failed && preferences.readBlocked, "bad JSON reported");
          suite.check(!preferences.save({language:"pl"}), "bad file cannot be silently overwritten");
        } else if (suite.scenario === "readonly") {
          suite.check(!preferences.failed && preferences.values.language === "pl", "readable file loaded");
          suite.check(!preferences.save({language:"fr"}) && preferences.failed, "failed write is reported");
          suite.check(preferences.values.language === "pl", "failed write preserves last known data");
        } else if (suite.scenario === "restore") {
          suite.check(!preferences.failed && preferences.values.language === "pl" && preferences.values.hintsUsed === 99,
            "next process loads the last completed write");
          suite.check(preferences.values.customLabels.active === "My shelf", "custom labels restored");
        } else {
          suite.check(!preferences.failed, "first start without file works");
          suite.check(preferences.save({id:"sarr.scratchpeek",language:"de",hintsUsed:98}), "first save");
          suite.check(preferences.save({id:"sarr.scratchpeek",language:"pl",hintsUsed:99,customLabels:{active:"My shelf"}}), "rapid second save");
        }
        console.info("SCRATCHPEEK_PREFERENCES_PASS"); stop(); Qt.quit();
      } catch (error) { console.error("SCRATCHPEEK_PREFERENCES_FAIL: " + error); stop(); Qt.quit(); }
    }
  }
}
