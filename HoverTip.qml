import QtQuick
import Quickshell
import qs.Commons

// Passive popup: no focus grab, keyboard capture or host popout registration.
PopupWindow {
  id: root
  required property Item anchorItem
  required property var hostWidget
  property bool shown: false
  readonly property real uiScale: hostWidget ? hostWidget.uiScale : 1
  readonly property var anchorWindow: anchorItem ? anchorItem.QsWindow.window : null
  visible: shown && anchorWindow !== null
  color: "transparent"
  implicitWidth: Math.min(card.implicitWidth * uiScale, anchorWindow && anchorWindow.screen ? anchorWindow.screen.width - Style.space(20) : card.implicitWidth * uiScale)
  implicitHeight: card.implicitHeight * uiScale

  anchor {
    id: popupAnchor
    window: root.anchorWindow
    adjustment: PopupAdjustment.Slide
    edges: Edges.Top | Edges.Left
    gravity: Edges.Bottom | Edges.Right
    rect.width: 1; rect.height: 1
    onAnchoring: {
      if (!root.anchorItem || !root.anchorWindow) return;
      var target = root.anchorItem;
      var gap = Style.space(6);
      var x = target.width / 2 - root.implicitWidth / 2;
      var y = target.height + gap;
      var pos = root.hostWidget.bar ? root.hostWidget.bar.position : "top";
      if (pos === "bottom") y = -root.implicitHeight - gap;
      else if (pos === "left") { x = target.width + gap; y = target.height / 2 - root.implicitHeight / 2; }
      else if (pos === "right") { x = -root.implicitWidth - gap; y = target.height / 2 - root.implicitHeight / 2; }
      var point = root.anchorWindow.contentItem.mapFromItem(target, x, y);
      popupAnchor.rect.x = Math.round(point.x);
      popupAnchor.rect.y = Math.round(point.y);
    }
  }
  TooltipContent { id: card; hostWidget: root.hostWidget; width: root.implicitWidth / root.uiScale; scale: root.uiScale; transformOrigin: Item.TopLeft }
}
