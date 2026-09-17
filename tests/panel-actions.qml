import QtQuick
import QtQuick.Window
import QtQuick.Controls as QQC
import QtTest
import Quickshell
import qs.Ui as Ui
import "ScratchPeek" as Plugin
import "ScratchPeek/I18n.js" as I18n

// Native button input routing, including an ordinary click following Ctrl.
ShellRoot {
  id: testRoot
  property int step: 0
  property int normalClicks: 0
  property int quickMoves: 0
  property int hintClicks: 0
  property real uiScale: 1
  function check(value, message) { if (!value) throw new Error(message); }
  function click(item, modifiers) {
    check(events.mouseClick(item,item.width/2,item.height/2,Qt.LeftButton,modifiers,0), "click sent");
  }
  function visibleTip(item) {
    for (var i = 0; i < item.data.length; i++) {
      var child = item.data[i];
      if (child instanceof QQC.ToolTip && child.visible) return child;
    }
    return null;
  }
  TestEvent { id: events }
  QtObject {
    id: fakeShell
    property bool rejectSave: false
    property var saved: ({})
    function updateEntryInline(id, entry) {
      if (rejectSave) return false;
      saved = JSON.parse(JSON.stringify(entry));
      return true;
    }
  }
  Ui.PluginBarApi {
    id: fakeBar
    pluginId: "sarr.scratchpeek"; moduleName: pluginId
    shell: fakeShell
    // Deliberately stale facade snapshot, as in Omarchy's inline update path.
    layoutConfig: ({left:[{id:"sarr.scratchpeek",hintsMode:"on",hintsFirstSeenAt:Date.now(),language:"pl",accentColor:"#EF98F5"}],center:[],right:[]})
    _moduleWidgets: function() { return [widgetA, widgetB]; }
  }
  Plugin.Widget { id: widgetA; visible: false; bar: fakeBar }
  Plugin.Widget { id: widgetB; visible: false; bar: fakeBar }
  Window {
    id: window
    visible: true; width: 840; height: 500
    Item {
      id: content
      x: 20; y: 20; width: 380; height: 220
      scale: testRoot.uiScale; transformOrigin: Item.TopLeft
      Plugin.HintsToggle {
        id: hints
        x: 0; y: 160
        words: I18n.words("en")
        onClicked: { testRoot.hintClicks++; hintsEnabled = !hintsEnabled; automatic = false; }
      }
      Plugin.MoveOutButton {
        id: move
        width: 140; height: 36
        text: "Move out"; bordered: true
        tooltipText: hints.hintsEnabled ? I18n.words("en").quickExtractHint : ""
        onClicked: testRoot.normalClicks++
        onQuickMove: testRoot.quickMoves++
      }
    }
  }
  Timer {
    // Leave enough time for the real native tooltip's 400 ms delay.
    interval: 550; running: true; repeat: true
    onTriggered: {
      try {
        switch (testRoot.step++) {
        case 0:
          testRoot.check(hints.tooltipText.indexOf("7 days") >= 0, "trial explained");
          hints.daysLeft = 1;
          testRoot.check(hints.tooltipText.indexOf("1 day.") >= 0, "last day uses singular");
          hints.daysLeft = 6;
          testRoot.check(hints.tooltipText.indexOf("6 days") >= 0, "tooltip follows daily countdown");
          testRoot.click(move,Qt.NoModifier); break;
        case 1:
          testRoot.check(testRoot.normalClicks === 1 && testRoot.quickMoves === 0, "ordinary click opens picker only");
          testRoot.check(testRoot.visibleTip(move), "overlay does not block native hover");
          testRoot.click(move,Qt.ControlModifier); break;
        case 2:
          testRoot.check(testRoot.normalClicks === 1 && testRoot.quickMoves === 1, "Ctrl click moves exactly once without picker");
          testRoot.click(move,Qt.NoModifier); break;
        case 3:
          testRoot.check(testRoot.normalClicks === 2 && testRoot.quickMoves === 1, "ordinary click works after Ctrl");
          testRoot.click(hints,Qt.NoModifier); break;
        case 4:
          testRoot.check(!hints.hintsEnabled && !move.tooltipText, "turning hints off removes action hints");
          testRoot.check(testRoot.visibleTip(hints), "help icon still has a real visible tooltip when off");
          testRoot.check(hints.tooltipText === "Show panel hints on hover\nClick to turn on", "off state explains next click");
          testRoot.click(hints,Qt.NoModifier); break;
        case 5:
          testRoot.check(hints.hintsEnabled && !hints.automatic && testRoot.hintClicks === 2, "second click enables manual mode");
          testRoot.check(hints.tooltipText === "Show panel hints on hover\nClick to turn off", "on state explains next click");
          testRoot.uiScale = 2; break;
        case 6: testRoot.click(move,Qt.ControlModifier); break;
        case 7:
          testRoot.check(testRoot.quickMoves === 2 && testRoot.normalClicks === 2, "Ctrl click works at 200 percent");
          move.enabled = false;
          testRoot.click(move,Qt.ControlModifier); break;
        case 8:
          testRoot.check(testRoot.quickMoves === 2, "disabled busy button cannot move");
          move.enabled = true;
          move.focusable = true; move.forceActiveFocus();
          events.keyClick(Qt.Key_Return,Qt.NoModifier,0); break;
        case 9:
          testRoot.check(testRoot.normalClicks === 3 && testRoot.quickMoves === 2, "keyboard activation keeps destination picker");
          for (var i = 0; i < 4; i++) {
            var mode = i % 2 ? "on" : "off";
            testRoot.check(widgetA.setHintsMode(mode), "mode saved");
            testRoot.check(widgetA.hints.mode === mode && widgetB.hints.mode === mode, "rapid writes shared despite stale layout snapshot");
            testRoot.check(fakeShell.saved.hintsMode === mode, "latest choice reaches persistence");
          }
          testRoot.check(fakeShell.saved.language === "pl" && fakeShell.saved.accentColor === "#EF98F5", "unrelated settings preserved");
          fakeShell.rejectSave = true;
          testRoot.check(!widgetA.setHintsMode("off") && widgetA.hintsSaveFailed, "save failure reported");
          testRoot.check(widgetA.hints.mode === "on" && widgetB.hints.mode === "on", "failed save cannot change either monitor");
          console.info("SCRATCHPEEK_PANEL_ACTIONS_PASS"); stop(); Qt.quit(); break;
        }
      } catch (error) { console.error("SCRATCHPEEK_PANEL_ACTIONS_FAIL: " + error); stop(); Qt.quit(); }
    }
  }
}
