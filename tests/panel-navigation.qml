import QtQuick
import QtQuick.Window
import Quickshell
import qs.Ui as Ui
import "ScratchPeek" as Plugin

ShellRoot {
  id: suite
  function check(value, message) { if (!value) throw new Error(message); }
  function assertEditor(type) {
    check(panel.editing && panel.activeEditor instanceof type, "expected editor active");
    var visible = panel.activeEditor.parent.children.filter(function(item) {
      return item.visible && (item instanceof Plugin.AppearanceEditor || item instanceof Plugin.LabelsEditor
        || item instanceof Plugin.ScalingEditor || item instanceof Plugin.TransferEditor);
    });
    check(visible.length === 1, "exactly one editor visible");
  }
  QtObject {
    id: host
    function updateEntryInline(id, entry) { return true; }
  }
  Ui.PluginBarApi {
    id: bar
    pluginId: "sarr.scratchpeek"; moduleName: pluginId
    shell: host
    layoutConfig: ({left:[{id:pluginId}], center:[], right:[]})
    _moduleWidgets: function() { return [widget]; }
  }
  Plugin.Widget { id: widget; visible: false; bar: bar }
  Window {
    visible: true; width: 840; height: 1040
    Plugin.Details { id: panel; hostWidget: widget; bar: bar }
  }
  Timer {
    interval: 100; running: true; repeat: true
    onTriggered: {
      if (!widget.settingsReady) return;
      stop();
      try {
        panel.open();
        var before = JSON.stringify(widget.savedAppearance);
        panel.openAppearance();
        suite.assertEditor(Plugin.AppearanceEditor);
        var appearance = panel.activeEditor;
        appearance.choosePreset({color:"#123456"});
        panel.openLabels();
        suite.assertEditor(Plugin.LabelsEditor);
        suite.check(!appearance.started, "previous editor stopped observing theme changes");
        suite.check(JSON.stringify(widget.savedAppearance) === before, "switching discards unsaved appearance");
        suite.check(JSON.stringify(Plugin.ScratchState.previewAppearance) === "{}", "appearance preview cleared");
        panel.activeEditor.setText("active", "Temporary label");
        panel.openScaling();
        suite.assertEditor(Plugin.ScalingEditor);
        suite.check(JSON.stringify(Plugin.ScratchState.previewLabels) === "{}", "label preview cleared");
        panel.activeEditor.panelPercent = 125;
        panel.activeEditor.publishPreview();
        panel.openTransfer({address:"0x123", app:"test", title:"Example window"});
        suite.assertEditor(Plugin.TransferEditor);
        suite.check(JSON.stringify(Plugin.ScratchState.previewAppearance) === "{}", "transfer clears scaling preview");
        panel.activeEditor.finished();
        suite.check(!panel.editing, "transfer returns to the list");
        panel.openScaling();
        panel.activeEditor.panelPercent = 125;
        panel.activeEditor.publishPreview();
        panel.activeEditor.apply();
        suite.check(!panel.editing && widget.savedAppearance.uiScale === 1.25, "Apply saves and returns to list");
        panel.openScaling();
        panel.activeEditor.panelPercent = 150;
        panel.activeEditor.publishPreview();
        panel.activeEditor.cancel();
        suite.check(!panel.editing && widget.appearance.uiScale === 1.25, "Cancel restores saved scale");
        panel.openAppearance();
        panel.activeEditor.choosePreset({color:"#654321"});
        panel.close();
        suite.check(!panel.editing && !appearance.started, "closing panel closes the active editor");
        suite.check(JSON.stringify(Plugin.ScratchState.previewAppearance) === "{}", "close discards the preview");
        panel.open();
        suite.check(!panel.editing, "reopening starts with the window list");
        panel.close();
        console.info("SCRATCHPEEK_PANEL_NAVIGATION_PASS"); Qt.quit();
      } catch (error) { console.error("SCRATCHPEEK_PANEL_NAVIGATION_FAIL: " + error); Qt.quit(); }
    }
  }
}
