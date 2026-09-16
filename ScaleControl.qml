import QtQuick
import QtQuick.Controls as QQC
import qs.Ui as Ui
import qs.Commons

Column {
  id: root
  required property string label
  required property string invalidText
  property int percent: 100
  property color accent: Color.accent
  readonly property bool valid: field.acceptableInput
  signal changed(int percent)
  signal accepted()
  signal ensureVisible()
  spacing: Style.space(6)

  function choose(value) { changed(Math.max(80, Math.min(200, Math.round(value)))); field.text = String(root.percent); }
  function resetInput() { field.text = String(percent); }
  onPercentChanged: resetInput()

  Text {
    width: parent.width
    text: root.label
    textFormat: Text.PlainText
    wrapMode: Text.Wrap
    horizontalAlignment: Text.AlignLeft
    color: Color.popups.text
    font.pixelSize: Style.font.body
  }
  Row {
    width: parent.width
    spacing: Style.space(8)
    Ui.Button {
      width: Style.space(36); text: "−"; accent: root.accent; focusable: true
      enabled: root.percent > 80
      onActiveFocusChanged: if (activeFocus) root.ensureVisible()
      onClicked: root.choose(root.percent - 5)
    }
    Ui.TextField {
      id: field
      width: Style.space(70)
      text: String(root.percent)
      maximumLength: 3
      validator: IntValidator { bottom: 80; top: 200 }
      inputMethodHints: Qt.ImhDigitsOnly
      LayoutMirroring.enabled: false
      horizontalAlignment: TextInput.AlignHCenter
      Accessible.name: root.label + " (%)"
      accent: root.accent
      onTextEdited: if (acceptableInput) root.changed(Number(text))
      onAccepted: if (acceptableInput) root.accepted()
      onActiveFocusChanged: if (activeFocus) root.ensureVisible()
    }
    Text { text: "%"; color: Color.popups.text; font.pixelSize: Style.font.body; anchors.verticalCenter: parent.verticalCenter }
    Ui.Button {
      width: Style.space(36); text: "+"; accent: root.accent; focusable: true
      enabled: root.percent < 200
      onActiveFocusChanged: if (activeFocus) root.ensureVisible()
      onClicked: root.choose(root.percent + 5)
    }
    Ui.Button {
      width: Style.space(76); text: "100%"; accent: root.accent; focusable: true
      onClicked: root.choose(100)
      onActiveFocusChanged: if (activeFocus) root.ensureVisible()
    }
  }
  QQC.Slider {
    width: parent.width
    from: 80; to: 200; stepSize: 5
    snapMode: QQC.Slider.SnapAlways
    value: root.percent
    Accessible.name: root.label
    onMoved: root.choose(value)
    onActiveFocusChanged: if (activeFocus) root.ensureVisible()
    palette.highlight: root.accent
  }
  Text {
    width: parent.width
    visible: !root.valid
    text: root.invalidText
    textFormat: Text.PlainText
    color: Color.urgent
    wrapMode: Text.Wrap
    font.pixelSize: Style.font.caption
  }
}
