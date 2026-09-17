import QtQuick
import QtQuick.Window
import Quickshell
import qs.Commons
import "ScratchPeek" as Plugin
import "ScratchPeek/Transfers.js" as Transfers
import "ScratchPeek/I18n.js" as I18n

ShellRoot {
  id: testRoot
  property int step: 0
  property int ticks: 0
  property var commands: []
  property int completions: 0
  function check(value,message) { if (!value) throw new Error(message); }
  function win(name,group) { return {address:"0x123",mapped:true,workspace:{name:name},grouped:group}; }
  function plan() { return Transfers.plan(transfer.clients,"0x123","scratchpad","2",[{value:"2"}],true); }
  function find(item,name) {
    if (item.objectName === name) return item;
    for (var i=0; i<item.children.length; i++) { var result=find(item.children[i],name); if (result) return result; }
    return null;
  }
  Plugin.WindowTransfer {
    id: transfer
    clients: [testRoot.win("special:scratchpad",["0x123","0x456"])]
    dispatch: function(command) { testRoot.commands = testRoot.commands.concat([command]); }
    refresh: function() {}
    onCompleted: testRoot.completions++
  }
  QtObject {
    id: host
    property var words: I18n.words("en")
    property color accent: "#EF98F5"
    property real uiScale: 1
    property string defaultDestination: "2"
    property var destinationOptions: [{value:"1",label:"Workspace 1",description:"DP-1"},
      {value:"2",label:"Workspace 2",description:"DP-3 · Current"}, {value:"name:Design",label:"Workspace Design"}]
    property bool transferBusy: transfer.busy
    property string transferError: transfer.error
    property var requested: []
    signal transferCompleted()
    function clearTransferError() { transfer.error=""; }
    function extractWindow(address,destination) { requested=[address,destination]; return true; }
  }
  Window {
    visible:true; width:420; height:340; color:Color.popups.background
    Plugin.TransferEditor { id:editor; x:16;y:16;width:parent.width-32;hostWidget:host }
  }
  Timer {
    interval:150;running:true;repeat:true
    onTriggered: {
      try {
        if (testRoot.step===0) {
          testRoot.check(transfer.start(testRoot.plan()),"starts grouped move");
          testRoot.check(!transfer.start(testRoot.plan()),"concurrent request refused");
          testRoot.check(testRoot.commands.length===1 && testRoot.commands[0].includes("w.group:remove(w)"),"atomic command dispatched");
          testRoot.step=1;
        } else if (testRoot.step===1) {
          testRoot.check(testRoot.commands.length===1,"does not repeat the command while waiting");
          transfer.clients=[testRoot.win("special:scratchpad",[])];
          testRoot.step=2;
        } else if (testRoot.step===2) {
          testRoot.check(testRoot.commands.length===1 && testRoot.commands[0].includes('workspace = "2"'),"single command retains exact destination");
          testRoot.check(transfer.busy && testRoot.completions===0,"awaits acknowledged move");
          transfer.clients=[testRoot.win("2",[])];
          testRoot.step=3;
        } else if (testRoot.step===3) {
          testRoot.check(!transfer.busy && testRoot.completions===1,"success after compositor confirms");
          transfer.clients=[testRoot.win("special:scratchpad",["0x123","0x456"])];
          testRoot.commands=[];
          transfer.start(testRoot.plan());
          testRoot.step=4;
        } else if (testRoot.step===4) {
          if (transfer.busy) return;
          testRoot.check(transfer.error==="transferError" && testRoot.commands.length===1,"locked group times out without moving whole group");
          transfer.start(testRoot.plan()); transfer.clients=[];
          testRoot.step=5;
        } else if (testRoot.step===5) {
          testRoot.check(!transfer.busy && transfer.error!=="","closed window aborts request");
          editor.begin({address:"0x123",app:"Test app",title:"Example window"});
          var picker=testRoot.find(editor,"transferDestination");
          testRoot.check(picker.value==="2","defaults to panel monitor workspace");
          picker.changed("name:Design");
          testRoot.find(editor,"transferMoveButton").clicked();
          testRoot.check(host.requested[0]==="0x123" && host.requested[1]==="name:Design","UI passes chosen workspace and exact window");
          host.words=I18n.words("pl");
          testRoot.check(picker.label==="Docelowy workspace","translated destination label");
          testRoot.check(picker.value==="name:Design","locale change preserves selection");
          console.info("SCRATCHPEEK_TRANSFERS_PASS");
          var destination=Quickshell.env("SCRATCHPEEK_TRANSFER_IMAGE");
          stop();
          if (destination) editor.grabToImage(function(result) { result.saveToFile(destination); Qt.quit(); });
          else Qt.quit();
        }
      } catch(error) { console.error("SCRATCHPEEK_TRANSFERS_FAIL: "+error); stop(); Qt.quit(); }
    }
  }
}
