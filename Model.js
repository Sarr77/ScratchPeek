.import "I18n.js" as I18n
// Pure functions shared by QML and the Node test suite. No shell execution.
function validWorkspace(name) {
  return typeof name === "string" && /^[A-Za-z0-9_.-]{1,80}$/.test(name);
}

function language(setting, locale, fallbackLocale) {
  return I18n.language(setting, locale, fallbackLocale);
}

function words(lang) { return I18n.words(lang); }

function summarize(clients, monitors, workspace, screenName, activeAddress) {
  var result = { status: "unknown", count: 0, windows: [], monitor: "", monitorId: -1, focused: false };
  if (!validWorkspace(workspace) || !Array.isArray(clients) || !Array.isArray(monitors) || !monitors.length)
    return result;
  var fullName = "special:" + workspace;
  var seen = {};
  result.windows = clients.filter(function(client) {
    if (!client || client.mapped === false || !client.workspace || client.workspace.name !== fullName)
      return false;
    if (!/^0x[0-9a-f]+$/i.test(client.address || "") || seen[client.address]) return false;
    seen[client.address] = true;
    return true;
  }).map(function(client) {
    return {
      address: client.address,
      title: String(client.title || ""),
      app: String(client.class || client.initialClass || ""),
      grouped: Array.isArray(client.grouped) && client.grouped.length > 1,
      groupKey: Array.isArray(client.grouped) && client.grouped.length > 1
        ? client.grouped.filter(function(address) { return /^0x[0-9a-f]+$/i.test(address); }).slice().sort().join(",") : "",
      active: client.address === activeAddress
    };
  }).sort(function(a, b) {
    return (a.groupKey || a.app).localeCompare(b.groupKey || b.app) || (a.app + "\n" + a.title + a.address).localeCompare(b.app + "\n" + b.title + b.address);
  });
  var groups = [];
  result.windows.forEach(function(win) {
    if (win.groupKey && groups.indexOf(win.groupKey) < 0) groups.push(win.groupKey);
    win.groupNumber = win.groupKey ? groups.indexOf(win.groupKey) + 1 : 0;
  });
  result.count = result.windows.length;
  for (var i = 0; i < monitors.length; i++) {
    var monitor = monitors[i];
    if (!monitor || monitor.disabled) continue;
    if (monitor.name === screenName) result.monitorId = monitor.id;
    if (monitor.specialWorkspace && monitor.specialWorkspace.name === fullName)
      result.monitor = monitor.name;
  }
  if (result.monitor) result.status = result.monitor === screenName ? "here" : "elsewhere";
  else result.status = result.count ? "hidden" : "empty";
  result.focused = result.status === "here" && result.windows.some(function(w) { return w.active; });
  return result;
}

var labelStates = ["empty", "hidden", "here", "active", "elsewhere", "unknown"];

function normalizeLabels(settings) {
  var style = settings && settings.labelStyle;
  var custom = settings && settings.customLabels;
  var result = {};
  labelStates.forEach(function(key) {
    // Single-line literal text, bounded in length, never interpreted as markup.
    result[key] = custom && typeof custom[key] === "string"
      ? custom[key].replace(/[\r\n\t]+/g, " ").slice(0, 100).trim() : "";
  });
  return {labelStyle: ["short", "explicit", "switch", "custom"].indexOf(style) >= 0 ? style : "short", customLabels: result};
}

function labelTemplates(lang, style) {
  var w = words(lang), result = {};
  labelStates.forEach(function(key) { result[key] = (style === "explicit" ? "Scratchpad: " : "") + w[key]; });
  // These conventional switch labels are deliberately language-independent.
  if (style === "switch") result = {empty:"Scratchpad EMPTY", hidden:"Scratchpad OFF",
    here:"Scratchpad ON", active:"Scratchpad ACTIVE", elsewhere:"Scratchpad ON · {monitor}", unknown:"Scratchpad ?"};
  return result;
}

function statusText(state, lang, settings, workspace) {
  var preferences = normalizeLabels(settings);
  var key = state.status === "here" && state.focused ? "active" : state.status;
  if (labelStates.indexOf(key) < 0) key = "unknown";
  var templates = labelTemplates(lang, preferences.labelStyle === "custom" ? "explicit" : preferences.labelStyle);
  var template = preferences.labelStyle === "custom" && preferences.customLabels[key] ? preferences.customLabels[key] : templates[key];
  function isolate(value) { return I18n.isRtl(lang) ? "\u2066" + value + "\u2069" : value; }
  return I18n.format(template, {monitor: isolate(state.monitor || "?"),
    count: state.status === "unknown" ? "?" : String(state.count), workspace: isolate(workspace || "scratchpad")});
}

function label(state, lang, compact, vertical, settings, workspace) {
  var count = state.status === "unknown" ? "?" : String(state.count);
  var mark = { empty: "○", hidden: "◌", here: "●", elsewhere: "↗", unknown: "?" }[state.status] || "?";
  if (vertical) return mark + "\n" + count;
  if (compact) return mark + " " + count;
  return mark + " " + count + " · " + statusText(state, lang, settings, workspace);
}

function tooltip(state, lang, workspace, settings) {
  var w = words(lang);
  var lines = ["ScratchPeek · " + workspace, statusText(state, lang, settings, workspace)];
  if (state.status === "unknown") lines.push(validWorkspace(workspace) ? w.unknownHelp : w.invalidHelp);
  else if (!state.count) lines.push(workspace === "scratchpad" ? w.emptyHelp : w.customHelp);
  else {
    lines.push(w.windows + ": " + state.count);
    state.windows.slice(0, 12).forEach(function(win) {
      lines.push("• " + (win.app || w.unnamed) + (win.grouped ? " (" + w.grouped + ")" : ""));
    });
    if (state.count > 12) lines.push("+" + (state.count - 12));
  }
  lines.push("", w.clickHelp);
  return lines.join("\n");
}

function toggleCommands(workspace, monitorId, lua) {
  if (!validWorkspace(workspace) || !Number.isInteger(monitorId) || monitorId < 0) return [];
  return lua ? [
    'hl.dsp.focus({ monitor = "' + monitorId + '" })',
    'hl.dsp.workspace.toggle_special("' + workspace + '")'
  ] : ['focusmonitor ' + monitorId, 'togglespecialworkspace ' + workspace];
}

function focusCommand(address, lua) {
  if (!/^0x[0-9a-f]+$/i.test(address || "")) return "";
  return lua ? 'hl.dsp.focus({ window = "address:' + address + '" })' : 'focuswindow address:' + address;
}

function initialSettings(layout, id, fallback) {
  if (!layout) return fallback;
  var sections = ["left", "center", "right"];
  for (var s = 0; s < sections.length; s++) {
    var entries = layout[sections[s]];
    if (!Array.isArray(entries)) continue;
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      if (entry && entry.id === id) return JSON.parse(JSON.stringify(entry));
    }
  }
  return fallback;
}

function mergeSettings(current, values, id) {
  var entry = { id: id };
  Object.keys(current || {}).forEach(function(key) { if (key !== "id") entry[key] = current[key]; });
  Object.keys(values || {}).forEach(function(key) { if (key !== "id") entry[key] = values[key]; });
  return entry;
}

// Calendar time, persisted once: restarting or upgrading never starts a new week.
var hintsWeekMs = 7 * 24 * 60 * 60 * 1000;
function hintState(settings, now) {
  settings = settings || {};
  var mode = ["auto", "on", "off"].indexOf(settings.hintsMode) >= 0 ? settings.hintsMode : "auto";
  var firstSeen = settings.hintsFirstSeenAt;
  if (!Number.isFinite(firstSeen) || firstSeen <= 0) firstSeen = 0;
  var expiresAt = firstSeen ? firstSeen + hintsWeekMs : 0;
  return { mode: mode, firstSeenAt: firstSeen, expiresAt: expiresAt,
    daysLeft: expiresAt ? Math.max(0, Math.min(7, Math.ceil((expiresAt - now) / (24 * 60 * 60 * 1000)))) : 7,
    enabled: mode === "on" || (mode === "auto" && (!expiresAt || now < expiresAt)) };
}
function hintMaintenance(settings, now) {
  var state = hintState(settings, now);
  if (state.mode !== "auto") return {};
  if (!state.firstSeenAt) return { hintsFirstSeenAt: now };
  // Persist expiry so a later clock correction cannot turn hints back on.
  return state.enabled ? {} : { hintsMode: "off" };
}

function toggleShortcut(bindings, workspace) {
  var matches = (bindings || []).filter(function(bind) {
    if (!bind || bind.submap || !bind.key || !Number.isInteger(bind.modmask)) return false;
    // Lua dispatch arguments are opaque IDs. Omarchy supplies this description
    // for its default scratchpad; legacy dispatch identifies the workspace.
    return (bind.dispatcher === "togglespecialworkspace" && bind.arg === workspace)
      || (workspace === "scratchpad" && bind.dispatcher === "__lua" && bind.description === "Toggle scratchpad");
  });
  if (!matches.length) return "";
  var bind = matches[0], keys = [];
  if (bind.modmask & ~(1 | 4 | 8 | 64)) return "";
  if (bind.modmask & 64) keys.push("Super");
  if (bind.modmask & 4) keys.push("Ctrl");
  if (bind.modmask & 8) keys.push("Alt");
  if (bind.modmask & 1) keys.push("Shift");
  keys.push(bind.key.length === 1 ? bind.key.toUpperCase() : bind.key);
  return keys.join(" + ");
}

function monitorLayout(monitors) {
  var items = (monitors || []).filter(function(m) {
    return m && !m.disabled && Number.isFinite(m.x) && Number.isFinite(m.y)
      && m.width > 0 && m.height > 0 && Number.isFinite(m.width) && Number.isFinite(m.height);
  }).map(function(m) {
    var scale = Number.isFinite(m.scale) && m.scale > 0 ? m.scale : 1;
    var rotated = [1, 3, 5, 7].indexOf(m.transform) >= 0;
    return { name: m.name, x: m.x, y: m.y,
      width: (rotated ? m.height : m.width) / scale,
      height: (rotated ? m.width : m.height) / scale };
  });
  if (!items.length) return { items: [], width: 1, height: 1 };
  var left = Math.min.apply(null, items.map(function(m) { return m.x; }));
  var top = Math.min.apply(null, items.map(function(m) { return m.y; }));
  var right = Math.max.apply(null, items.map(function(m) { return m.x + m.width; }));
  var bottom = Math.max.apply(null, items.map(function(m) { return m.y + m.height; }));
  items.forEach(function(m) { m.x -= left; m.y -= top; });
  return { items: items, width: right - left, height: bottom - top };
}
