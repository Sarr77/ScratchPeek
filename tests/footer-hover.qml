import QtQuick
import QtQuick.Window
import QtTest
import Quickshell
import "ScratchPeek" as Plugin
import "ScratchPeek/I18n.js" as I18n

ShellRoot {
  id: test
  property int step: 0
  property int activations: 0
  property real uiScale: 1
  function check(value, message) { if (!value) throw new Error(message); }
  function point(item, x, y) { events.mouseMove(item,x,y,0,Qt.NoButton,Qt.NoModifier); }
  function hover(item) { point(item,item.width/2,item.height/2); }
  function gap() { point(footer,50,footer.height/2); }
  TestEvent { id: events }
  Plugin.PanelSelection { id: selection }
  Window {
    id: window
    visible: true; width: 840; height: 300
    Item {
      id: footer
      x: 20; y: 100; width: 380; height: 30
      scale: test.uiScale; transformOrigin: Item.TopLeft
      focus: true
      Keys.onTabPressed: selection.move(1,1)
      Keys.onReturnPressed: if (selection.index === 0) hints.clicked(); else if (selection.index === 1) updates.activate()
      Plugin.HintsToggle {
        id: hints
        words: I18n.words("en")
        hasCursor: selection.index === 0
        onHovered: function(value) { selection.hover(0,value); }
        onClicked: test.activations++
      }
      Plugin.UpdateSwitch {
        id: updates
        x: 60
        text: I18n.words("en").autoUpdates
        hasCursor: selection.index === 1
        onHovered: function(value) { selection.hover(1,value); }
        onClicked: { checked = !checked; test.activations++; }
      }
      Plugin.AuthorCredit {
        id: author
        anchors.right: parent.right
        text: I18n.words("en").author
      }
      Plugin.VersionLabel {
        id: version
        anchors.right: author.left
        anchors.rightMargin: 10
        version: Plugin.ScratchState.version
      }
    }
  }
  Timer {
    interval: 160; running: true; repeat: true
    onTriggered: {
      try {
        switch (test.step++) {
        case 0: test.hover(hints); break;
        case 1:
          test.check(hints.hot,"help highlights under pointer");
          test.gap(); break;
        case 2:
          test.check(!hints.hot && !hints.hasCursor,"help highlight clears in the same footer row");
          test.hover(author); break;
        case 3:
          test.check(!author.font.underline && !author.activeFocusOnTab,"author remains plain text under pointer");
          events.mouseClick(author,author.width/2,author.height/2,Qt.LeftButton,Qt.NoModifier,0);
          test.gap(); break;
        case 4:
          test.check(!author.font.underline,"author remains plain text after leaving");
          test.check(test.activations === 0,"hover never activates a control");
          footer.forceActiveFocus(); events.keyClick(Qt.Key_Tab,Qt.NoModifier,0); break;
        case 5:
          test.check(hints.hasCursor,"keyboard navigation visibly selects help");
          events.keyClick(Qt.Key_Return,Qt.NoModifier,0);
          test.check(test.activations === 1,"keyboard help activates once");
          events.keyClick(Qt.Key_Tab,Qt.NoModifier,0); break;
        case 6:
          test.check(updates.hasCursor && !author.activeFocus,"keyboard reaches updates and skips the plain author credit");
          events.keyClick(Qt.Key_Return,Qt.NoModifier,0);
          test.check(test.activations === 2 && !updates.checked,"keyboard toggles updates once");
          selection.hover(0,false);
          test.check(updates.hasCursor,"pointer leave preserves keyboard selection");
          test.hover(updates); test.gap(); break;
        case 7:
          test.check(!updates.hasCursor && !updates.hot,"pointer takes over from keyboard without sticky highlight");
          test.uiScale = 2; test.hover(hints); break;
        case 8: test.gap(); break;
        case 9:
          test.check(!hints.hot,"help clears at 200 percent scale");
          test.hover(updates); break;
        case 10: test.gap(); break;
        case 11:
          test.check(!updates.hasCursor && !updates.hot,"update switch clears at 200 percent scale");
          test.hover(author); break;
        case 12:
          test.check(!author.font.underline && !author.activeFocus,"author remains plain text at 200 percent scale");
          test.check(version.version === Quickshell.env("SCRATCHPEEK_EXPECTED_VERSION"),"version comes from the installed manifest");
          footer.forceActiveFocus();
          Quickshell.clipboardText = "before";
          test.hover(version);
          events.mouseClick(version,version.width/2,version.height/2,Qt.LeftButton,Qt.NoModifier,0);
          test.check(Quickshell.clipboardText === version.version,"click copies only the version number");
          test.gap(); break;
        case 13:
          test.check(!version.hot,"version hover clears inside the footer");
          version.forceActiveFocus();
          Quickshell.clipboardText = "before";
          events.keyClick(Qt.Key_Space,Qt.NoModifier,0);
          test.check(Quickshell.clipboardText === version.version,"Space copies the version");
          Quickshell.clipboardText = "before";
          events.keyClick(Qt.Key_Return,Qt.NoModifier,0);
          test.check(Quickshell.clipboardText === version.version,"Enter copies the version");
          console.info("SCRATCHPEEK_FOOTER_HOVER_PASS"); stop(); Qt.quit();
        }
      } catch (error) { console.error("SCRATCHPEEK_FOOTER_HOVER_FAIL: " + error); stop(); Qt.quit(); }
    }
  }
}
