import * as ac from './../../reducers'

export function hoverHelper(dispatch, key) {
    return {
        onMouseEnter() {
            dispatch(ac.hoverOverComponent(key));
        },
        onMouseMove() {
            // throttle this to fix
            // * React doesn't trigger mouse enter if the mouse static but components move in under the cursor
            //dispatch(ac.hoverOverComponent(key));
        },
        onMouseLeave() {
            dispatch(ac.endHoverOverComponent());
        }
    }
}

export function hoverLifelineHelper(dispatch, key) {
    return {
        onMouseEnter(e) {
            dispatch(ac.mouseEnterLifeline(key, e.clientY - document.getElementById('diagram-root').getBoundingClientRect().top));
        },
        onMouseMove(e) {
            dispatch(ac.mouseEnterLifeline(key, e.clientY - document.getElementById('diagram-root').getBoundingClientRect().top));
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
