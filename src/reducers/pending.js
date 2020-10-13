/**
 * @sender The sender of the message (id of Object)
 * @x The current and temporary X position of the receiver. Will
 *    change when the mouse is moved.
 * @name Name.
 * @y The Y position of the new message
 */
export function pendingAddMessage(sender, x, y, name) {
  return { type: "PENDING_ADD_MESSAGE", sender, x, y, name };
}

export function editComponentName(id, newName, preselect) {
  return {
    type: "EDIT_COMPONENT_NAME",
    id: id,
    newName: newName,
    preselect: preselect,
  };
}

export function escapePendingOperation() {
  return { type: "ESCAPE_PENDING_OPERATION" };
}

export function mouseEnterLifeline(id, x, y) {
  return { type: "MOUSE_ENTER_LIFELINE", id, x, y };
}

export function mouseLeaveLifeline() {
  return { type: "MOUSE_LEAVE_LIFEILNE" };
}

export function touchWarn() {
  return { type: "TOUCH_WARN" };
}

/* Various "in-between" states like partially constructed messages
 * or objects-in-movement-info.
 */
export default function (state = {}, action) {
  switch (action.type) {
    case "PENDING_ADD_MESSAGE":
      return {
        ...state,
        message: {
          id: "pendingMessage",
          sender: action.sender,
          receiver: action.x,
          name: action.name,
          y: action.y,
        },
      };
    case "ADD_MESSAGE":
      return { ...state, message: undefined };
    case "REMOVE_COMPONENT":
      return {
        ...state,
        message:
          !state.message || state.message.sender === action.id
            ? undefined
            : state.message,
      };
    case "EDIT_COMPONENT_NAME":
      return {
        ...state,
        componentRenamed: {
          id: action.id,
          newName: action.newName,
          preselect: action.preselect,
        },
      };
    case "ESCAPE_PENDING_OPERATION":
      return {
        ...state,
        componentRenamed: undefined,
        message: undefined,
        touchWarn: undefined,
      };
    case "MOUSE_ENTER_LIFELINE":
      return {
        ...state,
        lifelineHoveredKey: action.id,
        lifelineHoveredX: action.x,
        lifelineHoveredY: action.y,
      };
    case "MOUSE_LEAVE_LIFEILNE":
      return {
        ...state,
        lifelineHoveredKey: undefined,
        lifelineHoveredY: undefined,
      };
    case "REPLACE_CORE":
      return {};
    case "TOUCH_WARN":
      return { ...state, touchWarn: true };
    default:
      return state;
  }
}
