import React from 'react';
import { ActionCreators } from 'redux-undo';
import ServerState from './ServerState';
import * as ac from './../reducers';
import { boxShadow, backgroundLight } from './common';
import Kbd from './Kbd';

export default function(props) {
  const {
    reduxState,
    dispatch,
    pending,
    showUndo,
    showRedo,
    showTipIfSpace,
  } = props;

  function addObjectAndEditName() {
    const newName = 'NewObject';
    dispatch(ac.addObject(newName));
    // TODO: dispatch(ac.editComponentName(, newName, true /*preselect*/));
  }

  function Button(props) {
    return (
      <button
        className="menu-button"
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          fontSize: 25,
          padding: '5px 20px',
          color: '#002456',
        }}
        disabled={props.disabled}
        onClick={props.onClick}
      >
        {props.children}
      </button>
    );
  }

  const { showShareInfo, message } = pending;

  // Show both Undo and Redo if one of them shows, but enable only the
  // one that can be clicked. We do this so that if the user frantically
  // clicks Undo, he does not accidentally start clicking the Redo button
  // when the Undo button is removed
  const undoOrRedoShown = (showUndo || showRedo) && !message;

  const cancelIsShown = !undoOrRedoShown && message;

  // To keep UI clean, especially on first visit when we want users to
  // discover the 'Add object' menu item, only show Share button if Undo
  // or Redo is shown
  const showShare = undoOrRedoShown || cancelIsShown;

  // We only want to show the hint if 'Add object' is the only
  // item (otherwise it will point at the wrong item)
  const showTip =
    showTipIfSpace && !showShare && !undoOrRedoShown && !cancelIsShown;

  return (
    <div
      style={{
        backgroundColor: backgroundLight,
        boxShadow,
        display: 'flex',
        alignItems: 'baseline',
      }}
    >
      <Button onClick={addObjectAndEditName}>Add object</Button>
      {undoOrRedoShown && (
        <Button
          disabled={!showUndo}
          onClick={() => dispatch(ActionCreators.undo())}
        >
          Undo
        </Button>
      )}
      {undoOrRedoShown && (
        <Button
          disabled={!showRedo}
          onClick={() => dispatch(ActionCreators.redo())}
        >
          Redo
        </Button>
      )}
      {cancelIsShown && (
        <Button
          disabled={!showUndo && !showRedo}
          onClick={() => dispatch(ac.escapePendingOperation())}
        >
          Cancel <Kbd>Esc</Kbd>
        </Button>
      )}
      {showShare && (
        <Button
          disabled={!showUndo && !showRedo}
          onClick={() =>
            dispatch(showShareInfo ? ac.hideShareInfo() : ac.showShareInfo())}
        >
          {showShareInfo ? 'Hide share info' : 'Share'}
        </Button>
      )}
      {showTip && (
        <span className="tip">
          ⇐{' '}
          <span
            style={{
              backgroundColor: '#000',
              padding: '2px 5px',
              color: '#fff',
              borderRadius: 2,
            }}
          >
            Click "Add object" to start
          </span>
        </span>
      )}
      <ServerState reduxState={reduxState} />
    </div>
  );
}
