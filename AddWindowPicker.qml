import QtQuick
import "vendor/omarchy" as Choice

Choice.SearchableDropdown {
  id: root
  property var hostWidget: null
  property bool hintsAllowed: true
  property real hintWidth: width
  controlClickEnabled: true
  accessibleDescription: hostWidget ? hostWidget.words.quickAddHint : ""
  onControlClicked: if (hostWidget) hostWidget.addFocusedWindow()
  PanelHint {
    hostWidget: root.hostWidget
    requested: root.triggerHovered && root.hintsAllowed && root.enabled && !root.popupOpen
    text: root.triggerLabel + "\n" + root.accessibleDescription
    maximumWidth: root.hintWidth
  }
}
