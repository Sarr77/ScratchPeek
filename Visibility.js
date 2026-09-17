// Plan from a fresh compositor reply, never the bar's asynchronously cached label.
function plan(monitors, workspace, screen) {
  if (typeof workspace !== "string" || !/^[A-Za-z0-9_.-]{1,80}$/.test(workspace)
      || typeof screen !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(screen) || !Array.isArray(monitors)) return null;
  var monitor = monitors.filter(function(m) { return m && !m.disabled && m.name === screen; })[0];
  if (!monitor || !monitor.activeWorkspace || typeof monitor.activeWorkspace.name !== "string"
      || !monitor.specialWorkspace || typeof monitor.specialWorkspace.name !== "string") return null;
  var ordinary = monitor.activeWorkspace.name, previous = monitor.specialWorkspace.name;
  if (!ordinary || /[\x00-\x1f\x7f]/.test(ordinary + previous)) return null;
  return {screen:screen, workspace:workspace, target:"special:" + workspace,
    ordinary:ordinary, previous:previous, show:previous !== "special:" + workspace};
}

function occupied(clients, job) {
  if (!Array.isArray(clients)) return null;
  return clients.some(function(w) {
    return w && w.mapped !== false && w.workspace && w.workspace.name === job.target;
  });
}

function command(job) {
  // Monitor names remain stable when numeric IDs are reused after reconnect.
  // The operation is idempotent: even a duplicate cannot undo its own result.
  var q = JSON.stringify;
  return 'local m = hl.get_monitor(' + q(job.screen) + '); if not m then return end; '
    + 'local w = m.active_workspace; if not w or w.name ~= ' + q(job.ordinary) + ' then return end; '
    + 'local s = m.active_special_workspace; local current = s and s.name or ""; '
    + (job.show
      ? 'if current == ' + q(job.target) + ' then return end; if current ~= ' + q(job.previous)
        + ' then return end; m:set_special_workspace({workspace = ' + q(job.target) + '})'
      : 'if current == ' + q(job.target) + ' then m:set_special_workspace({}) end');
}

function progress(monitors, job) {
  var current = plan(monitors, job.workspace, job.screen);
  if (!current || current.ordinary !== job.ordinary) return "error";
  return (current.previous === job.target) === job.show ? "done" : "wait";
}
