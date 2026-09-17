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
  property bool budgetPhase: false
  function check(value, message) { if (!value) throw new Error(message); }
  function click(item, modifiers) {
    events.mouseMove(item,item.width/2,item.height/2,0,Qt.NoButton,modifiers);
    check(events.mouseClick(item,item.width/2,item.height/2,Qt.LeftButton,modifiers,0), "click sent");
  }
  function hover(item) { events.mouseMove(item,item.width/2,item.height/2,0,Qt.NoButton,Qt.NoModifier); }
  function leave() { events.mouseMove(window.contentItem,810,470,0,Qt.NoButton,Qt.NoModifier); }
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
    layoutConfig: ({left:[{id:"sarr.scratchpeek",hintsMode:"on",hintsUsed:0,language:"pl",accentColor:"#EF98F5"}],center:[],right:[]})
    _moduleWidgets: function() { return [widgetA, widgetB]; }
  }
  Plugin.Widget { id: widgetA; visible: false; bar: fakeBar }
  Plugin.Widget { id: widgetB; visible: false; bar: fakeBar }
  Plugin.TooltipContent { id: barTip; hostWidget: widgetA; visible: false }
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
        onClicked: {
          testRoot.hintClicks++;
          if (testRoot.budgetPhase) widgetA.toggleHints();
          else { hintsEnabled = !hintsEnabled; automatic = false; }
        }
      }
      Plugin.MoveOutButton {
        id: move
        width: 140; height: 36
        text: "Move out"; bordered: true
        hostWidget: widgetA
        hintsAllowed: testRoot.budgetPhase || hints.hintsEnabled
        hintText: I18n.words("en").quickExtractHint
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
          testRoot.check(hints.helpText.indexOf("100 more hovers") >= 0, "budget explained");
          hints.remaining = 1;
          testRoot.check(hints.helpText.indexOf("1 more hover.") >= 0, "last view uses singular");
          hints.remaining = 99;
          testRoot.check(hints.helpText.indexOf("99 more hovers") >= 0, "tooltip follows remaining count");
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
          testRoot.check(!hints.hintsEnabled && !testRoot.visibleTip(move), "turning hints off removes action hints");
          testRoot.check(testRoot.visibleTip(hints), "help icon still has a real visible tooltip when off");
          testRoot.check(hints.helpText === "Show panel hints on hover\nClick to turn on", "off state explains next click");
          testRoot.click(hints,Qt.NoModifier); break;
        case 5:
          testRoot.check(hints.hintsEnabled && !hints.automatic && testRoot.hintClicks === 2, "second click enables manual mode");
          testRoot.check(hints.helpText === "Show panel hints on hover\nClick to turn off", "on state explains next click");
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
            testRoot.check(barTip.footerText === widgetA.words[mode === "on" ? "clickHelpDetailed" : "clickHelp"], "bar footer follows hint setting immediately");
            testRoot.check(fakeShell.saved.hintsMode === mode, "latest choice reaches persistence");
          }
          testRoot.check(fakeShell.saved.language === "pl" && fakeShell.saved.accentColor === "#EF98F5", "unrelated settings preserved");
          fakeShell.rejectSave = true;
          testRoot.check(!widgetA.setHintsMode("off") && widgetA.hintsSaveFailed, "save failure reported");
          testRoot.check(widgetA.hints.mode === "on" && widgetB.hints.mode === "on", "failed save cannot change either monitor");
          fakeShell.rejectSave = false;
          widgetA.persistSettings({hintsMode:"auto",hintsUsed:98});
          testRoot.budgetPhase = true;
          hints.hintsEnabled = Qt.binding(function() { return widgetA.hints.enabled; });
          hints.automatic = Qt.binding(function() { return widgetA.hints.mode === "auto"; });
          hints.remaining = Qt.binding(function() { return widgetA.hints.remaining; });
          testRoot.leave(); break;
        case 10:
          testRoot.hover(move); testRoot.leave(); break;
        case 11:
          testRoot.check(widgetA.hints.remaining === 2, "passing over before delay consumes nothing");
          testRoot.hover(move); break;
        case 12:
          testRoot.check(widgetA.hints.remaining === 1 && widgetB.hints.remaining === 1, "shown hint consumes once on both monitors");
          testRoot.check(fakeShell.saved.hintsUsed === 99, "hover progress persisted"); break;
        case 13:
          testRoot.check(widgetA.hints.remaining === 1, "staying over hint consumes only once");
          testRoot.leave(); break;
        case 14: testRoot.hover(move); break;
        case 15:
          testRoot.check(widgetA.hints.remaining === 0 && !widgetA.hints.enabled, "100th view exhausts automatic budget");
          testRoot.check(testRoot.visibleTip(move), "100th hint remains readable");
          testRoot.leave(); break;
        case 16: testRoot.hover(move); break;
        case 17:
          testRoot.check(!testRoot.visibleTip(move) && widgetA.hints.used === 100, "101st hover cannot open an automatic hint");
          testRoot.hover(hints); break;
        case 18:
          testRoot.check(testRoot.visibleTip(hints) && widgetA.hints.used === 100, "help icon always available without consuming budget");
          testRoot.click(hints,Qt.NoModifier); break;
        case 19:
          testRoot.check(widgetA.hints.mode === "on" && widgetB.hints.enabled, "manual enable works after budget is exhausted");
          testRoot.hover(move); break;
        case 20:
          testRoot.check(testRoot.visibleTip(move) && widgetA.hints.used === 100, "manual hints show without a budget");
          console.info("SCRATCHPEEK_PANEL_ACTIONS_PASS"); stop(); Qt.quit(); break;
        }
      } catch (error) { console.error("SCRATCHPEEK_PANEL_ACTIONS_FAIL: " + error); stop(); Qt.quit(); }
    }
  }
}
