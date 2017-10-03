import * as ac from "./../reducers";
import React from "react";
import moveHelper from "./utils/componentMoveHelper";
import Name from "./Name";
import MessageArrow from "./MessageArrow";
import { hoverHelper } from "./utils";

function Message(props) {
  const {
    dispatch,
    message,
    msgLayout,
    objects,
    messages,
    pending,
    isPending,
    isMarker,
  } = props;

  let onMouseDown;
  let style;
  if (!isPending) {
    onMouseDown = moveHelper(
      objects,
      messages,
      message,
      e => e.pageY,
      el => el.style.top,
      ac.beginComponentMove,
      ac.endComponentMove,
      ac.rearrangeMessages,
      dispatch,
      pending
    );

    style = {
      pointerEvents: pending.componentMoved ? "none" : "auto",
    };
  } else {
    style = {
      pointerEvents: "none",
    };
  }

  style = {
    ...style,
    position: "absolute",
    textAlign: "center",
    userSelect: "none",
  };

  return (
    <div
      onMouseDown={onMouseDown}
      style={{ ...msgLayout, ...style }}
      id={message.id}
      key={message.id}
      onMouseEnter={props.handleHoverMouseEnter}
      onMouseMove={props.handleHoverMouseMove}
      onMouseLeave={props.handleHoverMouseLeave}
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

export default hoverHelper(Message);
