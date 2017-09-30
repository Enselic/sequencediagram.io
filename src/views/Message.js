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
      id={message.key}
      key={message.key}
      onMouseEnter={props.onMouseEnter}
      onMouseMove={props.onMouseMove}
      onMouseLeave={props.onMouseLeave}
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
        onLineClicked={() => dispatch(ac.toggleMessageLineStyle(message.key))}
        onArrowClicked={() => dispatch(ac.toggleMessageArrowStyle(message.key))}
        onFlipClicked={() => dispatch(ac.flipMessageDirection(message.key))}
      />
    </div>
  );
}

export default hoverHelper(Message);
