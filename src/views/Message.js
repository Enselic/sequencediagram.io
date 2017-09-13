import * as ac from "./../reducers";
import React from "react";
import moveHelper from "./utils/componentMoveHelper";
import Name from "./Name";
import RemoveButton from "./RemoveButton";
import MessageStartEnd from "./MessageStartEnd";
import MessageArrow from "./MessageArrow";
import devUtils from "./../devUtils";
import { hoverHelper } from "./utils";

export default function(props) {
  const {
    dispatch,
    message,
    msgLayout,
    objects,
    messages,
    pending,
    controlsColor,
    isPending,
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
      transition: devUtils.transitionIfNotDev(
        "left 0.3s, width 0.3s, top 0.3s, height 0.3s"
      ),
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

  // Show controls unless this is a pending message and unless
  // a pending message is in the middle of creation (so that the user
  // can focus on completing the new message without UI noise
  // from controls)
  const showControls =
    !isPending &&
    !pending.message &&
    !(pending.componentMoved && pending.componentMoved.part);
  const selfSent = message.start === message.end;

  return (
    <div
      onMouseDown={onMouseDown}
      style={{ ...msgLayout, ...style }}
      id={message.key}
      key={message.key}
      {...hoverHelper(pending, dispatch, message.key)}
    >
      {showControls && (
        <RemoveButton
          keyToRemove={message.key}
          dispatch={dispatch}
          pending={pending}
          controlsColor={controlsColor}
        />
      )}

      <Name
        showBackground={!isPending}
        component={message}
        pending={pending}
        dispatch={dispatch}
      />

      <MessageArrow
        theKey={message.key}
        isReply={message.isReply}
        isAsync={message.isAsync}
        direction={msgLayout.direction}
        onLineClicked={() => dispatch(ac.toggleMessageLineStyle(message.key))}
        onArrowClicked={() => dispatch(ac.toggleMessageArrowStyle(message.key))}
        onFlipClicked={() => dispatch(ac.flipMessageDirection(message.key))}
      />

      {showControls && (
        <MessageStartEnd {...props} msgLayout={msgLayout} type="start" />
      )}

      {showControls &&
      !selfSent && (
        <MessageStartEnd {...props} msgLayout={msgLayout} type="end" />
      )}
    </div>
  );
}
