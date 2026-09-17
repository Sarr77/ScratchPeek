import QtQuick

QtObject {
  property int index: 0
  property bool fromKeyboard: false

  function hover(target, inside) {
    if (inside) {
      fromKeyboard = false;
      index = target;
    } else if (!fromKeyboard && index === target) {
      index = -1;
    }
  }

  function move(delta, lastIndex) {
    fromKeyboard = true;
    index = index < 0 ? (delta < 0 ? lastIndex : 0)
      : Math.max(0, Math.min(lastIndex, index + delta));
  }

  function reset() { fromKeyboard = false; index = 0; }
}
