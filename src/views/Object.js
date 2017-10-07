import React from "react";
import Name from "./Name";
import RemoveButton from "./RemoveButton";
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
    pending,
    isHovered,
    onLifelineClick,
    onComponentMouseDown,
    showControls,
    onRemove,
  } = props;

  const handleMouseDown = e => {
    if (onComponentMouseDown) {
      onComponentMouseDown(e, object);
    }
  };

  let style = {
    left: layout[object.id].lifelineX,
    top: layout[object.id].top,
    transition: layout[object.id].transition,
    position: "absolute",
    userSelect: "none",
  };

  return (
    <div style={style} id={object.id} key={object.id}>
      <div
        onMouseEnter={props.handleHoverMouseEnter}
        onMouseMove={props.handleHoverMouseMove}
        onMouseLeave={props.handleHoverMouseLeave}
        style={{
          transform: "translateX(-50%)",
        }}
      >
        {showControls && (
          <RemoveButton
            isHovered={isHovered}
            idToRemove={object.id}
            onRemove={onRemove}
            extraStyle={{
              position: "absolute",
              bottom: "100%",
              width: undefined,
              left: 0,
              right: 0,
            }}
          />
        )}
        <div
          onMouseDown={handleMouseDown}
          style={{
            background: "#ffe761",
            padding: `${OBJECT_NAME_PADDING.TOP_BOTTOM}px ${OBJECT_NAME_PADDING.LEFT_RIGHT}px`,
            position: "relative",
            fontSize: `${OBJECT_NAME_FONT_SIZE_PX}px`,
          }}
        >
          <Name component={object} pending={pending} dispatch={dispatch} />
        </div>
      </div>
      <div
        {...hoverLifelineHelper(dispatch, object.id)}
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
