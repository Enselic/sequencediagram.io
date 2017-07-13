import React from 'react';
import ReactDOM from 'react-dom';
import * as ac from './reducers'
import App from './views/App'
import registerServiceWorker from './registerServiceWorker';
import { createStore } from 'redux'
import { ActionCreators } from 'redux-undo';
import { serialize, deserialize } from './serialize'

const debug = 0

var store = createStore(ac.default);
function dispatch(action) {
    if (!action) {
        console.log('not dispatching: ' + action);
        return;
    }

    if (debug) {
        console.log('dispatching ' + JSON.stringify(action));
    }

    return store.dispatch(action);
}

const defaultDiagram = '#o1,Foo;o2,Bar;o3,Baz;m1,o1,o2,foo();m2,o2,o3,bar()';

function setupFromHash(hash) {
    let { objects, messages } = deserialize(hash.substring(1));
    dispatch(ac.replaceCore(objects, messages));
    dispatch(ActionCreators.clearHistory());
}

const hash = window.location.hash;
if (hash.length > 1) {
    setupFromHash(hash);
} else {
    setupFromHash(defaultDiagram);
}

window.addEventListener('keydown', function(e) {
    const z = 90;
    const Esc = 27;

    if (e.ctrlKey && e.keyCode === z) {
        dispatch(e.shiftKey ? ActionCreators.redo() : ActionCreators.undo());
    } else if (e.keyCode === Esc) {
        dispatch(ac.escapePendingOperation());
    }
});

window.addEventListener('hashchange', e => {
    if (!window.location.hash) {
        return;
    }

    if (window.location.hash.substring(1) !== serializeState()) {
        setupFromHash(window.location.hash);
    }
});

function serializeState() {
    const present = store.getState().core.present;
    let args = [ ...present.objects, ...present.messages ];
    return serialize(args);
}

function render() {
    ReactDOM.render(<App defaultDiagram={defaultDiagram} state={store.getState()} dispatch={dispatch} />, document.getElementById('root'));

    const result = serializeState();
    window.location.hash = result;
}
store.subscribe(render);
render();

registerServiceWorker();
