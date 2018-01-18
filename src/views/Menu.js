import React from 'react';
import { ActionCreators } from 'redux-undo';
import ServerState from './ServerState';
import * as ac from './../reducers';
import { boxShadow, backgroundLight } from './common';
import Kbd from './Kbd';
import { exportSvg } from '../exporters/export-svg';
import { getNextId } from './../reducers';

export default function(props) {
  const { reduxState, dispatch, pending, showUndo, showRedo } = props;

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
  const undoOrRedoShown = !message && !fixedRevision;

  const cancelIsShown = !undoOrRedoShown && !!message;

  // To keep UI clean, especially on first visit when we want users to
  // discover the 'Add object' menu item, only show Share button if Undo
  // or Redo is shown
  const showShare = undoOrRedoShown || cancelIsShown;

  return (
    <div
      style={{
        backgroundColor: backgroundLight,
        boxShadow,
        display: 'flex',
        alignItems: 'baseline',
      }}
    >
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
      <ServerState reduxState={reduxState} />
    </div>
  );
}
