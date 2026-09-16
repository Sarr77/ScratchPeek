// Position a scaled dropdown above or below its trigger, within the window.
// Inputs are window pixels except desiredHeight, gap and margin (logical px).
function fit(x, y, width, height, windowWidth, windowHeight, scale, desiredHeight, gap, margin) {
  scale = Number.isFinite(scale) && scale > 0 ? scale : 1;
  if (!(windowWidth > 0 && windowHeight > 0))
    return {x: 0, y: height / scale + gap, width: width / scale, height: desiredHeight};
  var pad = Math.min(margin * scale, Math.min(windowWidth, windowHeight) / 4);
  var gutter = gap * scale;
  var above = Math.max(0, y - gutter - pad);
  var below = Math.max(0, windowHeight - pad - y - height - gutter);
  var wanted = Math.max(1, desiredHeight * scale);
  var placeBelow = below >= wanted || below >= above;
  var popupHeight = Math.max(1, Math.min(wanted, placeBelow ? below : above));
  var popupWidth = Math.max(1, Math.min(width, windowWidth - 2 * pad));
  var left = Math.max(pad, Math.min(x, windowWidth - pad - popupWidth));
  var top = placeBelow ? y + height + gutter : y - gutter - popupHeight;
  top = Math.max(pad, Math.min(top, windowHeight - pad - popupHeight));
  return {x: (left-x)/scale, y: (top-y)/scale, width: popupWidth/scale, height: popupHeight/scale};
}
