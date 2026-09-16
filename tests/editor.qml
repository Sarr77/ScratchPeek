import QtQuick
import QtQuick.Window
import Quickshell
import qs.Commons
import "ScratchPeek" as Plugin
import "ScratchPeek/Appearance.js" as Appearance
import "ScratchPeek/I18n.js" as I18n

ShellRoot {
  id: testRoot
  function check(value, message) { if (!value) throw new Error(message); }
  function find(item, name) {
    if (item.objectName === name) return item;
    for (var i = 0; i < item.children.length; i++) {
      var result = find(item.children[i], name);
      if (result) return result;
    }
    return null;
  }
  QtObject {
    id: host
    property var bar: null
    property var savedAppearance: Appearance.normalize({})
    property var appearance: savedAppearance
    property string themeId: "tokyo-night"
    property color themeAccent: "#7AA2F7"
    readonly property color accent: Appearance.resolve(appearance, themeId, String(themeAccent))
    property real uiScale: 1
    property string language: "en"
    readonly property var words: I18n.words(language)
    property string workspaceName: "scratchpad"
    property string statusDescription: "active here"
    property var scratchpadState: ({status:"here",count:3,windows:[{app:"chromium"},{app:"discord"},{app:"spotify"}]})
    property bool rejectSave: false
    function previewAppearance(values) { appearance = Appearance.merge(savedAppearance, values); }
    function cancelAppearance() { appearance = savedAppearance; }
    function saveAppearance(values) {
      if (rejectSave) return false;
      savedAppearance = Appearance.merge(savedAppearance, values);
      appearance = savedAppearance;
      return true;
    }
  }
  Window {
    id: window
    visible: true
    width: 420; height: 1080
    color: Color.popups.background
    Plugin.AppearanceEditor { id: editor; x: 16; y: 16; width: parent.width-32; hostWidget: host }
  }
  Timer {
    interval: 500; running: true
    onTriggered: {
      try {
        editor.begin();
        testRoot.check(!editor.colorsExpanded, "settings must start collapsed");
        testRoot.check(editor.mode === "adaptive" && String(host.accent) === "#ef98f5", "default adapted color");
        testRoot.check(testRoot.find(editor,"colorPlane").y < testRoot.find(editor,"hexInput").parent.y, "palette must stay first");
        editor.changeRule("theme", "theme", "");
        testRoot.check(String(host.accent) === "#7aa2f7", "exact theme preview");
        editor.tipStyle = "compact";
        testRoot.find(editor,"hexInput").text = "#zz";
        editor.validHex = false;
        var restore = testRoot.find(editor,"restoreSavedColorButton");
        testRoot.check(restore.text === "Restore saved color · #EF98F5", "button shows saved color, not theme accent");
        restore.clicked();
        testRoot.check(editor.validHex && editor.mode === "adaptive", "restore repairs invalid input and restores mode");
        testRoot.check(String(host.accent) === "#ef98f5" && editor.tipStyle === "compact", "restore changes color without resetting tooltip draft");
        editor.cancel();
        testRoot.check(String(host.accent) === "#ef98f5", "cancel restores saved default");
        editor.begin();
        editor.colorsExpanded = true;
        editor.choosePreset({color:"#ff8800"});
        editor.editPreset("");
        testRoot.find(editor,"presetNameInput").text = "Amber";
        editor.savePreset();
        testRoot.check(editor.draft.colorPresets.length === 1, "preset draft added");
        testRoot.check(host.savedAppearance.colorPresets.length === 0, "preset not saved before Apply");
        var id = editor.selectedPresetId;
        testRoot.find(editor,"restoreSavedColorButton").clicked();
        testRoot.check(editor.draft.colorPresets.length === 1 && String(host.accent) === "#ef98f5", "restore preserves unsaved preset");
        editor.choosePreset(editor.draft.colorPresets[0]);
        editor.editPreset(id);
        testRoot.find(editor,"presetNameInput").text = "Warm amber";
        editor.savePreset();
        editor.apply();
        testRoot.check(host.savedAppearance.colorPresets[0].name === "Warm amber", "rename and Apply persist");
        testRoot.check(String(host.accent) === "#ff8800", "Apply persists custom color");
        editor.begin();
        editor.editPreset(id); editor.deletePreset();
        testRoot.check(editor.draft.colorPresets.length === 0, "delete in draft");
        editor.cancel();
        testRoot.check(host.savedAppearance.colorPresets.length === 1, "Cancel undoes deletion");
        editor.begin();
        host.themeId = "hackerman"; host.themeAccent = "#82FB9C";
        testRoot.check(editor.mode === "adaptive" && String(host.accent) === "#82fb9c", "theme change updates open editor");
        host.themeId = "tokyo-night"; host.themeAccent = "#7AA2F7";
        testRoot.check(editor.mode === "custom" && String(host.accent) === "#ff8800", "return restores theme choice");
        testRoot.check(editor.savedColor === "#FF8800", "restore target follows last Apply");
        host.rejectSave = true;
        editor.choosePreset({color:"#123456"}); editor.apply();
        testRoot.check(editor.saveFailed, "failed save remains editable");
        testRoot.check(host.savedAppearance.themeColors["tokyo-night"].color === "#FF8800", "failed save preserves disk state");
        host.rejectSave = false; editor.cancel();
        host.language = "pl"; editor.begin();
        testRoot.check(testRoot.find(editor,"colorModePicker").options[0].label === "Dopasowany (domyślny)", "translated controls");
        editor.changeRule("adaptive", "theme", "");
        editor.apply(); editor.begin();
        console.info("SCRATCHPEEK_EDITOR_PASS");
        var destination = Quickshell.env("SCRATCHPEEK_EDITOR_IMAGE");
        if (destination) editor.grabToImage(function(result) { result.saveToFile(destination); Qt.quit(); });
        else Qt.quit();
      } catch (error) { console.error("SCRATCHPEEK_EDITOR_FAIL: " + error); Qt.quit(); }
    }
  }
}
