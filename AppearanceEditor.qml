import QtQuick
import "vendor/omarchy" as Choice
import QtQuick.Controls as QQC
import qs.Ui as Ui
import qs.Commons
import "Appearance.js" as Appearance
import "I18n.js" as I18n

Column {
  id: root
  required property var hostWidget
  readonly property var words: hostWidget ? hostWidget.words : I18n.words("en")
  readonly property color foreground: hostWidget && hostWidget.bar ? hostWidget.bar.barForeground : Color.popups.text
  readonly property color accent: hostWidget ? hostWidget.accent : Color.accent
  property real hue: 0
  property real saturation: 0
  property real value: 1
  property bool themeColor: true
  property bool validHex: true
  property bool saveFailed: false
  property string tipStyle: "panel"
  property bool syncing: false
  signal finished()
  spacing: Style.space(12)
  readonly property string chosenHex: Appearance.fromHsv(hue, saturation, value)

  function syncHex(text) {
    var hsv = Appearance.toHsv(text);
    if (!hsv) return false;
    syncing = true;
    hue = hsv.h; saturation = hsv.s; value = hsv.v;
    hexInput.text = Appearance.hex(text);
    validHex = true;
    syncing = false;
    return true;
  }
  function begin() {
    var saved = hostWidget.savedAppearance;
    themeColor = !saved.accentColor;
    tipStyle = saved.tooltipStyle;
    saveFailed = false;
    syncHex(saved.accentColor || String(Color.accent));
    publishPreview();
    hexInput.forceActiveFocus();
  }
  function publishPreview() {
    if (!validHex) return;
    hostWidget.previewAppearance({accentColor: themeColor ? "" : chosenHex, tooltipStyle: tipStyle});
  }
  function pick(h, s, v) {
    hue = Math.max(0, Math.min(1, h));
    saturation = Math.max(0, Math.min(1, s));
    value = Math.max(0, Math.min(1, v));
    themeColor = false;
    syncing = true; hexInput.text = chosenHex; syncing = false;
    validHex = true;
    publishPreview();
  }
  function cancel() { hostWidget.cancelAppearance(); finished(); }
  function apply() {
    if (!validHex) return;
    if (hostWidget.saveAppearance({accentColor: themeColor ? "" : chosenHex, tooltipStyle: tipStyle})) finished();
    else saveFailed = true;
  }
  Keys.onEscapePressed: function(event) { root.cancel(); event.accepted = true; }

  Text {
    width: parent.width
    text: "ScratchPeek · " + root.words.appearance
    textFormat: Text.PlainText
    horizontalAlignment: Text.AlignLeft
    color: root.foreground
    font.pixelSize: Style.font.subtitle
    font.bold: true
  }
  Text { text: root.words.highlight; color: root.foreground; font.pixelSize: Style.font.body }

  Item {
    id: sv
    objectName: "colorPlane"
    width: parent.width; height: Style.space(145)
    LayoutMirroring.enabled: false
    LayoutMirroring.childrenInherit: true
    activeFocusOnTab: true
    Accessible.role: Accessible.Slider
    Accessible.name: root.words.highlight + " S / V"
    Rectangle { anchors.fill: parent; color: Appearance.fromHsv(root.hue, 1, 1) }
    Rectangle {
      anchors.fill: parent
      gradient: Gradient {
        orientation: Gradient.Horizontal
        GradientStop { position: 0; color: "#FFFFFFFF" }
        GradientStop { position: 1; color: "#00FFFFFF" }
      }
    }
    Rectangle {
      anchors.fill: parent
      gradient: Gradient {
        GradientStop { position: 0; color: "#00000000" }
        GradientStop { position: 1; color: "#FF000000" }
      }
    }
    Rectangle {
      x: Math.max(0, Math.min(parent.width-width, root.saturation*parent.width-width/2))
      y: Math.max(0, Math.min(parent.height-height, (1-root.value)*parent.height-height/2))
      width: Style.space(12); height: width; radius: width/2
      color: root.chosenHex
      border.width: 2; border.color: root.value > 0.6 ? "black" : "white"
    }
    Rectangle { anchors.fill: parent; color: "transparent"; border.width: sv.activeFocus ? 2 : 0; border.color: root.accent }
    MouseArea {
      anchors.fill: parent
      preventStealing: true
      onPressed: function(mouse) { sv.forceActiveFocus(); root.pick(root.hue, mouse.x/width, 1-mouse.y/height); }
      onPositionChanged: function(mouse) { if (pressed) root.pick(root.hue, mouse.x/width, 1-mouse.y/height); }
    }
    Keys.onPressed: function(event) {
      var delta = event.modifiers & Qt.ShiftModifier ? 0.1 : 0.01;
      if (event.key === Qt.Key_Left) root.pick(root.hue, root.saturation-delta, root.value);
      else if (event.key === Qt.Key_Right) root.pick(root.hue, root.saturation+delta, root.value);
      else if (event.key === Qt.Key_Up) root.pick(root.hue, root.saturation, root.value+delta);
      else if (event.key === Qt.Key_Down) root.pick(root.hue, root.saturation, root.value-delta);
      else return;
      event.accepted = true;
    }
  }
  QQC.Slider {
    id: hueSlider
    width: parent.width
    from: 0; to: 1; value: root.hue; stepSize: 0.002
    LayoutMirroring.enabled: false
    Accessible.name: root.words.highlight + " H"
    onMoved: root.pick(value, root.saturation, root.value)
    background: Rectangle {
      x: hueSlider.leftPadding
      y: hueSlider.topPadding + hueSlider.availableHeight/2 - height/2
      width: hueSlider.availableWidth; height: Style.space(15); radius: Style.space(3)
      gradient: Gradient {
        orientation: Gradient.Horizontal
        GradientStop { position: 0; color: "#FF0000" }
        GradientStop { position: 0.166667; color: "#FFFF00" }
        GradientStop { position: 0.333333; color: "#00FF00" }
        GradientStop { position: 0.5; color: "#00FFFF" }
        GradientStop { position: 0.666667; color: "#0000FF" }
        GradientStop { position: 0.833333; color: "#FF00FF" }
        GradientStop { position: 1; color: "#FF0000" }
      }
    }
  }
  Row {
    width: parent.width; spacing: Style.space(10)
    Rectangle { width: Style.space(32); height: width; color: root.accent; radius: Style.space(4); border.width: 1; border.color: Color.popups.text }
    Ui.TextField {
      id: hexInput
      objectName: "hexInput"
      width: parent.width - Style.space(42)
      placeholderText: "#RRGGBB"
      Accessible.name: "HEX"
      maximumLength: 7
      LayoutMirroring.enabled: false
      horizontalAlignment: TextInput.AlignLeft
      accent: root.accent
      onTextEdited: {
        if (root.syncing) return;
        var normalized = Appearance.hex(text);
        root.validHex = normalized !== "";
        if (root.validHex) {
          var hsv = Appearance.toHsv(normalized);
          root.hue = hsv.h; root.saturation = hsv.s; root.value = hsv.v;
          root.themeColor = false;
          root.publishPreview();
        }
      }
      onAccepted: root.apply()
    }
  }
  Text {
    width: parent.width
    visible: !root.validHex || root.saveFailed
    text: root.saveFailed ? root.words.saveStyleError : root.words.invalidHex
    color: Color.urgent
    wrapMode: Text.Wrap
    font.pixelSize: Style.font.body
  }
  Ui.Button {
    objectName: "themeColorButton"
    width: parent.width
    text: root.words.themeColor + " · " + String(root.hostWidget ? root.hostWidget.themeAccent : Color.accent).toUpperCase()
    selected: root.themeColor
    accent: root.accent
    focusable: true
    onClicked: { root.themeColor = true; root.syncHex(String(Color.accent)); root.publishPreview(); }
  }
  Choice.Dropdown {
    uiScale: root.hostWidget ? root.hostWidget.uiScale : 1
    id: tipStylePicker
    width: parent.width
    label: root.words.tooltipStyle
    value: root.tipStyle
    options: [{value:"panel",label:root.words.spacious},{value:"compact",label:root.words.compactTip}]
    accent: root.accent
    onChanged: function(value) {
      root.tipStyle = value;
      root.publishPreview();
      tipStylePicker.value = Qt.binding(function() { return root.tipStyle; });
    }
  }
  Text { text: root.words.preview; color: root.foreground; font.pixelSize: Style.font.caption }
  TooltipContent { width: parent.width; hostWidget: root.hostWidget }
  Row {
    width: parent.width; spacing: Style.space(10)
    Ui.Button { objectName: "cancelButton"; width: (parent.width-parent.spacing)/2; text: root.words.cancel; focusable: true; onClicked: root.cancel() }
    Ui.Button { objectName: "applyButton"; width: (parent.width-parent.spacing)/2; text: root.words.apply; focusable: true; bordered: true; accent: root.accent; enabled: root.validHex; onClicked: root.apply() }
  }
}
