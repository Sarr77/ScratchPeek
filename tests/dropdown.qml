import QtQuick
import QtQuick.Window
import QtQuick.Controls as QQC
import QtTest
import Quickshell
import "ScratchPeek/vendor/omarchy" as Choice

// Real Qt pointer/key events on an offscreen window, not methods that bypass
// Popup's press-outside handling (the source of the reopening regression).
ShellRoot {
  id: testRoot
  property int step: 0
  property int selections: 0
  property string selected: ""
  property real uiScale: 1
  function check(value,message) { if (!value) throw new Error(message); }
  function clickTrigger() {
    check(events.mouseClick(picker,picker.width/2,picker.height/2,Qt.LeftButton,Qt.NoModifier,0),"trigger click sent");
  }
  TestEvent { id: events }
  Window {
    id: window
    visible: true; width: 840; height: 760
    Item {
      id: content
      x: 20; y: 20; width: 380; height: 700
      scale: testRoot.uiScale; transformOrigin: Item.TopLeft
      Binding { target: content.QQC.Overlay.overlay; property: "scale"; value: testRoot.uiScale; when: content.QQC.Overlay.overlay !== null }
      Binding { target: content.QQC.Overlay.overlay; property: "transformOrigin"; value: Item.TopLeft; when: content.QQC.Overlay.overlay !== null }
      Choice.SearchableDropdown {
        id: picker
        width: parent.width
        uiScale: testRoot.uiScale
        showLabel: false
        triggerLabel: "Add window to scratchpad…"
        placeholderText: "Search windows…"
        options: [{value:"one",label:"Alpha app",description:"Workspace 1"},
          {value:"two",label:"Beta app",description:"Workspace 2"}]
        onChanged: function(value) { testRoot.selections++; testRoot.selected=value; picker.value=""; }
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
          console.info("SCRATCHPEEK_DROPDOWN_PASS"); stop(); Qt.quit(); break;
        }
      } catch (error) { console.error("SCRATCHPEEK_DROPDOWN_FAIL: "+error); stop(); Qt.quit(); }
    }
  }
}
