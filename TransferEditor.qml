import QtQuick
import Quickshell
import qs.Ui as Ui
import qs.Commons
import "vendor/omarchy" as Choice
import "I18n.js" as I18n

Column {
  id: root
  property var hostWidget: null
  property string address: ""
  property string windowTitle: ""
  readonly property var words: hostWidget ? hostWidget.words : I18n.words("en")
  readonly property color accent: hostWidget ? hostWidget.accent : Color.accent
  readonly property bool busy: hostWidget ? hostWidget.transferBusy : false
  signal finished()
  spacing: Style.space(16)
  function begin(win) {
    address = win.address;
    var app = DesktopEntries.heuristicLookup(win.app || "");
    windowTitle = (app ? app.name : (win.app || words.unnamed)) + " · " + (win.title || words.unnamed);
    destination.value = hostWidget ? hostWidget.defaultDestination : "";
    if (hostWidget) hostWidget.clearTransferError();
    Qt.callLater(function() { destination.focusTrigger(); });
  }
  function closePicker() { destination.close(); }
  Keys.onEscapePressed: function(event) { if (!destination.popupOpen) root.finished(); else event.accepted = false; }
  Text {
    width: parent.width
    text: root.words.extractWindow
    textFormat: Text.PlainText
    font.pixelSize: Style.font.body; font.bold: true
    color: Color.popups.text
    wrapMode: Text.Wrap
  }
  Text {
    width: parent.width
    text: root.windowTitle
    textFormat: Text.PlainText
    font.pixelSize: Style.font.body
    color: Color.popups.text
    wrapMode: Text.Wrap
    maximumLineCount: 3; elide: Text.ElideRight
  }
  Choice.SearchableDropdown {
    id: destination
    objectName: "transferDestination"
    width: parent.width
    uiScale: root.hostWidget ? root.hostWidget.uiScale : 1
    label: root.words.destinationWorkspace
    options: root.hostWidget ? root.hostWidget.destinationOptions : []
    placeholderText: root.words.search
    emptyText: root.words.noMatches
    accent: root.accent
    enabled: !root.busy
    onChanged: function(value) { destination.value = value; }
  }
  Text {
    width: parent.width
    text: root.words.moveHint
    textFormat: Text.PlainText
    wrapMode: Text.Wrap
    color: Color.popups.text; opacity: 0.7
    font.pixelSize: Style.font.caption
  }
  Text {
    width: parent.width
    visible: !!root.hostWidget && root.hostWidget.transferError !== ""
    text: visible ? root.words[root.hostWidget.transferError] : ""
    textFormat: Text.PlainText
    wrapMode: Text.Wrap
    color: Color.urgent
    font.pixelSize: Style.font.caption
  }
  Row {
    width: parent.width; spacing: Style.space(12)
    Ui.Button {
      width: (parent.width-parent.spacing)/2
      text: root.words.cancel; focusable: true; accent: root.accent
      onClicked: root.finished()
    }
    Ui.Button {
      objectName: "transferMoveButton"
      width: (parent.width-parent.spacing)/2
      text: root.busy ? root.words.movingWindow : root.words.moveWindow
      focusable: true; bordered: true; accent: root.accent
      enabled: !root.busy && destination.options.some(function(o) { return o.value === destination.value; })
      opacity: enabled ? 1 : 0.5
      onClicked: if (root.hostWidget) root.hostWidget.extractWindow(root.address, destination.value)
    }
  }
  Connections {
    target: root.hostWidget
    function onTransferCompleted() { if (root.visible) root.finished(); }
  }
}
