import QtQuick

// Offscreen substitute for the host's layer-shell window. Content stays real.
Item {
  property Item anchorItem: null
  property QtObject bar: null
  property var owner: null
  property Item focusTarget: null
  property bool open: false
  property real padding: 0
  property real contentWidth: 420
  property real contentHeight: 900
  property var borderSpec: null
  readonly property real availableCardHeight: 1000
  width: contentWidth
  height: contentHeight
  visible: open
  function fittedContentWidth(value) { return Math.min(value, 820); }
  function fittedContentHeight(value) { return Math.min(value, 1000); }
  onOpenChanged: if (open && focusTarget) focusTarget.forceActiveFocus()
}
