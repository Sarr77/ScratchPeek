pragma ComponentBehavior: Bound
import QtQuick
import "vendor/omarchy" as Choice
import QtQuick.Controls as QQC
import Quickshell
import qs.Ui
import qs.Ui as Ui
import qs.Commons
import "Model.js" as Model
import "I18n.js" as I18n

Panel {
  id: root
  moduleName: "sarr.scratchpeek"
  manageIpc: false
  property var anchorItem: null
  property var hostWidget: null
  readonly property var scratchpadState: hostWidget ? hostWidget.scratchpadState : { status: "unknown", count: 0, windows: [] }
  readonly property string language: hostWidget ? hostWidget.language : "en"
  readonly property var words: I18n.words(language)
  readonly property bool rtl: I18n.isRtl(language)
  readonly property bool canToggle: scratchpadState.status !== "unknown" && (scratchpadState.count > 0 || scratchpadState.status === "here")
  readonly property bool transferSupported: !!hostWidget && hostWidget.transferSupported
  readonly property int windowActionCount: transferSupported ? 2 : 1
  readonly property int toggleIndex: scratchpadState.count * windowActionCount
  readonly property int addIndex: toggleIndex + (canToggle ? 1 : 0)
  readonly property int languageIndex: addIndex + (transferSupported ? 1 : 0)
  property alias selectedIndex: selection.index
  PanelSelection { id: selection }
  property Item activeEditor: null
  readonly property real uiScale: hostWidget ? hostWidget.uiScale : 1
  readonly property bool editing: activeEditor !== null
  readonly property int scalingIndex: appearanceIndex + 1
  readonly property int labelsIndex: scalingIndex + 1
  readonly property int hintsIndex: labelsIndex + 1
  readonly property int updatesIndex: hintsIndex + 1
  readonly property bool hintsEnabled: !hostWidget || hostWidget.hints.enabled
  readonly property real logicalContentHeight: activeEditor ? activeEditor.implicitHeight : content.implicitHeight
  readonly property int appearanceIndex: languageIndex + 1
  readonly property color accent: hostWidget ? hostWidget.accent : Color.accent

  onOpenedChanged: {
    if (opened) { selection.reset(); scroll.contentY = 0; if (hostWidget) hostWidget.clearTransferError(); }
    else {
      closeEditors();
      updateConfirmation.opened = false;
    }
  }
  onLanguageIndexChanged: selectedIndex = Math.min(selectedIndex, updatesIndex)

  function moveSelection(delta) {
    selection.move(delta, updatesIndex);
    if (selectedIndex < toggleIndex) {
      list.positionViewAtIndex(Math.floor(selectedIndex / windowActionCount), ListView.Contain);
      scroll.contentY = 0;
    } else scroll.contentY = Math.max(0, scroll.contentHeight - scroll.height);
  }
  function activateSelection() {
    if (!hostWidget || selectedIndex < 0) return;
    if (selectedIndex === hintsIndex) hostWidget.toggleHints();
    else if (selectedIndex === updatesIndex) requestUpdatesToggle();
    else if (selectedIndex === labelsIndex) openLabels();
    else if (selectedIndex === scalingIndex) openScaling();
    else if (selectedIndex === appearanceIndex) openAppearance();
    else if (selectedIndex === languageIndex) openLanguages();
    else if (selectedIndex === addIndex && transferSupported) addPicker.open();
    else if (selectedIndex === toggleIndex && canToggle) hostWidget.toggleScratchpad();
    else {
      var win = scratchpadState.windows[Math.floor(selectedIndex / windowActionCount)];
      if (win) { if (transferSupported && selectedIndex % windowActionCount) openTransfer(win); else hostWidget.focusWindow(win.address); }
    }
  }
  function requestUpdatesToggle() {
    if (!hostWidget) return;
    if (hostWidget.autoUpdates) updateConfirmation.open();
    else hostWidget.toggleUpdates();
  }
  function openTransfer(win) {
    if (!hostWidget || hostWidget.transferBusy) return;
    showEditor(transferEditor, win);
  }
  function quickExtract(win) {
    if (!hostWidget || hostWidget.transferBusy) return;
    // Never guess a workspace if the monitor has disappeared or isn't ready.
    if (!hostWidget.defaultDestination) { openTransfer(win); return; }
    hostWidget.extractWindow(win.address, hostWidget.defaultDestination);
  }
  function openTransferAddress(address) {
    var win = scratchpadState.windows.filter(function(w) { return w.address === address; })[0];
    if (!win || !hostWidget || hostWidget.transferBusy) return false;
    open();
    openTransfer(win);
    return true;
  }
  function openLanguages() {
    selectedIndex = languageIndex;
    scroll.contentY = Math.max(0, scroll.contentHeight - scroll.height);
    languagePicker.open();
  }

  function closeEditors() {
    languagePicker.close();
    addPicker.close();
    transferEditor.closePicker();
    appearanceEditor.closePickers();
    labelsEditor.closePicker();
    if (hostWidget) { hostWidget.cancelAppearance(); hostWidget.cancelLabels(); }
    activeEditor = null;
  }

  function showEditor(editor, value) {
    if (!hostWidget) return;
    closeEditors();
    activeEditor = editor;
    scroll.contentY = 0;
    editor.begin(value);
  }

  function finishEditor(index, atTop) {
    closeEditors();
    selectedIndex = index;
    scroll.contentY = atTop ? 0 : Math.max(0, content.implicitHeight - scroll.height);
    catcher.forceActiveFocus();
  }

  function openAppearance() { showEditor(appearanceEditor); }
  function openLabels() { showEditor(labelsEditor); }
  function openScaling() { showEditor(scalingEditor); }

  function ensureVisible(item) {
    var position = item.mapToItem(scroll.contentItem, 0, 0);
    if (position.y < scroll.contentY) scroll.contentY = position.y;
    else if (position.y + item.height > scroll.contentY + scroll.height)
      scroll.contentY = position.y + item.height - scroll.height;
  }

  KeyboardPanel {
    id: panel
    anchorItem: root.anchorItem
    owner: root
    bar: root.bar
    open: root.opened
    focusTarget: catcher
    padding: Style.spacing.popupPadding * root.uiScale
    contentWidth: panel.fittedContentWidth(Style.space(420) * root.uiScale)
    contentHeight: panel.fittedContentHeight(root.logicalContentHeight * root.uiScale)
    // Qt Controls reparents dropdown popups to the overlay, outside the scaled
    // content tree. Give this panel window's overlay the same transform.
    borderSpec: Border.flat(root.accent, Math.max(1, Style.space(2)))

    PanelKeyCatcher {
      id: catcher
      // Quickshell creates the backing QQuickWindow lazily; bind only once
      // the attached Qt Controls overlay exists.
      Binding { target: catcher.QQC.Overlay.overlay; property: "transformOrigin"; value: Item.TopLeft; when: catcher.QQC.Overlay.overlay !== null }
      Binding { target: catcher.QQC.Overlay.overlay; property: "scale"; value: root.uiScale; when: catcher.QQC.Overlay.overlay !== null }
      anchors.fill: parent
      blocked: languagePicker.popupOpen || addPicker.popupOpen || root.editing || updateConfirmation.opened
      onCloseRequested: root.close()
      onMoveRequested: function(dx, dy) {
        if (dx && root.selectedIndex >= 0 && root.selectedIndex < root.toggleIndex) {
          selection.fromKeyboard = true;
          root.selectedIndex = Math.floor(root.selectedIndex/root.windowActionCount)*root.windowActionCount + (dx > 0 ? root.windowActionCount-1 : 0);
        } else root.moveSelection(dy);
      }
      onActivateRequested: root.activateSelection()
      onTabRequested: function(direction) { root.moveSelection(direction) }

      Flickable {
        id: scroll
        interactive: !updateConfirmation.opened
        // The scrollbar lives in the panel padding, so both content margins
        // stay equal whether scrolling is needed or not.
        width: parent.width / root.uiScale
        height: parent.height / root.uiScale
        scale: root.uiScale
        transformOrigin: Item.TopLeft
        contentHeight: root.logicalContentHeight
        clip: true
        boundsBehavior: Flickable.StopAtBounds
        QQC.ScrollBar.vertical: ScrollHandle {
          id: outerScrollbar
          parent: catcher
          x: root.rtl ? -panel.padding : catcher.width - width + panel.padding
          y: 0
          height: catcher.height
          uiScale: root.uiScale
          accent: root.accent
        }

        TransferEditor {
          id: transferEditor
          width: scroll.width
          hostWidget: root.hostWidget
          visible: root.activeEditor === transferEditor
          LayoutMirroring.enabled: root.rtl
          LayoutMirroring.childrenInherit: true
          onFinished: root.finishEditor(Math.min(root.selectedIndex, root.hintsIndex), true)
        }

        AppearanceEditor {
          id: appearanceEditor
          width: scroll.width
          hostWidget: root.hostWidget
          visible: root.activeEditor === appearanceEditor
          LayoutMirroring.enabled: root.rtl
          LayoutMirroring.childrenInherit: true
          onEnsureVisible: function(item) { root.ensureVisible(item); }
          onFinished: root.finishEditor(root.appearanceIndex, false)
        }

        LabelsEditor {
          id: labelsEditor
          width: scroll.width
          hostWidget: root.hostWidget
          visible: root.activeEditor === labelsEditor
          LayoutMirroring.enabled: root.rtl
          LayoutMirroring.childrenInherit: true
          onEnsureVisible: function(item) { root.ensureVisible(item); }
          onFinished: root.finishEditor(root.labelsIndex, false)
        }

        ScalingEditor {
          id: scalingEditor
          width: scroll.width
          hostWidget: root.hostWidget
          visible: root.activeEditor === scalingEditor
          LayoutMirroring.enabled: root.rtl
          LayoutMirroring.childrenInherit: true
          onEnsureVisible: function(item) { root.ensureVisible(item); }
          onFinished: root.finishEditor(root.scalingIndex, false)
        }

        Column {
          id: content
          visible: !root.editing
          width: scroll.width
          spacing: Style.space(12)
          LayoutMirroring.enabled: root.rtl
          LayoutMirroring.childrenInherit: true

          Row {
            width: parent.width
            Text {
              width: parent.width - count.implicitWidth
              text: "ScratchPeek"
              textFormat: Text.PlainText
              horizontalAlignment: Text.AlignLeft
              color: root.barForeground
              font.family: root.bar ? root.bar.fontFamily : Style.font.family
              font.pixelSize: Style.font.subtitle
              font.bold: true
            }
            Text {
              id: count
              text: root.words.windows + ": " + (root.scratchpadState.status === "unknown" ? "?" : root.scratchpadState.count)
              textFormat: Text.PlainText
              color: root.barForeground
              opacity: 0.7
              font.pixelSize: Style.font.body
            }
          }

          Item {
            id: statusLine
            width: parent.width
            readonly property bool stacked: shortcut.visible && statusText.implicitWidth + shortcut.implicitWidth + Style.space(16) > width
            height: stacked ? statusText.implicitHeight + shortcut.implicitHeight + Style.space(4) : Math.max(statusText.implicitHeight, shortcut.implicitHeight)
            LayoutMirroring.enabled: false
            Text {
              id: statusText
              width: parent.width
              text: root.hostWidget ? root.hostWidget.statusDescription : Model.statusText(root.scratchpadState, root.language)
              textFormat: Text.PlainText
              wrapMode: Text.Wrap
              color: root.scratchpadState.status === "here" ? root.accent : root.barForeground
              font.pixelSize: Style.font.body
            }
            Text {
              id: shortcut
              anchors.right: parent.right
              y: statusLine.stacked ? statusText.implicitHeight + Style.space(4) : Math.max(0, (statusText.implicitHeight - implicitHeight) / 2)
              width: Math.min(implicitWidth, parent.width)
              visible: !!root.hostWidget && root.hostWidget.toggleShortcut !== ""
              text: visible ? (root.hintsEnabled ? I18n.format(root.words.shortcutHint, { shortcut: root.hostWidget.toggleShortcut }) : root.hostWidget.toggleShortcut) : ""
              textFormat: Text.PlainText
              wrapMode: Text.Wrap
              horizontalAlignment: Text.AlignRight
              color: root.barForeground
              opacity: 0.65
              font.pixelSize: Style.font.caption
            }
          }

          Item {
            id: diagram
            readonly property var layout: root.hostWidget ? root.hostWidget.monitorDiagram : { items: [], width: 1, height: 1 }
            width: parent.width
            height: visible ? Style.space(64) : 0
            visible: layout.items.length > 1
            // Physical positions must not be mirrored with Arabic text.
            LayoutMirroring.enabled: false
            LayoutMirroring.childrenInherit: true
            readonly property real scaleFactor: Math.min(width / layout.width, height / layout.height)
            Repeater {
              model: diagram.layout.items
              delegate: Rectangle {
                id: monitorTile
                required property var modelData
                readonly property bool openedHere: root.scratchpadState.monitor === modelData.name
                x: (diagram.width - diagram.layout.width * diagram.scaleFactor) / 2 + modelData.x * diagram.scaleFactor + 2
                y: modelData.y * diagram.scaleFactor + 2
                width: Math.max(1, modelData.width * diagram.scaleFactor - 4)
                height: Math.max(1, modelData.height * diagram.scaleFactor - 4)
                radius: Style.space(4)
                color: Qt.alpha(openedHere ? root.accent : root.barForeground, openedHere ? 0.17 : 0.04)
                border.width: openedHere ? Style.space(2) : 1
                border.color: openedHere ? root.accent : Qt.alpha(root.barForeground, 0.25)
                Accessible.role: Accessible.StaticText
                Accessible.name: modelData.name + (openedHere ? " · " + root.words.here : "")
                Text {
                  anchors.centerIn: parent
                  width: parent.width - Style.space(8)
                  text: (monitorTile.openedHere ? "● " : "") + monitorTile.modelData.name
                  textFormat: Text.PlainText
                  horizontalAlignment: Text.AlignHCenter
                  elide: Text.ElideRight
                  color: monitorTile.openedHere ? root.accent : root.barForeground
                  font.pixelSize: Style.font.caption
                }
              }
            }
          }

          Text {
            visible: root.scratchpadState.count === 0 || root.scratchpadState.status === "unknown"
            width: parent.width
            text: root.scratchpadState.status === "unknown"
              ? (root.hostWidget && !Model.validWorkspace(root.hostWidget.workspaceName) ? root.words.invalidHelp : root.words.unknownHelp)
              : (root.hostWidget && root.hostWidget.workspaceName === "scratchpad" ? root.words.emptyHelp + "\n\n" + root.words.shortcutNote : root.words.customHelp)
            textFormat: Text.PlainText
            wrapMode: Text.Wrap
            color: root.barForeground
            font.pixelSize: Style.font.body
            lineHeight: 1.2
          }

          ListView {
            id: list
            width: parent.width
            height: visible ? Math.min(Style.space(280), contentHeight, Math.max(Style.space(60), panel.availableCardHeight / root.uiScale - Style.space(400))) : 0
            visible: root.scratchpadState.count > 0
            clip: true
            model: root.opened ? root.scratchpadState.windows : []
            spacing: Style.space(3)
            QQC.ScrollBar.vertical: ScrollHandle { id: windowScrollbar; accent: root.accent }

            delegate: Rectangle {
              id: row
              required property var modelData
              required property int index
              readonly property var appEntry: DesktopEntries.heuristicLookup(modelData.app)
              readonly property string appName: appEntry ? appEntry.name : (modelData.app || root.words.unnamed)
              readonly property string iconSource: appEntry && appEntry.icon ? Quickshell.iconPath(appEntry.icon, true) : ""
              width: list.width - (windowScrollbar.visible ? windowScrollbar.width + Style.space(4) : 0)
              height: Style.space(58)
              radius: Style.space(6)
              color: Qt.alpha(root.barForeground, index * root.windowActionCount === root.selectedIndex ? 0.10 : 0)
              Accessible.role: Accessible.Button
              Accessible.name: appName + " · " + (modelData.title || root.words.unnamed)
              Accessible.description: root.words.focusWindowHint
              Accessible.onPressAction: if (root.hostWidget) root.hostWidget.focusWindow(modelData.address)

              Rectangle {
                width: Style.space(2)
                height: parent.height - Style.space(12)
                anchors.left: parent.left
                anchors.verticalCenter: parent.verticalCenter
                visible: row.modelData.grouped
                color: Qt.alpha(root.accent, 0.5)
              }
              Rectangle {
                id: iconBox
                anchors.left: parent.left
                anchors.leftMargin: Style.space(9)
                anchors.verticalCenter: parent.verticalCenter
                width: Style.space(32)
                height: width
                radius: Style.space(6)
                color: Qt.alpha(root.barForeground, 0.06)
                Image {
                  id: appIcon
                  anchors.centerIn: parent
                  width: Style.space(24)
                  height: width
                  source: row.iconSource
                  sourceSize.width: width
                  sourceSize.height: height
                  fillMode: Image.PreserveAspectFit
                }
                Text {
                  anchors.centerIn: parent
                  visible: appIcon.status !== Image.Ready
                  text: row.appName.slice(0, 1).toUpperCase()
                  textFormat: Text.PlainText
                  color: root.accent
                  font.pixelSize: Style.font.body
                }
              }
              Column {
                anchors.left: iconBox.right
                anchors.right: extractButton.left
                anchors.leftMargin: Style.space(10)
                anchors.rightMargin: Style.space(8)
                anchors.verticalCenter: parent.verticalCenter
                spacing: Style.space(3)
                Text {
                  width: parent.width
                  text: row.appName + (row.modelData.grouped ? " · " + root.words.grouped + " #" + row.modelData.groupNumber : "")
                  textFormat: Text.PlainText
                  horizontalAlignment: Text.AlignLeft
                  elide: Text.ElideRight
                  color: root.barForeground
                  font.pixelSize: Style.font.body
                  font.bold: true
                }
                Text {
                  width: parent.width
                  text: row.modelData.title || root.words.unnamed
                  textFormat: Text.PlainText
                  horizontalAlignment: Text.AlignLeft
                  elide: Text.ElideRight
                  color: root.barForeground
                  opacity: 0.7
                  font.pixelSize: Style.font.caption
                }
              }
              MouseArea {
                id: focusArea
                anchors.left: parent.left
                anchors.top: parent.top
                anchors.bottom: parent.bottom
                anchors.right: extractButton.left
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onEntered: selection.hover(row.index * root.windowActionCount, true)
                onExited: selection.hover(row.index * root.windowActionCount, false)
                onClicked: if (root.hostWidget) root.hostWidget.focusWindow(row.modelData.address)
                PanelHint {
                  hostWidget: root.hostWidget
                  requested: focusArea.containsMouse && root.opened && !root.editing && !list.moving && !scroll.moving
                  text: root.words.focusWindowHint
                  maximumWidth: scroll.width
                }
              }
              MoveOutButton {
                id: extractButton
                anchors.right: parent.right
                anchors.rightMargin: Style.space(6)
                anchors.verticalCenter: parent.verticalCenter
                visible: root.transferSupported
                width: visible ? implicitWidth : 0
                iconText: "↗"
                iconSize: Style.font.body
                text: root.words.extractAction
                bordered: true
                hostWidget: root.hostWidget
                hintsAllowed: root.opened && !root.editing && !list.moving && !scroll.moving
                hintWidth: scroll.width
                hintText: root.words.extractWindow + "\n" + root.words.quickExtractHint
                foreground: root.accent; accent: root.accent
                hasCursor: root.selectedIndex === row.index * 2 + 1
                enabled: !root.hostWidget || !root.hostWidget.transferBusy
                Accessible.role: Accessible.Button
                Accessible.name: root.words.extractWindow + " · " + row.appName
                Accessible.description: root.words.quickExtractHint
                Accessible.onPressAction: root.openTransfer(row.modelData)
                onHovered: function(value) { selection.hover(row.index * 2 + 1, value); }
                onClicked: root.openTransfer(row.modelData)
                onQuickMove: root.quickExtract(row.modelData)
              }
            }
          }

          HintButton {
            width: parent.width
            visible: root.canToggle
            enabled: !!root.hostWidget && !root.hostWidget.visibilityBusy
            text: root.scratchpadState.status === "here" ? root.words.hide : root.words.show
            hostWidget: root.hostWidget
            hintsAllowed: root.opened && !root.editing && !scroll.moving
            hintWidth: scroll.width
            hintText: Accessible.description
            Accessible.description: root.scratchpadState.status === "here" ? root.words.hideScratchpadHint : root.words.showScratchpadHint
            foreground: root.barForeground
            accent: root.accent
            hasCursor: root.selectedIndex === root.toggleIndex
            bordered: true
            onHovered: function(value) { selection.hover(root.toggleIndex, value); }
            onClicked: if (root.hostWidget) root.hostWidget.toggleScratchpad()
          }

          AddWindowPicker {
            id: addPicker
            hostWidget: root.hostWidget
            hintsAllowed: root.opened && !root.editing && !scroll.moving
            hintWidth: scroll.width
            visible: root.transferSupported
            width: parent.width
            uiScale: root.uiScale
            showLabel: false
            triggerLabel: root.words.addWindow
            options: root.hostWidget ? root.hostWidget.addWindowOptions : []
            placeholderText: root.words.searchWindows
            emptyText: root.words.noMatches
            foreground: root.barForeground; accent: root.accent
            enabled: !!root.hostWidget && !root.hostWidget.transferBusy
            hasCursor: root.selectedIndex === root.addIndex
            onHovered: function(value) { selection.hover(root.addIndex, value); }
            onChanged: function(value) {
              if (root.hostWidget) root.hostWidget.addWindow(value);
              addPicker.value = "";
            }
          }
          Text {
            width: parent.width
            visible: !!root.hostWidget && !!root.hostWidget.visibilityError
            text: visible ? root.words[root.hostWidget.visibilityError] : ""
            textFormat: Text.PlainText
            wrapMode: Text.Wrap
            color: Color.urgent
            font.pixelSize: Style.font.caption
          }
          Text {
            width: parent.width
            visible: !!root.hostWidget && root.hostWidget.preferencesSaveFailed
            text: root.words.settingsError
            textFormat: Text.PlainText
            wrapMode: Text.Wrap
            color: Color.urgent
            font.pixelSize: Style.font.caption
          }
          Text {
            width: parent.width
            visible: !!root.hostWidget && (root.hostWidget.transferBusy || root.hostWidget.transferError !== "")
            text: visible ? (root.hostWidget.transferBusy ? root.words.movingWindow : root.words[root.hostWidget.transferError]) : ""
            textFormat: Text.PlainText
            wrapMode: Text.Wrap
            color: root.hostWidget && root.hostWidget.transferError !== "" ? Color.urgent : root.barForeground
            font.pixelSize: Style.font.caption
          }

          Rectangle { width: parent.width; height: 1; color: Qt.alpha(root.barForeground, 0.12) }

          Choice.SearchableDropdown {
            uiScale: root.uiScale
            id: languagePicker
            width: parent.width
            label: root.language === "en" ? "Language" : root.words.language + " / Language"
            value: root.hostWidget ? root.hostWidget.languageSetting : "auto"
            options: I18n.options(root.language, root.hostWidget ? root.hostWidget.detectedLanguage : "en")
            foreground: root.barForeground
            accent: root.accent
            placeholderText: root.words.search
            emptyText: root.words.noMatches
            hasCursor: root.selectedIndex === root.languageIndex
            onHovered: function(value) { selection.hover(root.languageIndex, value); }
            onChanged: function(value) {
              if (root.hostWidget) root.hostWidget.setLanguage(value);
              languagePicker.value = Qt.binding(function() { return root.hostWidget ? root.hostWidget.languageSetting : "auto"; });
            }
          }

          Text {
            width: parent.width
            text: root.hostWidget && root.hostWidget.languageSaveFailed ? root.words.saveError
              : I18n.format(root.words.detected, { language: I18n.nativeName(root.hostWidget ? root.hostWidget.detectedLanguage : "en") })
            textFormat: Text.PlainText
            wrapMode: Text.Wrap
            color: root.hostWidget && root.hostWidget.languageSaveFailed ? Color.urgent : root.barForeground
            opacity: 0.7
            font.pixelSize: Style.font.caption
          }

          Ui.Button {
            width: parent.width
            text: root.words.appearance
            accent: root.accent
            bordered: true
            hasCursor: root.selectedIndex === root.appearanceIndex
            onHovered: function(value) { selection.hover(root.appearanceIndex, value); }
            onClicked: root.openAppearance()
          }

          Ui.Button {
            width: parent.width
            text: root.words.scaling
            accent: root.accent
            bordered: true
            hasCursor: root.selectedIndex === root.scalingIndex
            onHovered: function(value) { selection.hover(root.scalingIndex, value); }
            onClicked: root.openScaling()
          }

          Ui.Button {
            width: parent.width
            text: root.words.labels
            accent: root.accent
            bordered: true
            hasCursor: root.selectedIndex === root.labelsIndex
            onHovered: function(value) { selection.hover(root.labelsIndex, value); }
            onClicked: root.openLabels()
          }

          Text {
            visible: !!root.hostWidget && root.hostWidget.hintsSaveFailed
            width: parent.width
            text: root.words.saveError
            textFormat: Text.PlainText
            wrapMode: Text.Wrap
            color: Color.urgent
            font.pixelSize: Style.font.caption
          }

          Text {
            visible: !!root.hostWidget && root.hostWidget.updatesSaveFailed
            width: parent.width
            text: root.words.settingsError
            textFormat: Text.PlainText
            wrapMode: Text.Wrap
            color: Color.urgent
            font.pixelSize: Style.font.caption
          }

          Text {
            visible: !!root.hostWidget && root.hostWidget.autoUpdates && root.hostWidget.updateStatus === "failed"
            width: parent.width
            text: root.words.updateFailed
            textFormat: Text.PlainText
            wrapMode: Text.Wrap
            color: Qt.alpha(root.barForeground, 0.7)
            font.pixelSize: Style.font.caption
          }

          Item {
            width: parent.width
            height: hintsToggle.height
            LayoutMirroring.enabled: false
            HintsToggle {
              id: hintsToggle
              anchors.left: parent.left
              words: root.words
              hintsEnabled: root.hintsEnabled
              automatic: !root.hostWidget || root.hostWidget.hints.mode === "auto"
              remaining: root.hostWidget ? root.hostWidget.hints.remaining : 100
              hintWidth: scroll.width
              foreground: root.hintsEnabled ? root.accent : Qt.alpha(root.barForeground, 0.65)
              accent: root.accent
              hasCursor: root.selectedIndex === root.hintsIndex
              onHovered: function(value) { selection.hover(root.hintsIndex, value); }
              onClicked: if (root.hostWidget) root.hostWidget.toggleHints()
            }
            AuthorCredit {
              id: authorCredit
              anchors.right: parent.right
              anchors.verticalCenter: parent.verticalCenter
              text: root.words.author
              foreground: root.barForeground
            }
            Item {
              anchors.left: hintsToggle.right
              anchors.right: authorCredit.left
              anchors.margins: Style.space(8)
              height: parent.height
              UpdateSwitch {
                id: updatesToggle
                anchors.left: parent.left
                anchors.verticalCenter: parent.verticalCenter
                width: Math.min(implicitWidth, parent.width)
                text: root.words.autoUpdates
                checked: !root.hostWidget || root.hostWidget.autoUpdates
                foreground: root.barForeground
                accent: root.accent
                hasCursor: root.selectedIndex === root.updatesIndex
                onHovered: function(value) { selection.hover(root.updatesIndex, value); }
                onClicked: root.requestUpdatesToggle()
                PanelHint {
                  hostWidget: root.hostWidget
                  requested: updatesToggle.pointerHovered && !updateConfirmation.opened
                  text: root.words.autoUpdatesHint
                  maximumWidth: scroll.width
                }
              }
            }
          }
        }
      }
      UpdateConfirmation {
        id: updateConfirmation
        width: catcher.width / root.uiScale
        height: catcher.height / root.uiScale
        scale: root.uiScale
        transformOrigin: Item.TopLeft
        words: root.words
        rtl: root.rtl
        foreground: root.barForeground
        accent: root.accent
        onCanceled: catcher.forceActiveFocus()
        onConfirmed: {
          if (root.hostWidget && root.hostWidget.autoUpdates) root.hostWidget.toggleUpdates();
          catcher.forceActiveFocus();
        }
      }
    }
  }
}
