import { combineReducers } from "redux";
import undoable from "redux-undo";

// Helper functions

function getNextId(components) {
  // Doesn't need to be "highest" unused, but it's easy to implement
  let highestUsedId = 0; // Lowest allowed id is 1
  components.forEach(component => {
    const id = parseInt(component.id.substring(1), 10);
    if (id > highestUsedId) {
      highestUsedId = id;
    }
  });
  return highestUsedId + 1;
}

function doRenameComponent(components, id, newName) {
  return components.map(component => {
    if (component.id === id) {
      return { ...component, name: newName };
    } else {
      return { ...component };
    }
  });
}

function doAddComponentAndAssignKey(
  components,
  idPrefix,
  newComponent,
  insertIndex
) {
  let newComponents = [...components];
  let newComponentWithKey = {
    ...newComponent,
    id: idPrefix + getNextId(components),
  };

  if (insertIndex !== undefined) {
    newComponents.splice(insertIndex, 0, newComponentWithKey);
  } else {
    newComponents.push(newComponentWithKey);
  }

  return newComponents;
}

export function addObject(name) {
  return { type: "ADD_OBJECT", newComponent: { name } };
}

export function removeComponent(id) {
  return { type: "REMOVE_COMPONENT", id };
}

export function replaceCore(objects, messages) {
  return { type: "REPLACE_CORE", objects, messages };
}

export function rearrangeObjects(objects) {
  return { type: "REARRANGE_OBJECTS", objects };
}

export function renameComponent(id, newName) {
  return { type: "RENAME_COMPONENT", id, newName };
}

export function addMessage(start, end, name, insertIndex) {
  return {
    type: "ADD_MESSAGE",
    newComponent: { start, end, name },
    insertIndex,
  };
}

export function replaceMessage(message) {
  return { type: "REPLACE_MESSAGE", message };
}

export function toggleMessageLineStyle(id) {
  return { type: "TOGGLE_MESSAGE_LINE_STYLE", id };
}

export function toggleMessageArrowStyle(id) {
  return { type: "TOGGLE_MESSAGE_ARROW_STYLE", id };
}

export function flipMessageDirection(id) {
  return { type: "FLIP_MESSAGE_DIRECTION", id };
}

export function rearrangeMessages(messages) {
  return { type: "REARRANGE_MESSAGES", messages };
}

function objects(state = [], action) {
  switch (action.type) {
    case "ADD_OBJECT":
      return doAddComponentAndAssignKey(state, "o", action.newComponent);
    case "REMOVE_COMPONENT":
      return state.filter(object => object.id !== action.id);
    case "RENAME_COMPONENT":
      return doRenameComponent(state, action.id, action.newName);
    case "REPLACE_CORE":
      return [...action.objects];
    case "REARRANGE_OBJECTS":
      return [...action.objects];
    default:
      return state;
  }
}

function messages(state = [], action) {
  switch (action.type) {
    case "ADD_MESSAGE":
      return doAddComponentAndAssignKey(
        state,
        "m",
        action.newComponent,
        action.insertIndex
      );
    case "REMOVE_COMPONENT":
      const id = action.id;
      return state.filter(
        message =>
          message.id !== id && message.start !== id && message.end !== id
      );
    case "RENAME_COMPONENT":
      return doRenameComponent(state, action.id, action.newName);
    case "REPLACE_MESSAGE":
      return state.map(message => {
        if (message.id === action.message.id) {
          return { ...action.message };
        } else {
          return { ...message };
        }
      });
    case "REPLACE_CORE":
      return [...action.messages];
    case "TOGGLE_MESSAGE_LINE_STYLE":
      return state.map(message => {
        if (message.id === action.id) {
          return { ...message, isReply: message.isReply ? undefined : true };
        } else {
          return { ...message };
        }
      });
    case "TOGGLE_MESSAGE_ARROW_STYLE":
      return state.map(message => {
        if (message.id === action.id) {
          return { ...message, isAsync: message.isAsync ? undefined : true };
        } else {
          return { ...message };
        }
      });
    case "REARRANGE_MESSAGES":
      return [...action.messages];
    case "FLIP_MESSAGE_DIRECTION":
      return state.map(message => {
        if (message.id === action.id) {
          return { ...message, start: message.end, end: message.start };
        } else {
          return { ...message };
        }
      });
    default:
      return state;
  }
}

// The core state is the "main" state, i.e. the state that is undoable.
// Basically everything in the URL fragment that we deserialize
// Example of things NOT found here are UI state and pending components
export default undoable(combineReducers({ objects, messages }));
