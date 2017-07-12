import React from 'react'
import * as ac from './../reducers'

export default function(props) {
    const { pending, dispatch, component } = props;

    // pending.componentRenamed && pending.componentRenamed.key === message.key

    function handleKeyDown(e) {
        const Ret = 13;
        if (e.keyCode === Ret) {
            commit();
        }
    }

    function onRef(el) {
        if (el && props.pending.componentRenamed && props.pending.componentRenamed.preselect) {
            el.focus();
            el.select();
        }
    }

    function commit() {
        if (pending.componentRenamed) {
            dispatch(ac.renameComponent(component.key, pending.componentRenamed.newName));
            dispatch(ac.escapePendingOperation());
        }
    }

    function onChange(e) {
        dispatch(ac.editComponentName(component.key, e.target.value, false));
    }

    if (pending.componentRenamed && pending.componentRenamed.key === component.key) {
        const value = pending.componentRenamed.newName;
        return <input ref={onRef} size={value ? value.length : 1 } type="text" value={value} onKeyDown={handleKeyDown} onChange={onChange} onBlur={commit}/>
    } else {
        return <div>{component.name}</div>
    }
}
