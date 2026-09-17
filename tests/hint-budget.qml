import QtQuick
import QtQuick.Window
import QtQuick.Controls as QQC
import QtTest
import Quickshell
import qs.Ui as Ui
import "ScratchPeek" as Plugin
import "ScratchPeek/I18n.js" as I18n

ShellRoot {
  id: test
  property string scenario: Quickshell.env("SCRATCHPEEK_HINT_CASE")
  property int phase: 0
  property int expected: scenario === "first" ? 0 : (scenario === "second" ? 50 : 100)
  property int target: scenario === "first" ? 50 : 100
  property double deadline: Date.now() + 10000
  property var currentButton: null
  function check(value, message) { if (!value) throw new Error(message); }
  function hover(item) { events.mouseMove(item,item.width/2,item.height/2,0,Qt.NoButton,Qt.NoModifier); }
  function leave() { events.mouseMove(window.contentItem,410,230,0,Qt.NoButton,Qt.NoModifier); }
  function click(item) { hover(item); events.mouseClick(item,item.width/2,item.height/2,Qt.LeftButton,Qt.NoModifier,0); }
  function tip(item) { return item.data.filter(function(child) { return child instanceof QQC.ToolTip && child.visible; })[0]; }
  function finish() { console.info("SCRATCHPEEK_HINT_BUDGET_PASS " + scenario); timer.stop(); Qt.quit(); }
  TestEvent { id: events }
  QtObject {
    id: shell
    property var saved: ({})
    function updateEntryInline(id, entry) { saved = JSON.parse(JSON.stringify(entry)); return true; }
  }
  Ui.PluginBarApi {
    id: bar
    pluginId: "sarr.scratchpeek"; moduleName: pluginId; shell: shell
    layoutConfig: ({left:[{id:"sarr.scratchpeek",hintsMode:"auto",hintsUsed:0}],center:[],right:[]})
    _moduleWidgets: function() { return [widgetA,widgetB]; }
  }
  Plugin.Widget { id: widgetA; visible: false; bar: bar }
  Plugin.Widget { id: widgetB; visible: false; bar: bar }
  Window {
    id: window
    visible: true; width: 440; height: 260
    Plugin.MoveOutButton {
      id: buttonA; x: 20; y: 20; width: 160; height: 36
      text: "Move out"; hostWidget: widgetA; hintText: "First monitor hint"
    }
    Plugin.HintButton {
      id: buttonB; x: 240; y: 20; width: 160; height: 36
      text: "Hide"; hostWidget: widgetB; hintText: "Second monitor hint"
    }
    Plugin.HintsToggle {
      id: help; x: 20; y: 200; words: I18n.words("en")
      hintsEnabled: widgetA.hints.enabled; automatic: widgetA.hints.mode === "auto"; remaining: widgetA.hints.remaining
      onClicked: widgetA.toggleHints()
    }
  }
  Timer {
    id: timer
    interval: 25; repeat: true; running: true
    onTriggered: {
      try {
        if (test.phase === 0) {
          if (!widgetA.settingsReady || !widgetB.settingsReady) {
            test.check(Date.now() < test.deadline,"settings initialize"); return;
          }
          test.check(widgetA.hints.used === test.expected && widgetB.hints.used === test.expected,"cold start restores exact count");
          test.leave();
          test.phase = test.scenario === "exhausted" ? 4 : 1;
        } else if (test.phase === 1) {
          test.currentButton = test.expected % 2 ? buttonB : buttonA;
          test.hover(test.currentButton); test.deadline = Date.now() + 2000; test.phase = 2;
        } else if (test.phase === 2) {
          if (widgetA.hints.used === test.expected) { test.check(Date.now() < test.deadline,"displayed hint is counted"); return; }
          test.expected++;
          test.check(widgetA.hints.used === test.expected && widgetB.hints.used === test.expected,"one display increments both monitors exactly once");
          test.check(shell.saved.hintsUsed === test.expected && !widgetA.preferencesSaveFailed,"every increment is saved");
          test.check(!!test.tip(test.currentButton),"last allowed hint remains readable");
          test.leave(); test.phase = 3;
        } else if (test.phase === 3) {
          test.check(!test.tip(test.currentButton),"pointer leave closes the hint");
          if (test.expected === test.target) test.finish(); else test.phase = 1;
        } else if (test.phase === 4) {
          test.check(!widgetA.hints.enabled && !widgetB.hints.enabled,"exhausted count stays disabled after restart");
          test.hover(buttonA); test.deadline = Date.now() + 550; test.phase = 5;
        } else if (test.phase === 5 && Date.now() >= test.deadline) {
          test.check(!test.tip(buttonA) && widgetA.hints.used === 100,"101st hover cannot show or consume a hint");
          test.hover(help); test.deadline = Date.now() + 550; test.phase = 6;
        } else if (test.phase === 6 && Date.now() >= test.deadline) {
          test.check(!!test.tip(help) && widgetA.hints.used === 100,"help remains available without using the budget");
          test.click(help);
          test.check(widgetA.hints.mode === "on" && widgetB.hints.enabled,"explicit click enables unlimited manual hints");
          test.hover(buttonB); test.deadline = Date.now() + 550; test.phase = 7;
        } else if (test.phase === 7 && Date.now() >= test.deadline) {
          test.check(!!test.tip(buttonB) && widgetA.hints.used === 100,"manual mode leaves the automatic count unchanged");
          test.click(help);
          test.check(!widgetA.hints.enabled && !widgetB.hints.enabled,"manual off applies to both monitors");
          test.finish();
        }
      } catch (error) { console.error("SCRATCHPEEK_HINT_BUDGET_FAIL: " + error); stop(); Qt.quit(); }
    }
  }
}
