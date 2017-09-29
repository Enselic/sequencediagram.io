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
import { hoverHelper, hoverLifelineHelper } from "./utils";

/**
 * Note that 'object' here does not mean 'an instance of a class'.
 * Instead, it is the concrete thing in the diagram with a lifeline that
 * the user can add.
 */
function DiagramObject(props) {
  const {
    dispatch,
    object,
    layout,
    objects,
    messages,
    pending,
    isHovered,
    onLifelineClick,
    showControls,
  } = props;

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
        onMouseEnter={props.onMouseEnter}
        onMouseMove={props.onMouseMove}
        onMouseLeave={props.onMouseLeave}
      >
        {showControls && (
          <RemoveButton
            isHovered={isHovered}
            keyToRemove={object.key}
            dispatch={dispatch}
            extraStyle={{ transform: "translateX(-50%)" }}
          />
        )}
        <div
          onMouseDown={onMouseDown}
          style={{
            background: "#ffe761",
            padding: `${OBJECT_NAME_PADDING.TOP_BOTTOM}px ${OBJECT_NAME_PADDING.LEFT_RIGHT}px`,
            transform: "translateX(-50%)",
            position: "relative",
            fontSize: `${OBJECT_NAME_FONT_SIZE_PX}px`,
          }}
        >
          <Name component={object} pending={pending} dispatch={dispatch} />
        </div>
      </div>
      <div
        {...hoverLifelineHelper(dispatch, object.key)}
        onClick={onLifelineClick}
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

export default hoverHelper(DiagramObject);
