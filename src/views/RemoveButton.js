import { removeComponent } from './../reducers'
import React from 'react'
import { eatMouseDown } from './utils'

export default function(props) {
    const { keyToRemove, dispatch, rightOffset, controlsColor } = props;

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
        border: '1px dotted ' + controlsColor,
        color: controlsColor,
        display: 'block',
        cursor: 'default',
    }

    return (<div className="remove-button" id={'remove-' + keyToRemove} {...eatMouseDown} style={style} onClick={() => dispatch(removeComponent(keyToRemove))}>&#10006;</div>);
}
