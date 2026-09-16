pragma ComponentBehavior: Bound
import QtQuick
import Quickshell
import qs.Commons
import "I18n.js" as I18n
import "Model.js" as Model

Rectangle {
  id: root
  required property var hostWidget
  readonly property bool compact: hostWidget ? hostWidget.appearance.tooltipStyle === "compact" : false
  readonly property var scratchpadState: hostWidget ? hostWidget.scratchpadState : {status:"unknown",count:0,windows:[]}
  readonly property var words: hostWidget ? hostWidget.words : I18n.words("en")
  readonly property string language: hostWidget ? hostWidget.language : "en"
  readonly property string workspace: hostWidget ? hostWidget.workspaceName : "scratchpad"
  readonly property color accent: hostWidget ? hostWidget.accent : Color.accent
  readonly property int inset: Style.space(compact ? 10 : 14)
  readonly property int horizontalInset: inset + Style.space(4)
  readonly property color foreground: Color.popups.text
  implicitWidth: Style.space(compact ? 278 : 318)
  implicitHeight: contents.implicitHeight + inset * 2
  radius: Style.space(compact ? 2 : 8)
  color: Color.popups.background
  border.width: 1
  border.color: Qt.alpha(root.accent, 0.65)

  Column {
    id: contents
    x: root.horizontalInset; y: root.inset
    width: parent.width - root.horizontalInset * 2
    spacing: Style.space(root.compact ? 5 : 8)
    LayoutMirroring.enabled: I18n.isRtl(root.language)
    LayoutMirroring.childrenInherit: true

    Text {
      width: parent.width
      text: "ScratchPeek"
      textFormat: Text.PlainText
      horizontalAlignment: Text.AlignLeft
      color: root.foreground
      font.pixelSize: Style.font.body
      font.bold: true
    }
    Text {
      width: parent.width
      text: (root.hostWidget ? root.hostWidget.statusDescription : Model.statusText(root.scratchpadState, root.language)) + " · " + root.words.windows + ": " + (root.scratchpadState.status === "unknown" ? "?" : root.scratchpadState.count)
      textFormat: Text.PlainText
      wrapMode: Text.Wrap
      horizontalAlignment: Text.AlignLeft
      color: root.accent
      font.pixelSize: Style.font.body
    }
    Repeater {
      model: root.scratchpadState.windows.slice(0, 6)
      delegate: Item {
        id: appRow
        required property var modelData
        readonly property var entry: DesktopEntries.heuristicLookup(modelData.app)
        width: contents.width
        height: Style.space(root.compact ? 18 : 24)
        Image {
          id: icon
          anchors.left: parent.left
          anchors.verticalCenter: parent.verticalCenter
          width: Style.space(18); height: width
          visible: !root.compact
          source: appRow.entry && appRow.entry.icon ? Quickshell.iconPath(appRow.entry.icon, true) : ""
          sourceSize.width: width; sourceSize.height: height
          fillMode: Image.PreserveAspectFit
        }
        Text {
          anchors.left: parent.left
          anchors.right: parent.right
          anchors.leftMargin: root.compact ? 0 : Style.space(26)
          anchors.verticalCenter: parent.verticalCenter
          text: (appRow.entry ? appRow.entry.name : appRow.modelData.app || root.words.unnamed)
            + (appRow.modelData.grouped ? " · " + root.words.grouped : "")
          textFormat: Text.PlainText
          horizontalAlignment: Text.AlignLeft
          elide: Text.ElideRight
          color: root.foreground
          font.pixelSize: Style.font.body
        }
      }
    }
    Text {
      visible: root.scratchpadState.count > 6
      text: "+" + (root.scratchpadState.count - 6)
      color: root.foreground
      font.pixelSize: Style.font.body
    }
    Text {
      width: parent.width
      visible: root.scratchpadState.count === 0 || root.scratchpadState.status === "unknown"
      text: root.scratchpadState.status === "unknown"
        ? (Model.validWorkspace(root.workspace) ? root.words.unknownHelp : root.words.invalidHelp)
        : (root.workspace === "scratchpad" ? root.words.emptyHelp : root.words.customHelp)
      textFormat: Text.PlainText
      horizontalAlignment: Text.AlignLeft
      wrapMode: Text.Wrap
      color: root.foreground
      font.pixelSize: Style.font.body
    }
    Rectangle { width: parent.width; height: 1; color: Qt.alpha(root.foreground, 0.12) }
    Text {
      width: parent.width
      text: root.words.clickHelp
      textFormat: Text.PlainText
      horizontalAlignment: Text.AlignLeft
      wrapMode: Text.Wrap
      color: root.foreground
      opacity: 0.75
      font.pixelSize: Style.font.caption
    }
  }
}
