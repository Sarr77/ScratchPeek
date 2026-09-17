import QtQuick
import qs.Ui as Ui
import qs.Commons
import "I18n.js" as I18n

Ui.Button {
  id: root
  required property var words
  property bool hintsEnabled: true
  property bool automatic: true
  property int daysLeft: 7
  text: "?"
  width: Style.space(24)
  height: width
  horizontalPadding: 0
  verticalPadding: 0
  radius: width / 2
  fontSize: Style.font.caption
  selected: hintsEnabled
  bordered: true
  // Always explain this switch, even when every other panel hint is disabled.
  tooltipText: hintsEnabled && automatic
    ? I18n.format(daysLeft === 1 ? words.hintsAutomaticOne : words.hintsAutomatic, {days: daysLeft})
    : (hintsEnabled ? words.hintsOn : words.hintsOff)
  Accessible.role: Accessible.CheckBox
  Accessible.name: words.panelHints
  Accessible.description: tooltipText
  Accessible.checkable: true
  Accessible.checked: hintsEnabled
  Accessible.onToggleAction: clicked()
}
