import React from 'react';
import ReactDOM from 'react-dom';
import * as ac from './reducers';
import App from './views/App';
import registerServiceWorker from './registerServiceWorker';
import { initMouseOverlay } from './debug/mouseDebug';
import { createStore, bindActionCreators } from 'redux';
import { ActionCreators } from 'redux-undo';

if (new URLSearchParams(window.location.search).has('mouseDebug')) {
  // Useful when running automated tests
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

const defaultDiagram = {
  objects: [{ id: 'o1', name: 'Foo' }, { id: 'o2', name: 'Bar' }],
  messages: [{ id: 'm1', sender: 'o1', receiver: 'o2', name: 'message()' }],
};

// Temporary before permalink integration is complete
let { objects, messages } = defaultDiagram;
dispatch(ac.replaceCore(objects, messages));
dispatch(ActionCreators.clearHistory());

// Perform first render and subscribe to changes in the model (Redux store)
function renderAndSerialize() {
  ReactDOM.render(
    <App state={store.getState()} dispatch={dispatch} />,
    document.getElementById('root')
  );
}
store.subscribe(renderAndSerialize);
renderAndSerialize();

// These functions support autoamted end-to-end tests.
// They also enable export and import of diagrams until there's a
// better UI for that
window.sequencediagram_io = {
  stringifyCurrentDiagram() {
    return JSON.stringify(store.getState().core.present);
  },
  setCurrentDiagram(stringifiedDiagram) {
    let { objects, messages } = JSON.parse(stringifiedDiagram);
    dispatch(ac.replaceCore(objects, messages));
    return true;
  },
};

// Make this web app run even when offline
const boundActionCreators = bindActionCreators(ac, dispatch);
registerServiceWorker(
  boundActionCreators.showWorksOffline,
  boundActionCreators.showNewContentAvailable
);
