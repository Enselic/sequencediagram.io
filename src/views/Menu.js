import React from 'react'
import { ActionCreators } from 'redux-undo'
import * as ac from './../reducers'

export default function(props) {
    const { dispatch, pending, showUndo, showRedo, showTipIfSpace } = props;

    function addObjectAndEditName() {
        const newName = "NewObject";
        dispatch(ac.addObject(newName));
        // TODO: dispatch(ac.editComponentName(, newName, true /*preselect*/));
    }

    function Button(props) {
        return (
            <button style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: 20,
                    padding: '3px 12px'
                }} disabled={props.disabled} onClick={props.onClick} >{props.text}</button>
        );
    }

    const { showShareInfo } = pending;

    // Show both Undo and Redo if one of them shows, but enable only the
    // one that can be clicked. We do this so that if the user frantically
    // clicks Undo, he does not accidentally start clicking the Redo button
    // when the Undo button is removed
    const undoOrRedoShown = showUndo || showRedo;

    // To keep UI clean, especially on first visit when we want users to
    // discover the 'Add object' menu item, only show Share button if Undo
    // or Redo is shown
    const showShare = undoOrRedoShown;

    // We only want to show the hint if 'Add object' is the only
    // item (otherwise it will point at the wrong item)
    const showTip = showTipIfSpace && !showShare && !undoOrRedoShown;

    return (
        <div style={{
                backgroundColor: '#eee',
                borderBottom: '1px solid #aaa',
                }}>
            <Button text="Add object" onClick={addObjectAndEditName} />
            { undoOrRedoShown && <Button disabled={!showUndo} text="Undo" onClick={() => dispatch(ActionCreators.undo())} /> }
            { undoOrRedoShown && <Button disabled={!showRedo} text="Redo" onClick={() => dispatch(ActionCreators.redo())} /> }
            { showShare && <Button disabled={!showUndo && !showRedo} text={ showShareInfo ? 'Hide share info' : 'Share' } onClick={() => dispatch(showShareInfo ? ac.hideShareInfo() : ac.showShareInfo())} /> }
            { showTip && <span className="tip">
                ⇐ <span style={{
                        backgroundColor: '#000',
                        padding: '2px 5px',
                        color: '#fff',
                        borderRadius: 2,
                    }}>
                    Click "Add object" to start
                </span>
            </span> }
        </div>
    );
}
