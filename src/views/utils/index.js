import * as ac from './../../reducers'

export function hoverHelper(pending, dispatch, key) {
    return {
        onMouseEnter() {
            dispatch(ac.hoverOverComponent(key));
        },
        onMouseMove() {
            if (pending.hoveredComponentKey !== key) {
                dispatch(ac.hoverOverComponent(key));
            }
        },
        onMouseLeave() {
            dispatch(ac.endHoverOverComponent());
        }
    }
}

export function eventToDiagramCoords(event) {
    const boundingClientRect = document.getElementById('diagram-root').getBoundingClientRect();
    return [ event.clientX - boundingClientRect.left, event.clientY - boundingClientRect.top ];
}

export function hoverLifelineHelper(dispatch, key) {
    return {
        onMouseEnter(e) {
            dispatch(ac.mouseEnterLifeline(key, eventToDiagramCoords(e)[1]));
        },
        onMouseMove(e) {
            dispatch(ac.mouseEnterLifeline(key, eventToDiagramCoords(e)[1]));
        },
        onMouseLeave() {
            dispatch(ac.mouseLeaveLifeline());
        }
    }
}

export function transferPropsToStyle(object, style) {
    for(let prop in object) {
        if (object.hasOwnProperty(prop)) {
            style[prop] = object[prop];
        }
    }
}

// Thanks Jonathan Marzullo and others from https://stackoverflow.com/a/13348618
export function isChrome() {
  var isChromium = window.chrome,
      winNav = window.navigator,
      vendorName = winNav.vendor,
      isOpera = winNav.userAgent.indexOf("OPR") > -1,
      isIEedge = winNav.userAgent.indexOf("Edge") > -1,
      isIOSChrome = winNav.userAgent.match("CriOS");

  if(isIOSChrome){
      return true;
  } else if(isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && !isOpera && !isIEedge) {
      return true;
  } else {
      return false;
  }
}
