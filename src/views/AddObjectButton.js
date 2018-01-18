import React from 'react';
import * as ac from './../reducers';
import Name from './Name';
import MessageArrow from './MessageArrow';
import { hoverHelper } from './utils';
import {
  MESSAGE_Y_OFFSET,
  MESSAGE_NAME_FONT_SIZE_PX,
  OBJECT_NAME_PADDING,
  DIAGRAM_PADDING,
} from './../layouter';

function AddObjectButton(props) {
  const { insertIndex, objects, layout, onClick, isHovered, forceShow } = props;
  console.log(forceShow, 'forceShow');

  let left;
  function getEdgeForObject(index, direction) {
    return (
      layout[objects[index].id].lifelineX +
      direction *
        (layout[objects[index].id].objectNameWidth / 2 +
          OBJECT_NAME_PADDING.LEFT_RIGHT)
    );
  }

  if (objects.length === 0) {
    left = DIAGRAM_PADDING.LEFT_RIGHT * 2;
  } else if (insertIndex === 0) {
    left = getEdgeForObject(0, -1);
  } else if (insertIndex === objects.length) {
    left = getEdgeForObject(objects.length - 1, 1);
  } else {
    left =
      (getEdgeForObject(insertIndex - 1, 1) +
        getEdgeForObject(insertIndex, -1)) /
      2;
  }

  const size = OBJECT_NAME_PADDING.TOP_BOTTOM * 1.5;

  return (
    <div
      onClick={onClick}
      onMouseEnter={props.handleHoverMouseEnter}
      onMouseMove={props.handleHoverMouseMove}
      onMouseLeave={props.handleHoverMouseLeave}
      style={{
        position: 'absolute',
        transition: 'left 0.3s, width 0.3s, top 0.3s, height 0.3s',
        left: left - size / 2,
        top:
          DIAGRAM_PADDING.TOP_BOTTOM +
          OBJECT_NAME_PADDING.TOP_BOTTOM -
          size / 2,
        height: size,
        width: size,
      }}
    >
      {(isHovered || forceShow) && (
        <svg width="100%" height="100%" preserveAspectRatio="none">
          <rect x1="0" y1="0" width="100%" height="100%" fill={isHovered ? "#b3ffb3" : "#80ff80"} />
          <line x1="50%" y1="25%" x2="50%" y2="75%" stroke="#000" />
          <line x1="25%" y1="50%" x2="75%" y2="50%" stroke="#000" />
        </svg>
      )}
    </div>

    /*
                  style={{
                    background: '',
                    padding: `${addObjectButtonTopBottomPadding}px ${ /
                      1.9}px`,
                  }}
*/
  );
}

export default hoverHelper(AddObjectButton);
