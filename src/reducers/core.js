import { combineReducers } from 'redux'
import undoable from 'redux-undo';


// Helper functions

function getNextId(components) {
    // Doesn't need to be "highest" unused, but it's easy to implement
    let highestUsedId = 0; // Lowest allowed id is 1
    components.forEach(component => {
        const id = parseInt(component.key.substring(1), 10);
        if (id > highestUsedId) {
            highestUsedId = id;
        }
    });
    return highestUsedId + 1;
}

function doRenameComponent(components, key, newName) {
    return components.map(component => {
        if (component.key === key) {
            return { ...component, name: newName };
        } else {
            return { ...component };
        }
    });
}

function doAddComponentAndAssignKey(components, keyPrefix, newComponent, insertIndex) {
    let newComponents = [ ...components ];
    let newComponentWithKey = {
        ...newComponent,
        key: keyPrefix + getNextId(components),
    };

    if (insertIndex !== undefined) {
        newComponents.splice(insertIndex, 0, newComponentWithKey);
    } else {
        newComponents.push(newComponentWithKey);
    }

    return newComponents;
}


export function addObject(name) {
    return { type: 'ADD_OBJECT', newComponent: { name } };
}

export function removeComponent(key) {
    return { type: 'REMOVE_COMPONENT', key };
}

export function replaceCore(objects, messages) {
    return { type: 'REPLACE_CORE', objects, messages };
}

export function rearrangeObjects(objects) {
    return { type: 'REARRANGE_OBJECTS', objects };
}

export function renameComponent(key, newName) {
    return { type: 'RENAME_COMPONENT', key, newName };
}

export function addMessage(start, end, name, insertIndex) {
    return { type: 'ADD_MESSAGE', newComponent: { start, end, name }, insertIndex };
}

export function replaceMessage(message) {
    return { type: 'REPLACE_MESSAGE', message };
}

export function toggleMessageLineStyle(key) {
    return { type: 'TOGGLE_MESSAGE_LINE_STYLE', key };
}

export function toggleMessageArrowStyle(key) {
    return { type: 'TOGGLE_MESSAGE_ARROW_STYLE', key };
}

export function flipMessageDirection(key) {
    return { type: 'FLIP_MESSAGE_DIRECTION', key };
}

export function rearrangeMessages(messages) {
    return { type: 'REARRANGE_MESSAGES', messages };
}

function objects(state = [], action) {
    switch (action.type) {
    case 'ADD_OBJECT':
        return doAddComponentAndAssignKey(state, 'o', action.newComponent);
    case 'REMOVE_COMPONENT':
        return state.filter(object => object.key !== action.key);
    case 'RENAME_COMPONENT':
        return doRenameComponent(state, action.key, action.newName);
    case 'REPLACE_CORE':
        return [ ...action.objects ];
    case 'REARRANGE_OBJECTS':
        return [ ...action.objects ];
    default:
        return state;
    }
}

function messages(state = [], action) {
    switch (action.type) {
    case 'ADD_MESSAGE':
        return doAddComponentAndAssignKey(state, 'm', action.newComponent, action.insertIndex);
    case 'REMOVE_COMPONENT':
        const key = action.key;
        return state.filter(message => message.key !== key && message.start !== key && message.end !== key);
    case 'RENAME_COMPONENT':
        return doRenameComponent(state, action.key, action.newName);
    case 'REPLACE_MESSAGE':
        return state.map(message => {
            if (message.key === action.message.key) {
                return { ...action.message };
            } else {
                return { ...message };
            }
        });
    case 'REPLACE_CORE':
        return [ ...action.messages ];
    case 'TOGGLE_MESSAGE_LINE_STYLE':
        return state.map(message => {
            if (message.key === action.key) {
                return { ...message, isReply: message.isReply ? undefined : true };
            } else {
                return { ...message };
            }
        });
    case 'TOGGLE_MESSAGE_ARROW_STYLE':
        return state.map(message => {
            if (message.key === action.key) {
                return { ...message, isAsync: message.isAsync ? undefined : true };
            } else {
                return { ...message };
            }
        });
    case 'REARRANGE_MESSAGES':
        return [ ...action.messages ];
    case 'FLIP_MESSAGE_DIRECTION':
        return state.map(message => {
            if (message.key === action.key) {
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
export default undoable(combineReducers({objects, messages}));
