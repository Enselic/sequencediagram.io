import * as ac from './../reducers';
import React from 'react';
import Name from './Name';
import MessageArrow from './MessageArrow';
import { hoverHelper } from './utils';

function Message(props) {
  const {
    dispatch,
    message,
    msgLayout,
    pending,
    isPending,
    isMarker,
    onComponentMouseDown,
  } = props;

  const handleMouseDown = e => {
    if (onComponentMouseDown) {
      onComponentMouseDown(e, message);
    }
  };

  let style;
  if (!isPending) {
    style = {
      pointerEvents: pending.componentMoved ? 'none' : 'auto',
    };
  } else {
    style = {
      pointerEvents: 'none',
    };
  }

  style = {
    ...style,
    position: 'absolute',
    textAlign: 'center',
    userSelect: 'none',
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{ ...msgLayout, ...style }}
      id={message.id}
      key={message.id}
      {...hoverHelper(pending, dispatch, message.id)}
    >
      <Name
        showBackground={!isMarker}
        component={message}
        pending={pending}
        dispatch={dispatch}
      />

      <MessageArrow
        {...props}
        direction={msgLayout.direction}
        onLineClicked={() => dispatch(ac.toggleMessageLineStyle(message.id))}
        onArrowClicked={() => dispatch(ac.toggleMessageArrowStyle(message.id))}
        onFlipClicked={() => dispatch(ac.flipMessageDirection(message.id))}
      />
    </div>
  );
}

export default Message;
