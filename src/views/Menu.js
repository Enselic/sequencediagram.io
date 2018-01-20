import React from 'react';
import { ActionCreators } from 'redux-undo';
import ServerState from './ServerState';
import * as ac from './../reducers';
import { boxShadow, backgroundLight } from './common';
import Kbd from './Kbd';
import { exportSvg } from '../exporters/export-svg';
import { getNextId } from './../reducers';

export default function Menu(props) {
  const {
    reduxState,
    dispatch,
    pending,
    showUndo,
    showRedo,
    showTipIfSpace,
    objects,
  } = props;

  function addObjectAndEditName() {
    const newName = 'NewObject';
    const newId = 'o' + getNextId(objects);

    dispatch(ac.addObject(newId, newName));
    dispatch(ac.editComponentName(newId, newName, true /*preselect*/));
  }

  const menuItemProps = {
    style: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: 25,
      padding: '5px 20px',
      color: '#002456',
    },
    className: 'menu-button',
  };

  function Button(props) {
    return (
      <button
        {...menuItemProps}
        disabled={props.disabled}
        onMouseUp={props.onClick}
      >
        {props.children}
      </button>
    );
  }

  const { message } = pending;
  const { idOnServer, fixedRevision } = reduxState.backend;
  const svgName = `sequencediagram.io-${idOnServer}.svg`;

  // Show both Undo and Redo if one of them shows, but enable only the
  // one that can be clicked. We do this so that if the user frantically
  // clicks Undo, he does not accidentally start clicking the Redo button
  // when the Undo button is removed
  const undoOrRedoShown = (showUndo || showRedo) && !message && !fixedRevision;

  const cancelIsShown = !undoOrRedoShown && !!message;

  // To keep UI clean, especially on first visit when we want users to
  // discover the 'Add object' menu item, only show Share button if Undo
  // or Redo is shown
  const showShare = undoOrRedoShown || cancelIsShown;

  // We only want to show the hint if 'Add object' is the only
  // item (otherwise it will point at the wrong item)
  const showTip =
    showTipIfSpace &&
    !showShare &&
    !undoOrRedoShown &&
    !cancelIsShown &&
    !fixedRevision;

  return (
    <div
      style={{
        backgroundColor: backgroundLight,
        boxShadow,
        display: 'flex',
        alignItems: 'baseline',
      }}
    >
      {!fixedRevision && (
        <Button onClick={addObjectAndEditName}>Add object</Button>
      )}
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
      {(showShare || fixedRevision) && (
        <a
          id="download-as-svg"
          {...menuItemProps}
          download={svgName}
          href={`data:image/svg+xml,${exportSvg(reduxState.core.present)}`}
        >
          Download as SVG
        </a>
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
