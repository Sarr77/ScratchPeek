import QtQuick
import QtQuick.Controls as QQC
import qs.Ui as Ui
import qs.Commons

QQC.ToolTip {
  id: root
  required property var hostWidget
  property bool alwaysAvailable: false
  property bool requested: false
  property real maximumWidth: 400
  property bool shownThisHover: false
  // Let the 100th hint remain readable until the pointer leaves. A manual off
  // always wins; future hovers cannot reopen an exhausted automatic hint.
  visible: requested && (alwaysAvailable || (!!hostWidget && (hostWidget.hints.enabled || (shownThisHover && hostWidget.hints.mode === "auto"))))
  onRequestedChanged: if (!requested) shownThisHover = false
  onOpened: {
    if (!shownThisHover) {
      shownThisHover = true;
      if (!alwaysAvailable && hostWidget) hostWidget.recordHintShown();
    }
  }
  delay: 400
  padding: 0
  width: Math.min(implicitWidth, maximumWidth)
  readonly property var tipBorder: Border.localOrSurfaceSpec("tooltip", "border", Color.tooltip.border, Color.tooltip.border, Math.max(1, Style.normalBorderWidth))
  background: Ui.BorderSurface {
    color: Color.tooltip.background
    borderSpec: root.tipBorder
    radius: 0
  }
  contentItem: Text {
    text: root.text
    textFormat: Text.PlainText
    wrapMode: Text.Wrap
    color: Color.tooltip.text
    font.family: Style.font.family
    font.pixelSize: Style.font.bodySmall
    leftPadding: Border.left(root.tipBorder) + Style.spacing.controlPaddingX
    rightPadding: Border.right(root.tipBorder) + Style.spacing.controlPaddingX
    topPadding: Border.top(root.tipBorder) + Style.spacing.controlPaddingY
    bottomPadding: Border.bottom(root.tipBorder) + Style.spacing.controlPaddingY
  }
}
