// Pure transfer planning. Every action targets an explicit client address.
function validAddress(value) { return typeof value === "string" && /^0x[0-9a-f]+$/i.test(value); }
function ordinary(workspace) {
  return workspace && typeof workspace.name === "string" && workspace.name !== ""
    && !/^special(?::|$)/.test(workspace.name);
}
function selector(workspace) {
  if (!ordinary(workspace) || /[\x00-\x1f\x7f]/.test(workspace.name)) return "";
  if (/^[1-9][0-9]*$/.test(workspace.name)) return workspace.name;
  return "name:" + workspace.name;
}
function destinations(workspaces, monitors, screen) {
  var result = [], seen = {};
  function add(workspace, monitor) {
    var value = selector(workspace);
    if (!value || seen[value]) return;
    seen[value] = true;
    result.push({ value: value, name: workspace.name, monitor: monitor || "" });
  }
  (workspaces || []).forEach(function(w) { if (w) add(w, w.monitor); });
  (monitors || []).filter(function(m) { return m && !m.disabled; }).forEach(function(m) { add(m.activeWorkspace, m.name); });
  for (var i = 1; i <= 10; i++) add({name: String(i)}, "");
  result.sort(function(a,b) {
    if (/^[0-9]+$/.test(a.name) && /^[0-9]+$/.test(b.name)) return Number(a.name)-Number(b.name);
    if (/^[0-9]+$/.test(a.name)) return -1;
    if (/^[0-9]+$/.test(b.name)) return 1;
    return a.name.localeCompare(b.name);
  });
  var current = (monitors || []).filter(function(m) { return m && m.name === screen && !m.disabled; })[0];
  return { options: result, current: current ? selector(current.activeWorkspace) : "" };
}
function candidates(clients) {
  var seen = {};
  return (clients || []).filter(function(w) {
    if (!validAddress(w.address) || w.mapped === false || !ordinary(w.workspace) || seen[w.address]) return false;
    seen[w.address] = true;
    return true;
  }).sort(function(a,b) { return String(a.class || a.initialClass || "").localeCompare(String(b.class || b.initialClass || ""))
    || String(a.title || "").localeCompare(String(b.title || "")); });
}
function client(clients, address) {
  return (clients || []).filter(function(w) { return w.address === address && w.mapped !== false; })[0];
}
function focusedCandidate(clients, active, beforePanel, monitors) {
  // A keyboard layer can clear activeToplevel. Only then use the window that
  // was focused when this panel opened, never a different eligible window.
  var address = active || beforePanel;
  if (!validAddress(address)) return "";
  var win = client(clients, address);
  if (!win || !ordinary(win.workspace)) return "";
  if (!(monitors || []).some(function(m) {
    return m && !m.disabled && m.activeWorkspace && m.activeWorkspace.name === win.workspace.name;
  })) return "";
  return address;
}
function grouped(win) { return !!win && Array.isArray(win.grouped) && win.grouped.length > 1; }
function moveCommand(address, destination, lua) {
  if (!validAddress(address) || typeof destination !== "string" || !destination
      || /[\x00-\x1f\x7f]/.test(destination)) return "";
  if (lua) return "hl.dsp.window.move({ window = " + JSON.stringify("address:" + address)
    + ", workspace = " + JSON.stringify(destination) + ", follow = false })";
  if (destination.indexOf(",") >= 0 || destination.indexOf(";") >= 0) return "";
  return "movetoworkspacesilent " + destination + ",address:" + address;
}
function guardedMove(address, source, destination) {
  var move = moveCommand(address,destination,true);
  if (!move || typeof source !== "string" || /[\x00-\x1f\x7f]/.test(source)) return "";
  // Runs synchronously inside Hyprland: IPC snapshots can lag a group change.
  // Direct group removal avoids the focus/warp side effects of moveoutofgroup.
  return 'function() local w = hl.get_window(' + JSON.stringify("address:"+address) + '); '
    + 'if not w or not w.mapped or not w.workspace or w.workspace.name ~= ' + JSON.stringify(source) + ' then return end; '
    + 'if w.group and w.group.size > 1 then if w.group.locked then return end; w.group:remove(w); end; '
    + 'if w.group and w.group.size > 1 then return end; hl.dispatch(' + move + '); end';
}
function plan(clients, address, workspace, destination, options, lua) {
  // Legacy dispatch cannot atomically revalidate membership and separate a tab.
  if (!lua || !validAddress(address) || !/^[A-Za-z0-9_.-]{1,80}$/.test(workspace)) return null;
  var win = client(clients,address), target = "special:" + workspace;
  if (!win || !win.workspace) return null;
  if (destination) {
    if (win.workspace.name !== target || !(options || []).some(function(o) { return o.value === destination; })) return null;
    target = destination.indexOf("name:") === 0 ? destination.slice(5) : destination;
  } else {
    if (!ordinary(win.workspace)) return null;
    destination = target;
  }
  var move = guardedMove(address,win.workspace.name,destination);
  if (!move) return null;
  return { address:address, source:win.workspace.name, target:target, move:move };
}
function progress(job, clients) {
  var win = client(clients,job.address);
  if (!win || !win.workspace) return "error";
  if (win.workspace.name === job.target) return "done";
  if (win.workspace.name !== job.source) return "error";
  return "wait";
}
