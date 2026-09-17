import QtQuick
import QtQuick.Window
import QtQuick.Controls as QQC
import QtTest
import Quickshell
import "ScratchPeek/vendor/omarchy" as Choice
import "ScratchPeek" as Plugin
import "ScratchPeek/I18n.js" as I18n
import "ScratchPeek/Model.js" as Model

// Real Qt pointer/key events on an offscreen window, not methods that bypass
// Popup's press-outside handling (the source of the reopening regression).
ShellRoot {
  id: testRoot
  property int step: 0
  property int selections: 0
  property int quickAdds: 0
  property string selected: ""
  property real uiScale: 1
  function check(value,message) { if (!value) throw new Error(message); }
  function clickTrigger() {
    check(events.mouseClick(picker,picker.width/2,picker.height/2,Qt.LeftButton,Qt.NoModifier,0),"trigger click sent");
  }
  function controlClick() {
    events.mouseClick(picker,picker.width/2,picker.height/2,Qt.LeftButton,Qt.ControlModifier,0);
  }
  function hintVisible() {
    for (var i=0; i<picker.data.length; i++) {
      if (picker.data[i] instanceof QQC.ToolTip && picker.data[i].visible) return true;
    }
    return false;
  }
  TestEvent { id: events }
  QtObject {
    id: host
    property var words: I18n.words("en")
    property var settings: ({hintsMode:"auto",hintsUsed:0})
    readonly property var hints: Model.hintState(settings)
    function addFocusedWindow() { testRoot.quickAdds++; }
    function recordHintShown() {
      if (hints.mode==="auto" && hints.enabled) settings={hintsMode:"auto",hintsUsed:hints.used+1};
    }
  }
  Window {
    id: window
    visible: true; width: 840; height: 760
    Item {
      id: content
      x: 20; y: 20; width: 380; height: 700
      scale: testRoot.uiScale; transformOrigin: Item.TopLeft
      Binding { target: content.QQC.Overlay.overlay; property: "scale"; value: testRoot.uiScale; when: content.QQC.Overlay.overlay !== null }
      Binding { target: content.QQC.Overlay.overlay; property: "transformOrigin"; value: Item.TopLeft; when: content.QQC.Overlay.overlay !== null }
      Plugin.AddWindowPicker {
        id: picker
        hostWidget: host
        width: parent.width
        uiScale: testRoot.uiScale
        showLabel: false
        triggerLabel: "Add window to scratchpad…"
        placeholderText: "Search windows…"
        options: [{value:"one",label:"Alpha app",description:"Workspace 1"},
          {value:"two",label:"Beta app",description:"Workspace 2"}]
        onChanged: function(value) { testRoot.selections++; testRoot.selected=value; picker.value=""; }
      }
      Choice.SearchableDropdown {
        id: genericPicker
        width: parent.width; y: 100; showLabel: false
        options: ["English", "Polski"]
      }
    }
  }
  Timer {
    interval: 100; running: true; repeat: true
    onTriggered: {
      try {
        switch (testRoot.step++) {
        case 0: testRoot.clickTrigger(); break;
        case 1:
          testRoot.check(picker.popupOpen,"first click opens");
          testRoot.clickTrigger(); break;
        case 2:
          testRoot.check(!picker.popupOpen,"second click must close, not reopen");
          testRoot.clickTrigger(); break;
        case 3:
          testRoot.check(picker.popupOpen,"third click opens again");
          events.mouseClick(window.contentItem,810,720,Qt.LeftButton,Qt.NoModifier,0); break;
        case 4:
          testRoot.check(!picker.popupOpen,"outside click closes");
          testRoot.clickTrigger(); break;
        case 5:
          testRoot.check(picker.popupOpen,"open before Escape");
          events.keyClick(Qt.Key_Escape,Qt.NoModifier,0); break;
        case 6:
          testRoot.check(!picker.popupOpen,"Escape closes");
          testRoot.clickTrigger(); break;
        case 7: events.keyClick(Qt.Key_B,Qt.NoModifier,0); break;
        case 8:
          testRoot.check(picker.filtered.length===1 && picker.filtered[0].value==="two","typing filters options");
          events.keyClick(Qt.Key_Return,Qt.NoModifier,0); break;
        case 9:
          testRoot.check(!picker.popupOpen && testRoot.selections===1 && testRoot.selected==="two","Enter selects exactly once and closes");
          testRoot.uiScale=2;
          content.y=680; break;
        case 10: testRoot.clickTrigger(); break;
        case 11:
          testRoot.check(picker.popupOpen && picker.placement.y<0,"scaled menu opens above its trigger near window bottom");
          testRoot.check(picker.filtered.length===2,"search resets after selection");
          testRoot.clickTrigger(); break;
        case 12:
          testRoot.check(!picker.popupOpen,"200% trigger click also closes");
          testRoot.check(testRoot.selections===1,"opening and closing never selects a window");
          testRoot.controlClick(); break;
        case 13:
          testRoot.check(testRoot.quickAdds===1 && !picker.popupOpen,"Ctrl click at 200% quick-adds exactly once without the list");
          picker.enabled=false; testRoot.controlClick(); break;
        case 14:
          testRoot.check(testRoot.quickAdds===1,"disabled busy picker cannot add");
          picker.enabled=true; testRoot.uiScale=1; content.y=20;
          testRoot.clickTrigger(); break;
        case 15:
          testRoot.check(picker.popupOpen,"normal click after Ctrl still opens");
          testRoot.controlClick(); break;
        case 16:
          testRoot.check(testRoot.quickAdds===2 && !picker.popupOpen,"Ctrl click on an open trigger adds once and closes");
          events.mouseClick(genericPicker,genericPicker.width/2,genericPicker.height/2,Qt.LeftButton,Qt.ControlModifier,0); break;
        case 17:
          testRoot.check(genericPicker.popupOpen && testRoot.quickAdds===2,"unrelated dropdown retains ordinary Ctrl-click behavior");
          genericPicker.close(); interval=550;
          events.mouseMove(picker,picker.width/2,picker.height/2,0,Qt.NoButton,Qt.NoModifier); break;
        case 18:
          testRoot.check(testRoot.hintVisible() && host.hints.used===1,"new hint appears and consumes one shared hint view");
          host.settings={hintsMode:"off",hintsUsed:1}; break;
        case 19:
          testRoot.check(!testRoot.hintVisible() && host.hints.used===1,"new hint obeys the global off setting");
          host.settings={hintsMode:"auto",hintsUsed:100};
          events.mouseMove(window.contentItem,810,720,0,Qt.NoButton,Qt.NoModifier); break;
        case 20:
          events.mouseMove(picker,picker.width/2,picker.height/2,0,Qt.NoButton,Qt.NoModifier); break;
        case 21:
          testRoot.check(!testRoot.hintVisible() && host.hints.used===100,"new hint obeys the exhausted automatic budget");
          testRoot.check(testRoot.quickAdds===2 && testRoot.selections===1,"hover hints do not transfer windows");
          console.info("SCRATCHPEEK_DROPDOWN_PASS"); stop(); Qt.quit(); break;
        }
      } catch (error) { console.error("SCRATCHPEEK_DROPDOWN_FAIL: "+error); stop(); Qt.quit(); }
    }
  }
}
