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
  function findControl(item, name) {
    if (item.objectName === name) return item;
    for (var i = 0; i < item.children.length; i++) {
      var found = findControl(item.children[i], name);
      if (found) return found;
    }
    return null;
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
      Plugin.UpdateSwitch {
        id: updatesControl
        x: 220; y: 160
        text: I18n.words("en").autoUpdates
        checked: widgetA.autoUpdates
        onClicked: {
          if (widgetA.autoUpdates) confirmation.open();
          else widgetA.toggleUpdates();
        }
      }
    }
    Plugin.UpdateConfirmation {
      id: confirmation
      width: window.width / testRoot.uiScale
      height: window.height / testRoot.uiScale
      scale: testRoot.uiScale
      transformOrigin: Item.TopLeft
      words: I18n.words("en")
      onCanceled: updatesControl.forceActiveFocus()
      onConfirmed: {
        if (widgetA.autoUpdates) widgetA.toggleUpdates();
        updatesControl.forceActiveFocus();
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
            testRoot.check(barTip.footerText === widgetA.words.clickHelpDetailed, "bar footer names the scratchpad regardless of hint mode");
            testRoot.check(fakeShell.saved.hintsMode === mode, "latest choice reaches persistence");
          }
          testRoot.check(fakeShell.saved.language === "pl" && fakeShell.saved.accentColor === "#EF98F5", "unrelated settings preserved");
          widgetA.toggleUpdates();
          testRoot.check(!widgetA.autoUpdates && !widgetB.autoUpdates && fakeShell.saved.autoUpdates === false, "updates can be disabled on both monitors");
          widgetB.toggleUpdates();
          testRoot.check(widgetA.autoUpdates && widgetB.autoUpdates && fakeShell.saved.autoUpdates === true, "updates can be enabled again");
          fakeShell.rejectSave = true;
          testRoot.check(widgetA.setHintsMode("off") && !widgetA.hintsSaveFailed, "durable save succeeds without the optional host mirror");
          testRoot.check(widgetA.hints.mode === "off" && widgetB.hints.mode === "off", "both monitors follow the durable choice");
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
          var updater = Plugin.ScratchState.updates;
          var launches = 0, startupLaunches = 0;
          var now = new Date(2026, 8, 20, 23, 30).getTime() / 1000;
          testRoot.check(updater.lastCheck === 1000 && updater.nextCheck === 22600, "saved daily deadline becomes six hours after the last check");
          updater.launch = function(startup) { launches++; if (startup) startupLaunches++; };
          updater.runtimeAvailable = true;
          updater.check([widgetA,widgetB], now);
          updater.check([widgetA,widgetB], now);
          testRoot.check(launches === 1 && startupLaunches === 1, "two monitor requests start only one startup worker");
          updater.lastCheck = now;
          updater.nextCheck = now + 6 * 3600;
          updater.lastLaunch = 0;
          updater.startupPending = true;
          updater.check([widgetA,widgetB], now + 60);
          testRoot.check(launches === 1, "same-day restart keeps the six-hour deadline");
          var midnight = new Date(2026, 8, 21, 0, 30).getTime() / 1000;
          updater.check([widgetA,widgetB], midnight);
          testRoot.check(launches === 1, "staying logged in past midnight does not add a check");
          updater.startupPending = true;
          updater.check([{opened:true}], midnight);
          testRoot.check(launches === 1 && updater.startupPending, "open panel postpones the startup check");
          updater.check([widgetA,widgetB], midnight);
          testRoot.check(launches === 2 && startupLaunches === 2, "first start on a new local day checks before six hours have passed");
          updater.lastCheck = midnight;
          updater.nextCheck = midnight + 6 * 3600;
          updater.lastLaunch = 0;
          updater.startupPending = true;
          updater.check([widgetA,widgetB], midnight + 60);
          updater.check([widgetA,widgetB], midnight + 6 * 3600 - 1);
          testRoot.check(launches === 2, "another restart and checks before the deadline do not repeat the request");
          var due = midnight + 6 * 3600;
          updater.check([{opened:true}], due);
          updater.check([{transferBusy:true}], due);
          updater.check([{visibilityBusy:true}], due);
          testRoot.check(launches === 2, "open panels, transfers and visibility changes postpone updates");
          widgetA.toggleUpdates();
          updater.check([widgetA,widgetB], due);
          testRoot.check(launches === 2 && !updater.enabled, "saved switch disables scheduling");
          widgetA.toggleUpdates();
          updater.check([widgetA,widgetB], due);
          updater.check([widgetA,widgetB], due);
          testRoot.check(launches === 3 && startupLaunches === 2, "six hours starts one regular check when enabled");
          testRoot.check(I18n.words("en").autoUpdatesHint === "Check every 6 hours to install stable releases", "hover explains the six-hour interval without a final period");
          testRoot.check(confirmation.words.updatesOffQuestion === "Disable automatic updates?", "title uses disable");
          testRoot.check(confirmation.words.updatesOffWarning === "Don't turn them off if you prefer a stable experience and improvements.", "warning uses the requested wording");
          testRoot.check(confirmation.words.turnOffUpdates === "I confirm, disable updates", "button makes confirmation explicit");
          testRoot.click(updatesControl,Qt.NoModifier); break;
        case 21:
          testRoot.check(confirmation.opened && widgetA.autoUpdates && widgetB.autoUpdates, "opening confirmation never disables updates");
          var confirmButton = testRoot.findControl(confirmation,"confirmUpdateOff");
          testRoot.check(confirmButton.width >= confirmButton.implicitWidth, "complete confirmation label fits the button at 200 percent");
          if (Quickshell.env("SCRATCHPEEK_UPDATE_CONFIRMATION_IMAGE"))
            confirmation.grabToImage(function(result) { result.saveToFile(Quickshell.env("SCRATCHPEEK_UPDATE_CONFIRMATION_IMAGE")); });
          events.keyClick(Qt.Key_Escape,Qt.NoModifier,0);
          testRoot.check(!confirmation.opened && widgetA.autoUpdates, "Escape cancels without saving an off value");
          updatesControl.forceActiveFocus(); events.keyClick(Qt.Key_Return,Qt.NoModifier,0); break;
        case 22:
          testRoot.check(confirmation.opened && widgetA.autoUpdates, "keyboard also requires confirmation");
          events.keyClick(Qt.Key_Return,Qt.NoModifier,0);
          testRoot.check(!confirmation.opened && widgetA.autoUpdates, "default Enter cancels rather than turning off");
          testRoot.click(updatesControl,Qt.NoModifier); break;
        case 23:
          events.keyClick(Qt.Key_Tab,Qt.NoModifier,0);
          events.keyClick(Qt.Key_Return,Qt.NoModifier,0);
          testRoot.check(!confirmation.opened && !widgetA.autoUpdates && !widgetB.autoUpdates && fakeShell.saved.autoUpdates === false, "explicit keyboard confirmation saves off on both monitors at 200 percent");
          testRoot.click(updatesControl,Qt.NoModifier);
          testRoot.check(widgetA.autoUpdates && !confirmation.opened, "enabling needs only one click");
          testRoot.uiScale = 1;
          testRoot.click(updatesControl,Qt.NoModifier); break;
        case 24:
          testRoot.click(testRoot.findControl(confirmation,"cancelUpdateOff"),Qt.NoModifier);
          testRoot.check(!confirmation.opened && widgetA.autoUpdates, "Cancel button preserves on");
          testRoot.click(updatesControl,Qt.NoModifier); break;
        case 25:
          testRoot.click(testRoot.findControl(confirmation,"confirmUpdateOff"),Qt.NoModifier);
          testRoot.check(!confirmation.opened && !widgetA.autoUpdates && fakeShell.saved.autoUpdates === false, "Turn off button confirms with the mouse");
          testRoot.click(updatesControl,Qt.NoModifier);
          fakeShell.rejectSave = true;
          testRoot.click(updatesControl,Qt.NoModifier); break;
        case 26:
          testRoot.click(testRoot.findControl(confirmation,"confirmUpdateOff"),Qt.NoModifier);
          testRoot.check(!widgetA.autoUpdates && !widgetA.updatesSaveFailed && Plugin.ScratchState.preferences.values.autoUpdates === false,
            "disabled updates stay saved when the host mirror rejects the write");
          fakeShell.rejectSave = false;
          console.info("SCRATCHPEEK_PANEL_ACTIONS_PASS"); stop(); Qt.quit(); break;
        }
      } catch (error) { console.error("SCRATCHPEEK_PANEL_ACTIONS_FAIL: " + error); stop(); Qt.quit(); }
    }
  }
}
