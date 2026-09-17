import QtQuick
import qs.Commons

Item {
  id: root
  required property string text
  property color foreground: Color.popups.text
  property color accent: Color.accent
  property bool hasCursor: false
  property real hintWidth: 400
  // Replace this address when Sarr's portfolio is ready.
  readonly property url destination: "https://github.com/Sarr77"
  property var openUrl: function(url) { Qt.openUrlExternally(url); }
  signal hovered(bool value)
  function activate() { if (enabled) openUrl(destination); }
  implicitWidth: label.implicitWidth
  implicitHeight: Math.max(Style.space(24), label.implicitHeight)
  activeFocusOnTab: true
  Accessible.role: Accessible.Link
  Accessible.name: text
  Accessible.description: String(destination)
  Accessible.onPressAction: activate()
  Keys.onReturnPressed: activate()
  Keys.onEnterPressed: activate()
  Keys.onSpacePressed: activate()
  Text {
    id: label
    anchors.centerIn: parent
    text: root.text
    textFormat: Text.PlainText
    color: mouse.containsMouse || root.hasCursor || root.activeFocus ? root.accent : Qt.alpha(root.foreground, 0.65)
    font.pixelSize: Style.font.caption
    font.underline: mouse.containsMouse || root.hasCursor || root.activeFocus
  }
  MouseArea {
    id: mouse
    anchors.fill: parent
    hoverEnabled: true
    cursorShape: Qt.PointingHandCursor
    onContainsMouseChanged: root.hovered(containsMouse)
    onClicked: root.activate()
  }
  PanelHint {
    hostWidget: null
    alwaysAvailable: true
    requested: mouse.containsMouse
    text: String(root.destination)
    maximumWidth: root.hintWidth
  }
}
