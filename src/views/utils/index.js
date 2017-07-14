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
