pragma ComponentBehavior: Bound
import QtQuick
import "vendor/omarchy" as Choice
import qs.Ui as Ui
import qs.Commons
import "Model.js" as Model
import "I18n.js" as I18n

Column {
  id: root
  required property var hostWidget
  readonly property var words: hostWidget ? hostWidget.words : I18n.words("en")
  readonly property string language: hostWidget ? hostWidget.language : "en"
  readonly property color foreground: Color.popups.text
  readonly property color accent: hostWidget ? hostWidget.accent : Color.accent
  property string style: "short"
  property var custom: ({})
  property bool saveFailed: false
  signal finished()
  signal ensureVisible(var item)
  spacing: Style.space(12)

  function draft() { return {labelStyle: style, customLabels: custom}; }
  function begin() {
    var saved = hostWidget.savedLabels;
    style = saved.labelStyle;
    custom = JSON.parse(JSON.stringify(saved.customLabels));
    saveFailed = false;
    publishPreview();
    root.forceActiveFocus();
  }
  function closePicker() { stylePicker.close(); }
  function publishPreview() { hostWidget.previewLabels(draft()); }
  function setText(key, value) {
    var next = JSON.parse(JSON.stringify(custom));
    next[key] = value;
    custom = next;
    publishPreview();
  }
  function cancel() { closePicker(); hostWidget.cancelLabels(); finished(); }
  function apply() {
    if (hostWidget.saveLabels(draft())) { closePicker(); finished(); }
    else saveFailed = true;
  }
  function example(key) {
    return Model.statusText({status: key === "active" ? "here" : key, focused: key === "active",
      count: key === "empty" ? 0 : 4, monitor: "DP-3"}, language, draft(), hostWidget ? hostWidget.workspaceName : "scratchpad");
  }
  Keys.onEscapePressed: function(event) {
    if (stylePicker.popupOpen) stylePicker.close(); else root.cancel();
    event.accepted = true;
  }

  Text {
    width: parent.width
    text: "ScratchPeek · " + root.words.labels
    textFormat: Text.PlainText
    wrapMode: Text.Wrap
    horizontalAlignment: Text.AlignLeft
    color: root.foreground
    font.pixelSize: Style.font.subtitle
    font.bold: true
  }
  Choice.Dropdown {
    uiScale: root.hostWidget ? root.hostWidget.uiScale : 1
    id: stylePicker
    width: parent.width
    label: root.words.labelStyle
    value: root.style
    options: [{value:"short", label:root.words.shortLabels},
      {value:"explicit", label:root.words.explicitLabels},
      {value:"switch", label:"Scratchpad ON / OFF"},
      {value:"custom", label:root.words.customLabels}]
    accent: root.accent
    onChanged: function(value) {
      root.style = value;
      root.publishPreview();
      stylePicker.value = Qt.binding(function() { return root.style; });
    }
  }
  Text {
    width: parent.width
    text: root.words.labelHelp
    textFormat: Text.PlainText
    wrapMode: Text.Wrap
    horizontalAlignment: Text.AlignLeft
    color: root.foreground
    opacity: 0.75
    font.pixelSize: Style.font.caption
  }
  Rectangle {
    width: parent.width
    height: livePreview.implicitHeight + Style.space(20)
    radius: Style.space(5)
    color: Qt.alpha(root.accent, 0.1)
    Column {
      id: livePreview
      x: Style.space(10); y: Style.space(10)
      width: parent.width - Style.space(20)
      spacing: Style.space(4)
      Text { text: root.words.preview; color: root.foreground; font.pixelSize: Style.font.caption }
      Text {
        width: parent.width
        text: root.hostWidget ? root.hostWidget.statusDescription : ""
        textFormat: Text.PlainText
        wrapMode: Text.Wrap
        horizontalAlignment: Text.AlignLeft
        color: root.accent
        font.pixelSize: Style.font.body
      }
    }
  }
  Repeater {
    model: Model.labelStates
    delegate: Column {
      id: field
      required property string modelData
      width: root.width
      spacing: Style.space(4)
      Text {
        width: parent.width
        text: root.words[field.modelData].replace("{monitor}", "DP-3")
        textFormat: Text.PlainText
        horizontalAlignment: Text.AlignLeft
        color: root.foreground
        opacity: 0.7
        font.pixelSize: Style.font.caption
      }
      Ui.TextField {
        width: parent.width
        visible: root.style === "custom"
        maximumLength: 100
        text: root.custom[field.modelData] || ""
        placeholderText: Model.labelTemplates(root.language, "explicit")[field.modelData]
        Accessible.name: root.words[field.modelData].replace("{monitor}", "DP-3")
        accent: root.accent
        onTextEdited: root.setText(field.modelData, text)
        onActiveFocusChanged: if (activeFocus) root.ensureVisible(field)
      }
      Text {
        width: parent.width
        visible: root.style !== "custom"
        text: root.example(field.modelData)
        textFormat: Text.PlainText
        wrapMode: Text.Wrap
        horizontalAlignment: Text.AlignLeft
        color: root.accent
        font.pixelSize: Style.font.body
      }
    }
  }
  Text {
    visible: root.saveFailed
    width: parent.width
    text: root.words.labelSaveError
    textFormat: Text.PlainText
    wrapMode: Text.Wrap
    color: Color.urgent
    font.pixelSize: Style.font.body
  }
  Row {
    width: parent.width
    spacing: Style.space(10)
    Ui.Button { width: (parent.width-parent.spacing)/2; text: root.words.cancel; focusable: true; onClicked: root.cancel() }
    Ui.Button { width: (parent.width-parent.spacing)/2; text: root.words.apply; focusable: true; bordered: true; accent: root.accent; onClicked: root.apply() }
  }
}
