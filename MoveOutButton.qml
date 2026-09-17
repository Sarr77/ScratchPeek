import QtQuick
import qs.Ui as Ui

Ui.Button {
  id: root
  signal quickMove()
  // Ui.Button's clicked() has no event argument. Intercept only Ctrl presses;
  // ordinary presses keep the native button's hover, click and focus behavior.
  MouseArea {
    anchors.fill: parent
    acceptedButtons: Qt.LeftButton
    cursorShape: Qt.PointingHandCursor
    onPressed: function(mouse) { if (!(mouse.modifiers & Qt.ControlModifier)) mouse.accepted = false; }
    onClicked: function(mouse) {
      if (mouse.modifiers & Qt.ControlModifier) root.quickMove();
      else root.clicked();
    }
  }
}
