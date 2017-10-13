import React from 'react';
import ReactDOM from 'react-dom';
import * as ac from './reducers';
import App from './views/App';
import registerServiceWorker from './registerServiceWorker';
import { initMouseOverlay } from './debug/mouseDebug';
import { createStore, bindActionCreators } from 'redux';
import { ActionCreators } from 'redux-undo';
import { serialize, deserialize } from './serialize';

// Enable with "REACT_APP_MOUSE_DEBUG=1 npm start"
// Useful when running automated tests
if (new URLSearchParams(window.location.search).has('mouseDebug')) {
  initMouseOverlay();
}

var store = createStore(
  ac.default,
  undefined,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
function dispatch(action) {
  if (!action) {
    return;
  }

  return store.dispatch(action);
}
const boundActionCreators = bindActionCreators(ac, dispatch);

const defaultDiagram = '#o1,Foo;o2,Bar;m1,o1,o2,message()';

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
  let args = [...present.objects, ...present.messages];
  return serialize(args);
}

function renderAndSerialize() {
  ReactDOM.render(
    <App state={store.getState()} dispatch={dispatch} />,
    document.getElementById('root')
  );

  const result = serializeState();
  window.location.hash = result;
}
store.subscribe(renderAndSerialize);
renderAndSerialize();

registerServiceWorker(
  boundActionCreators.showWorksOffline,
  boundActionCreators.showNewContentAvailable
);
