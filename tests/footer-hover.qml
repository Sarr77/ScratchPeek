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
  function gap() { point(footer,footer.width/2,footer.height/2); }
  function label(item) {
    return item.children.filter(function(child) { return child instanceof Text; })[0];
  }
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
      Keys.onReturnPressed: if (selection.index === 0) hints.clicked(); else if (selection.index === 1) author.activate()
      Plugin.HintsToggle {
        id: hints
        words: I18n.words("en")
        hasCursor: selection.index === 0
        onHovered: function(value) { selection.hover(0,value); }
        onClicked: test.activations++
      }
      Plugin.AuthorLink {
        id: author
        anchors.right: parent.right
        text: "By Sarr"
        hasCursor: selection.index === 1
        onHovered: function(value) { selection.hover(1,value); }
        openUrl: function(url) { test.activations++; }
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
          test.check(test.label(author).font.underline,"author highlights under pointer");
          test.gap(); break;
        case 4:
          test.check(!test.label(author).font.underline && !author.hasCursor,"author highlight clears in the same footer row");
          test.check(test.activations === 0,"hover never activates a control");
          footer.forceActiveFocus(); events.keyClick(Qt.Key_Tab,Qt.NoModifier,0); break;
        case 5:
          test.check(hints.hasCursor,"keyboard navigation visibly selects help");
          events.keyClick(Qt.Key_Return,Qt.NoModifier,0);
          test.check(test.activations === 1,"keyboard help activates once");
          events.keyClick(Qt.Key_Tab,Qt.NoModifier,0); break;
        case 6:
          test.check(author.hasCursor && test.label(author).font.underline,"keyboard navigation visibly selects author");
          selection.hover(0,false);
          test.check(author.hasCursor,"late pointer leave cannot clear another keyboard target");
          test.hover(author); test.gap(); break;
        case 7:
          test.check(!author.hasCursor && !test.label(author).font.underline,"pointer takes over from keyboard without sticky highlight");
          test.uiScale = 2; test.hover(hints); break;
        case 8: test.gap(); break;
        case 9:
          test.check(!hints.hot,"help clears at 200 percent scale");
          test.hover(author); break;
        case 10: test.gap(); break;
        case 11:
          test.check(!author.hasCursor && !test.label(author).font.underline,"author clears at 200 percent scale");
          console.info("SCRATCHPEEK_FOOTER_HOVER_PASS"); stop(); Qt.quit();
        }
      } catch (error) { console.error("SCRATCHPEEK_FOOTER_HOVER_FAIL: " + error); stop(); Qt.quit(); }
    }
  }
}
