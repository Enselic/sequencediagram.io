import React from 'react';
import * as ac from './../reducers';
import nameBackground from './pngs/name-background.png';

export default function Name(props) {
  const { pending, dispatch, component, showBackground } = props;

  // pending.componentRenamed && pending.componentRenamed.id === message.id

  function handleKeyDown(e) {
    const Ret = 13;
    if (e.keyCode === Ret) {
      commit();
    }
  }

  function onRef(el) {
    if (
      el &&
      props.pending.componentRenamed &&
      props.pending.componentRenamed.preselect
    ) {
      if (document.activeElement !== el) {
        el.focus();
        el.select();
      }
    }
  }

  function commit() {
    if (pending.componentRenamed) {
      dispatch(
        ac.renameComponent(component.id, pending.componentRenamed.newName)
      );
      dispatch(ac.escapePendingOperation());
    }
  }

  function onChange(e) {
    dispatch(ac.editComponentName(component.id, e.target.value, false));
  }

  if (
    pending &&
    pending.componentRenamed &&
    pending.componentRenamed.id === component.id
  ) {
    const value = pending.componentRenamed.newName;
    return (
      <input
        style={Object.assign(
          { pointerEvents: 'auto' },
          showBackground ? { margin: 10 } : null
        )}
        ref={onRef}
        size={value ? value.length : 1}
        type="text"
        value={value}
        onKeyDown={handleKeyDown}
        onChange={onChange}
        onBlur={commit}
      />
    );
  } else {
    return (
      <div
        style={
          showBackground && {
            display: 'inline-block',
            borderImage: `url(${nameBackground}) 10 fill repeat`,
            borderWidth: 10,
            borderStyle: 'solid',
            pointerEvents: 'auto',
          }
        }
      >
        {component.name}
      </div>
    );
  }
}
