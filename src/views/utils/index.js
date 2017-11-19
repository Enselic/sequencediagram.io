import * as ac from './../../reducers';

export function hoverHelper(pending, dispatch, id) {
  return {
    onMouseEnter() {
      dispatch(ac.hoverOverComponent(id));
    },
    onMouseMove() {
      if (pending.hoveredComponentId !== id) {
        dispatch(ac.hoverOverComponent(id));
      }
    },
    onMouseLeave() {
      dispatch(ac.endHoverOverComponent());
    },
  };
}

export function eventToDiagramCoords(event) {
  const boundingClientRect = document
    .getElementById('diagram-root')
    .getBoundingClientRect();
  return [
    event.clientX - boundingClientRect.left,
    event.clientY - boundingClientRect.top,
  ];
}

export function hoverLifelineHelper(dispatch, id) {
  return {
    onMouseEnter(e) {
      dispatch(ac.mouseEnterLifeline(id, ...eventToDiagramCoords(e)));
    },
    onMouseMove(e) {
      dispatch(ac.mouseEnterLifeline(id, ...eventToDiagramCoords(e)));
    },
    onMouseLeave() {
      dispatch(ac.mouseLeaveLifeline());
    },
  };
}

// Thanks Jonathan Marzullo and others from https://stackoverflow.com/a/13348618
export function isChrome() {
  var isChromium = window.chrome,
    winNav = window.navigator,
    vendorName = winNav.vendor,
    isOpera = winNav.userAgent.indexOf('OPR') > -1,
    isIEedge = winNav.userAgent.indexOf('Edge') > -1,
    isIOSChrome = winNav.userAgent.match('CriOS');

  if (isIOSChrome) {
    return true;
  } else if (
    isChromium !== null &&
    isChromium !== undefined &&
    vendorName === 'Google Inc.' &&
    !isOpera &&
    !isIEedge
  ) {
    return true;
  } else {
    return false;
  }
}

export const eatMouseDownCallback = e => {
  // We don't want the parent div to receive any mouse down event if
  // this item is clicked
  e.stopPropagation();
  e.preventDefault();
};

export const eatMouseDown = {
  onMouseDown: eatMouseDownCallback,
};

/**
 * Same as <pre><code>arrayToMap.map(callback)</code></pre>, except order of
 * DOM elements is preserved across calls. This function exists so that CSS
 * animations are not reset when rearranging React components. In the following
 * code, the function makes both 'A' and 'B' animate. With
 * <pre><code>Array.prototype.map</code></pre>, only one of them is animated.
 *
 * <pre><code>
let memoryArray = [];
function renderItems(items) {
  ReactDOM.render(
    <div>
      {mapWithSameDomOrder(items, memoryArray, (item, index) => {
        return (
          <div
            key={item.id}
            style={{
              position: "absolute",
              left: index * 200,
              transition: "left 5s"
            }}
          >
            {item.id}
          </div>
        );
      })}
    </div>,
    document.getElementById("root")
  );
}

renderItems([{ id: "A" }, { id: "B" }]);
setTimeout(renderItems, 500, [{ id: "B" }, { id: "A" }]);

</code></pre>
 *
 * @param {Object[]} arrayToMap Array to map.
 * @param {Object[]} memoryArray Array that contains the previous order. After
 * the method returns, it contains the new order, and should be sent in to the
 * next call of this function. You would typically have this as a property of
 * a React component.
 * @callback {*} callback
 */
export function mapWithSameDomOrder(arrayToMap, memoryArray, callback) {
  // Create new elements
  let idToElement = {};
  arrayToMap.forEach((item, index, array) => {
    const element = callback(item, index, array);
    // Note that items use 'id' but react elements use 'key'
    idToElement[item.id] = element;
  });

  // Rearrange them according to previous order
  let elements = [];
  memoryArray.forEach(prevElement => {
    if (prevElement.key in idToElement) {
      elements.push(idToElement[prevElement.key]);
      delete idToElement[prevElement.key];
    }
  });

  // Finally, append remaining (new) elements
  elements.splice(elements.length, 0, ...Object.values(idToElement));

  // Move 'elements' contents to 'memoryArray'
  memoryArray.splice(0, memoryArray.length, ...elements);

  return elements;
}
