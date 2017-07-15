import { removeComponent } from './../reducers'
import React from 'react'

export default function(props) {
    const { keyToRemove, dispatch, pending, rightOffset } = props;

    function handleMouseDown(e) {
        // We don't want the parent div to receive any mouse down event if
        // the remove button is clicked
        e.stopPropagation();
        e.preventDefault();
    }

    const color = (pending.hoveredComponentKey === keyToRemove || pending.componentMovedKey === keyToRemove ? 'black' : 'transparent');
    const style={
        position: 'absolute',
        right: -20 + rightOffset,
        top: '-19px',
        width: '30px',
        height: '30px',
        textAlign: 'center',
        lineHeight: '30px',
        background: 'transparent',
        borderRadius: '15px',
        border: '1px dotted ' + color,
        color: color,
        display: 'block',
    }

    return (<div className="remove-button" id={'remove-' + keyToRemove} onMouseDown={handleMouseDown} style={style} onClick={() => dispatch(removeComponent(keyToRemove))}>&#10006;</div>);
}
