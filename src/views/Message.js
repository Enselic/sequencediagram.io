import * as ac from './../reducers';
import React from 'react';
import Name from './Name';
import MessageArrow from './MessageArrow';
import { hoverHelper } from './utils';
import { MESSAGE_Y_OFFSET, MESSAGE_NAME_FONT_SIZE_PX } from './../layouter';

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
    top: msgLayout.top + MESSAGE_Y_OFFSET,
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
      onMouseEnter={props.handleHoverMouseEnter}
      onMouseMove={props.handleHoverMouseMove}
      onMouseLeave={props.handleHoverMouseLeave}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            fontSize: `${MESSAGE_NAME_FONT_SIZE_PX}px`,
            left: 0,
            right: 0,
            bottom: '100%',
          }}
        >
          <Name
            showBackground={!isMarker}
            component={message}
            pending={pending}
            dispatch={dispatch}
          />
        </div>
      </div>

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

export default hoverHelper(Message);
