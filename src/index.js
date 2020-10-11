import React from 'react';
import ReactDOM from 'react-dom';
import * as ac from './reducers';
import App from './views/App';
import registerServiceWorker from './registerServiceWorker';
import { initMouseOverlay } from './debug/mouseDebug';
import { createStore, applyMiddleware, compose } from 'redux';
import { ActionCreators } from 'redux-undo';
import thunk from 'redux-thunk';
import debounce from 'lodash.debounce';
import isEqual from 'lodash.isequal';

const searchParams = new URLSearchParams(window.location.search);
if (searchParams.has('mouseDebug')) {
  // Useful when running automated tests
  initMouseOverlay();
}

const composeEnhancers =
  window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;
var store = createStore(ac.default, composeEnhancers(applyMiddleware(thunk)));

let lastSavedDiagram = {};

function dispatch(action) {
  if (!action) {
    return;
  }

  return store.dispatch(action);
}

// Either create a new diagram or load an existing one
const { pathname } = window.location;
const idMatch = pathname.match(/^\/([0-9a-zA-Z]{1,})$/);
let revision = parseInt(searchParams.get('revision') || '', 10);
if (idMatch) {
  dispatch(ac.loadDiagram(idMatch[1], revision > 0 ? revision : undefined));
} else {
  createNewDiagram();
}

function createNewDiagram() {
  const defaultDiagram = {
    objects: [
      { id: 'o1', name: 'Foo' },
      { id: 'o2', name: 'Bar' },
    ],
    messages: [{ id: 'm1', sender: 'o1', receiver: 'o2', name: 'message()' }],
  };
  dispatch(ac.replaceCore(defaultDiagram.objects, defaultDiagram.messages));
  dispatch(ActionCreators.clearHistory());
  dispatch(ac.newDiagram(store.getState().core.present));

  lastSavedDiagram = defaultDiagram;
}

// Setup continouous render
function doRender() {
  ReactDOM.render(
    <App state={store.getState()} dispatch={dispatch} />,
    document.getElementById('root')
  );
}
store.subscribe(doRender);

// Setup continouous save
const debouncedSaveDiagram = debounce((diagram) => {
  if (store.getState().backend.idOnServer) {
    dispatch(ac.saveDiagram(diagram));
  } else {
    dispatch(ac.newDiagram(diagram));
  }
}, 2000);

function saveChanges() {
  const { backend, core } = store.getState();
  if (backend.idOnServer === ac.PENDING) {
    // TODO: Schedule save when we have the id
    return;
  }

  const currentDiagram = { ...core.present };
  if (!isEqual(lastSavedDiagram, currentDiagram)) {
    Promise.resolve(true).then(() => dispatch(ac.markServerRevisionAsOld()));
    debouncedSaveDiagram(currentDiagram);
    lastSavedDiagram = currentDiagram;
  }
}
if (!revision) {
  // We only want to subscribe to changes if we're not showing a specific
  // (and fixed) revision
  store.subscribe(saveChanges);
}

// Initial render
doRender();

// These functions support autoamted end-to-end tests.
// They also enable export and import of diagrams until there's a
// better UI for that
window['sequencediagram_io'] = {
  stringifyCurrentDiagram() {
    return JSON.stringify(store.getState().core.present);
  },
  setCurrentDiagram(stringifiedDiagram) {
    let { objects, messages } = JSON.parse(stringifiedDiagram);
    dispatch(ac.replaceCore(objects, messages));
    return true;
  },
  getVersion() {
    return process.env.REACT_APP_VERSION;
  },
};

// Make this web app run even when offline
registerServiceWorker(
  () => dispatch(ac.showWorksOffline()),
  () => dispatch(ac.showNewContentAvailable())
);
