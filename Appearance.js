// Color math and validation shared by the QML picker and tests.
function hex(value) {
  var text = String(value || "").trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(text)) text = text.split("").map(function(c) { return c + c; }).join("");
  return /^[0-9a-f]{6}$/i.test(text) ? "#" + text.toUpperCase() : "";
}

function scale(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 1;
  return Math.round(Math.max(0.8, Math.min(2, value)) * 100) / 100;
}

function merge(current, values) {
  var result = {};
  Object.keys(current || {}).forEach(function(key) { result[key] = current[key]; });
  Object.keys(values || {}).forEach(function(key) { result[key] = values[key]; });
  return normalize(result);
}

function normalize(settings) {
  return { accentColor: hex(settings && settings.accentColor),
    tooltipStyle: settings && settings.tooltipStyle === "compact" ? "compact" : "panel",
    uiScale: scale(settings && settings.uiScale), barScale: scale(settings && settings.barScale) };
}

function fromHsv(h, s, v) {
  if (![h, s, v].every(function(n) { return typeof n === "number" && Number.isFinite(n); })) return "";
  h = ((h % 1) + 1) % 1;
  s = Math.max(0, Math.min(1, s)); v = Math.max(0, Math.min(1, v));
  var c = v * s, x = c * (1 - Math.abs((h * 6) % 2 - 1)), m = v - c;
  var rgb = [[c,x,0],[x,c,0],[0,c,x],[0,x,c],[x,0,c],[c,0,x]][Math.floor(h * 6)];
  return "#" + rgb.map(function(n) { return Math.round((n + m) * 255).toString(16).padStart(2, "0"); }).join("").toUpperCase();
}

function toHsv(value) {
  var normalized = hex(value);
  if (!normalized) return null;
  var r = parseInt(normalized.slice(1,3),16)/255;
  var g = parseInt(normalized.slice(3,5),16)/255;
  var b = parseInt(normalized.slice(5,7),16)/255;
  var max = Math.max(r,g,b), min = Math.min(r,g,b), delta = max-min, h = 0;
  if (delta) {
    if (max === r) h = ((g-b)/delta) % 6;
    else if (max === g) h = (b-r)/delta + 2;
    else h = (r-g)/delta + 4;
    h /= 6;
    if (h < 0) h += 1;
  }
  return {h:h, s:max === 0 ? 0 : delta/max, v:max};
}
