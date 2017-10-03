import devUtils from "./devUtils";

export const DIAGRAM_PADDING = { LEFT_RIGHT: 140, TOP_BOTTOM: 90 };
export const OBJECT_NAME_PADDING = { TOP_BOTTOM: 30, LEFT_RIGHT: 50 };
export const OBJECT_SPACING = OBJECT_NAME_PADDING.LEFT_RIGHT * 3.5;
export const OBJECT_NAME_FONT_SIZE_PX = 18;
export const MESSAGE_SPACING = 100;
export const MESSAGE_MIN_WIDTH = Math.max(
  42 /* Width of self-sent SVG */,
  80 /* enough width for two buttons */
);
export const MESSAGE_START_Y =
  DIAGRAM_PADDING.TOP_BOTTOM +
  OBJECT_NAME_PADDING.TOP_BOTTOM * 2 +
  OBJECT_NAME_FONT_SIZE_PX +
  MESSAGE_SPACING * 0.7;

export function layoutMessageLeftAndWidth(
  layout,
  message,
  overrideStartX,
  overrideEndX
) {
  let startX;
  let endX;
  let transition = devUtils.transitionIfNotDev(
    "left 0.3s, width 0.3s, top 0.3s, height 0.3s"
  );
  if (overrideStartX !== undefined) {
    transition = null;
    startX = overrideStartX;
  } else if (typeof message.start === "number") {
    transition = null;
    startX = message.start;
  } else {
    const start = layout[message.start];
    if (!start) {
      return undefined;
    }
    startX = start.lifelineX;
  }

  if (overrideEndX !== undefined) {
    transition = null;
    endX = overrideEndX;
  } else if (typeof message.end === "number") {
    transition = null;
    endX = message.end;
  } else {
    const end = layout[message.end];
    if (!end) {
      return undefined;
    }
    endX = end.lifelineX;
  }

  let direction = endX - startX;

  let left;
  let width;
  const messageTextWidth =
    layout && layout.getTextWidth
      ? layout.getTextWidth(message.name)
      : 100 /* arbitrary */;
  if (Math.abs(direction) < 0.5) {
    direction = 0;
    left = startX;
    const maxLineWidth = 150;
    width = Math.min(
      maxLineWidth,
      Math.max(MESSAGE_MIN_WIDTH, messageTextWidth)
    );
  } else {
    width = Math.max(Math.abs(startX - endX), MESSAGE_MIN_WIDTH);
    if (direction > 0) {
      left = startX;
    } else {
      left = Math.min(endX, startX - width);
    }
  }

  const approximateLineHeight = 18;
  const carefulnessFactor = 1.4;
  const approximateHeight =
    Math.floor(messageTextWidth * carefulnessFactor / width) *
    approximateLineHeight;

  return {
    left,
    width,
    direction,
    approximateHeight,
    transition,
  };
}

function layoutObject(getTextWidth, currentX, object) {
  const objectNameWidth =
    getTextWidth(object.name) + OBJECT_NAME_PADDING.LEFT_RIGHT;
  const objectLayout = {
    lifelineX: currentX + objectNameWidth / 2,
    top: DIAGRAM_PADDING.TOP_BOTTOM,
  };
  const newX = currentX + objectNameWidth + OBJECT_SPACING;
  return { newX, objectLayout };
}

function layoutObjects(layout, objects) {
  let currentX = DIAGRAM_PADDING.LEFT_RIGHT;

  objects.forEach(object => {
    const { newX, objectLayout } = layoutObject(
      layout.getTextWidth,
      currentX,
      object
    );
    layout[object.id] = objectLayout;
    currentX = newX;
  });

  return currentX;
}

/**
 * Lays out ordered sets of objects and messages.
 * @param getTextWidth Used to measure rendered width of texts
 * @param objects Array of objects to layout.
 * @param messages Array of messages to layout.
 * @param extraMessage Optional pre-layouted message to take into account. For example a pending message.
 **/
export default function(getTextWidth, objects, messages, extraMessage) {
  let layout = {};

  // We want subsequent measurements to use the same text measurer
  layout.getTextWidth = getTextWidth;

  const currentX = layoutObjects(layout, objects);

  let currentY = MESSAGE_START_Y;

  function insertExtraMessage(index) {
    layout[extraMessage.id] = {
      ...layoutMessageLeftAndWidth(
        layout,
        extraMessage,
        undefined /*overrideStartX*/,
        extraMessage.end /*overrideEndX*/
      ),
      top: currentY,
      index,
    };
    currentY += MESSAGE_SPACING;
  }

  function extraMessageToBeInserted() {
    return extraMessage && !(extraMessage.id in layout);
  }

  messages.forEach((message, index) => {
    // Make room for a temporary/pending/extra message if one exists
    if (extraMessageToBeInserted()) {
      if (currentY > extraMessage.y) {
        insertExtraMessage(index);
      }
    }

    const leftRightValues = layoutMessageLeftAndWidth(layout, message);
    if (!leftRightValues) {
      return;
    }

    layout[message.id] = {
      ...leftRightValues,
      top: currentY,
    };

    currentY += MESSAGE_SPACING + leftRightValues.approximateHeight;
  });

  if (extraMessageToBeInserted()) {
    insertExtraMessage(messages.length);
  }

  layout.width = currentX;
  layout.height = currentY + MESSAGE_SPACING + DIAGRAM_PADDING.TOP_BOTTOM;

  return layout;
}
