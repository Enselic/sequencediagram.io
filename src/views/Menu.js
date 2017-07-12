import React from 'react'
import { ActionCreators } from 'redux-undo'
import * as ac from './../reducers'

export default function(props) {
    const { dispatch, pending } = props;

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
                }} onClick={props.onClick} >{props.text}</button>
        );
    }

    const { showShareInfo } = pending;
    return (
        <div style={{
                backgroundColor: '#ccc',
                borderBottom: '1px solid black',
                }}>
            <Button text="Add object" onClick={addObjectAndEditName} />
            <Button text="Undo" onClick={() => dispatch(ActionCreators.undo())} />
            <Button text="Redo" onClick={() => dispatch(ActionCreators.redo())} />
            <Button text={ showShareInfo ? 'Sharing was easy, thanks!' : 'Share' } onClick={() => dispatch(showShareInfo ? ac.hideShareInfo() : ac.showShareInfo())} />
        </div>
    );
}
