import * as ac from "./../reducers";
import React from "react";
import moveHelper from "./utils/componentMoveHelper";
import Name from "./Name";
import RemoveButton from "./RemoveButton";
import devUtils from "./../devUtils";
import {
  OBJECT_NAME_PADDING,
  OBJECT_NAME_FONT_SIZE_PX,
  MESSAGE_START_Y,
} from "./../layouter";
import {
  hoverHelper,
  hoverLifelineHelper,
  eventToDiagramCoords,
} from "./utils";

/**
 * Note that 'object' here does not mean 'an instance of a class'.
 * Instead, it is the concrete thing in the diagram with a lifeline that
 * the user can add.
 */
export default function(props) {
  const {
    dispatch,
    object,
    layout,
    objects,
    messages,
    pending,
    controlsColor,
  } = props;

  function lifelineClick(object) {
    return e => {
      let action;
      if (!pending.message || !pending.message.start) {
        action = ac.pendingAddMessage(
          object.key,
          ...eventToDiagramCoords(e),
          "newMessage()"
        );
      } else {
        action = ac.addMessage(
          pending.message.start,
          object.key,
          pending.message.name,
          layout[pending.message.key].index
        );
      }
      dispatch(action);
    };
  }

  const onMouseDown = moveHelper(
    objects,
    messages,
    object,
    e => e.pageX,
    el => el.style.left,
    ac.beginComponentMove,
    ac.endComponentMove,
    ac.rearrangeObjects,
    dispatch,
    pending
  );

  let style = {
    left: layout[object.key].lifelineX,
    top: layout[object.key].top,
    position: "absolute",
    transition: devUtils.transitionIfNotDev("left 0.3s"),
    userSelect: "none",
  };

  return (
    <div style={style} id={object.key} key={object.key}>
      <div
        onMouseDown={onMouseDown}
        {...hoverHelper(pending, dispatch, object.key)}
        style={{
          background: "#ffe761",
          padding: `${OBJECT_NAME_PADDING.TOP_BOTTOM}px ${OBJECT_NAME_PADDING.LEFT_RIGHT}px`,
          transform: "translateX(-50%)",
          position: "relative",
          borderRadius: 2,
          fontSize: `${OBJECT_NAME_FONT_SIZE_PX}px`,
        }}
      >
        <RemoveButton
          controlsColor={controlsColor}
          keyToRemove={object.key}
          dispatch={dispatch}
          pending={pending}
          {...hoverHelper(pending, dispatch, object.key)}
        />
        <Name component={object} pending={pending} dispatch={dispatch} />
      </div>
      <div
        {...hoverLifelineHelper(dispatch, object.key)}
        onClick={lifelineClick(object)}
        style={{ textAlign: "center", transform: "translateX(-50%)" }}
      >
        <div
          style={{
            display: "inline-block",
            borderLeft: "1px dashed #999",
            width: "1px",
            height: layout["height"] - MESSAGE_START_Y,
          }}
        />
      </div>
    </div>
  );
}
