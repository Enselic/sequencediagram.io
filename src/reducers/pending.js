export function pendingAddMessage(start, y) {
    return { type: 'PENDING_ADD_MESSAGE', start, y };
}

export function beginComponentMove(key) {
    return { type: 'BEGIN_COMPONENT_MOVE', key: key };
}

export function endComponentMove(key) {
    return { type: 'END_COMPONENT_MOVE' };
}

export function editComponentName(key, newName, preselect) {
    return { type: 'EDIT_COMPONENT_NAME', key: key, newName: newName, preselect: preselect };
}

export function escapePendingOperation() {
    return { type: 'ESCAPE_PENDING_OPERATION' };
}

export function hoverOverComponent(key) {
    return { type: 'HOVER_OVER_COMPONENT', key };
}

export function endHoverOverComponent() {
    return { type: 'END_HOVER_OVER_COMPONENT' };
}

export function showShareInfo() {
    return { type: 'SHOW_SHARE_INFO' };
}

export function hideShareInfo() {
    return { type: 'HIDE_SHARE_INFO' };
}

export function mouseEnterLifeline(key, y) {
    return { type: 'MOUSE_ENTER_LIFELINE', key, y };
}

export function mouseLeaveLifeline() {
    return { type: 'MOUSE_LEAVE_LIFEILNE' };
}

/* Various "in-between" states like partially constructed messages
 * or objects-in-movement-info.
 */
export default function(state = {}, action) {
    switch (action.type) {
    case 'PENDING_ADD_MESSAGE':
        return { ...state, message: { start: action.start, y: action.y }};
    case 'ADD_MESSAGE':
        return { ...state, message: undefined };
    case 'BEGIN_COMPONENT_MOVE':
        return { ...state, componentMovedKey: action.key };
    case 'END_COMPONENT_MOVE':
        return { ...state, componentMovedKey: undefined };
    case 'EDIT_COMPONENT_NAME':
        return { ...state, componentRenamed: { key: action.key, newName: action.newName, preselect: action.preselect }};
    case 'ESCAPE_PENDING_OPERATION':
        return { ...state, componentRenamed: undefined, showShareInfo: undefined, message: undefined };
    case 'HOVER_OVER_COMPONENT':
        return { ...state, hoveredComponentKey: action.key};
    case 'END_HOVER_OVER_COMPONENT':
        return { ...state, hoveredComponentKey: undefined };
    case 'SHOW_SHARE_INFO':
        return { ...state, showShareInfo: true };
    case 'HIDE_SHARE_INFO':
        return { ...state, showShareInfo: undefined };
    case 'MOUSE_ENTER_LIFELINE':
        return { ...state, lifelineHoveredKey: action.key, lifelineHoveredY: action.y };
    case 'MOUSE_LEAVE_LIFEILNE':
        return { ...state, lifelineHoveredKey: undefined, lifelineHoveredY: undefined };
    default:
        return state;
    }
}
