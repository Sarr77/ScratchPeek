import QtQuick
import Quickshell
import qs.Commons

Text {
  id: root
  required property string version
  property color foreground: Color.popups.text
  property color accent: Color.accent
  property bool hasCursor: false
  readonly property bool hot: pointer.containsMouse || hasCursor || activeFocus
  signal hovered(bool value)
  text: version ? "v" + version : ""
  textFormat: Text.PlainText
  color: hot || copied.running ? accent : Qt.alpha(foreground, 0.65)
  font.pixelSize: Style.font.caption
  font.underline: hot
  activeFocusOnTab: !!version
  Accessible.role: Accessible.Button
  Accessible.name: "ScratchPeek " + version
  Accessible.onPressAction: copy()
  function copy() {
    if (!version) return;
    Quickshell.clipboardText = version;
    copied.restart();
  }
  Keys.onReturnPressed: copy()
  Keys.onEnterPressed: copy()
  Keys.onSpacePressed: copy()
  Timer { id: copied; interval: 900 }
  MouseArea {
    id: pointer
    anchors.fill: parent
    hoverEnabled: true
    cursorShape: Qt.PointingHandCursor
    onContainsMouseChanged: root.hovered(containsMouse)
    onClicked: root.copy()
  }
}
