export const DIAGRAM_PADDING = { LEFT_RIGHT: 110, TOP_BOTTOM: 90 };
export const OBJECT_NAME_PADDING = { TOP_BOTTOM: 30, LEFT_RIGHT: 50 };
export const OBJECT_SPACING = OBJECT_NAME_PADDING.LEFT_RIGHT * 2.5;
export const OBJECT_NAME_FONT_SIZE_PX = 18;
export const MESSAGE_NAME_FONT_SIZE_PX = 16;
/**
 * Offset required to make the arrow center be y=0.
 */
export const MESSAGE_Y_OFFSET = -10;
export const MESSAGE_SPACING = 62;
export const MESSAGE_MIN_WIDTH = Math.max(
  42 /* Width of self-sent SVG */,
  100 /* enough width for two buttons */
);
export const MESSAGE_START_Y =
  DIAGRAM_PADDING.TOP_BOTTOM +
  OBJECT_NAME_PADDING.TOP_BOTTOM * 2 +
  OBJECT_NAME_FONT_SIZE_PX +
  -MESSAGE_Y_OFFSET +
  MESSAGE_SPACING * 0.48;

// Only allocate this once for smaller GC pressure
const canvasContext = document.createElement("canvas").getContext("2d");
function getTextWidth(fontSize, text) {
  canvasContext.font = `${fontSize}px sans-serif`;
  return canvasContext.measureText(text).width;
}

export function layoutMessageLeftAndWidth(
  layout,
  message,
  overrideSenderX,
  overrideReceiverX
) {
  let senderX;
  let receiverX;
  let transition = "left 0.3s, width 0.3s, top 0.3s, height 0.3s";
  if (overrideSenderX !== undefined) {
    transition = null;
    senderX = overrideSenderX;
  } else if (typeof message.sender === "number") {
    transition = null;
    senderX = message.sender;
  } else {
    const sender = layout[message.sender];
    senderX = sender.lifelineX;
  }

  if (overrideReceiverX !== undefined) {
    transition = null;
    receiverX = overrideReceiverX;
  } else if (typeof message.receiver === "number") {
    transition = null;
    receiverX = message.receiver;
  } else {
    const receiver = layout[message.receiver];
    receiverX = receiver.lifelineX;
  }

  if (message.overrideNoTransition) {
    transition = null;
  }

  let direction = receiverX - senderX;

  let left;
  let width;
  const messageTextWidth =
    layout && layout.getTextWidth
      ? layout.getTextWidth(MESSAGE_NAME_FONT_SIZE_PX, message.name)
      : 100; /* arbitrary */
  if (Math.abs(direction) < 0.5) {
    direction = 0;
    left = senderX;
    const maxLineWidth = 150;
    width = Math.min(
      maxLineWidth,
      Math.max(MESSAGE_MIN_WIDTH, messageTextWidth)
    );
  } else {
    width = Math.max(Math.abs(senderX - receiverX), MESSAGE_MIN_WIDTH);
    if (direction > 0) {
      left = senderX;
    } else {
      left = Math.min(receiverX, senderX - width);
    }
  }

  const approximateLineHeight = 18;
  const carefulnessFactor = 1.4;
  const borderHeightContribution = 20;
  const approximateHeight =
    Math.ceil((messageTextWidth * carefulnessFactor) / width) *
      approximateLineHeight +
    borderHeightContribution;

  return {
    left,
    width,
    direction,
    approximateHeight,
    transition,
  };
}

function layoutObject(getTextWidth, currentX, object) {
  let transition = "left 0.3s";
  const objectNameWidth =
    getTextWidth(OBJECT_NAME_FONT_SIZE_PX, object.name) +
    OBJECT_NAME_PADDING.LEFT_RIGHT * 2;
  let lifelineX = currentX + objectNameWidth / 2;

  if (object.overrideLifelineX) {
    transition = "none";
    lifelineX = object.overrideLifelineX;
  }
  const objectLayout = {
    lifelineX,
    objectNameWidth,
    top: DIAGRAM_PADDING.TOP_BOTTOM,
    transition,
  };
  const newX = currentX + objectNameWidth + OBJECT_SPACING;
  return { newX, objectLayout };
}

function layoutObjects(layout, objects) {
  let currentX = DIAGRAM_PADDING.LEFT_RIGHT;

  objects.forEach((object) => {
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
 * @param objects Array of objects to layout.
 * @param messages Array of messages to layout.
 * @param extraMessage Optional pre-layouted message to take into account. For example a pending message.
 **/
export function layouter(objects, messages, extraMessage) {
  let layout = {};

  // We want subsequent measurements to use the same text measurer
  layout.getTextWidth = getTextWidth;

  const currentX = layoutObjects(layout, objects);

  let currentY = MESSAGE_START_Y;

  function insertExtraMessage(index, addHeight) {
    const leftRightValues = layoutMessageLeftAndWidth(
      layout,
      extraMessage,
      undefined /*overrideSenderX*/,
      extraMessage.receiver /*overrideReceiverX*/
    );

    currentY += leftRightValues.approximateHeight;

    layout[extraMessage.id] = {
      ...leftRightValues,
      top: currentY,
      index,
    };
    currentY += MESSAGE_SPACING;
  }

  function extraMessageToBeInserted() {
    return extraMessage && !(extraMessage.id in layout);
  }

  messages.forEach((message, index) => {
    const leftRightValues = layoutMessageLeftAndWidth(layout, message);

    // Make room for a temporary/pending/extra message if one exists
    if (extraMessageToBeInserted()) {
      if (currentY + leftRightValues.approximateHeight > extraMessage.y) {
        insertExtraMessage(index);
      }
    }

    currentY += leftRightValues.approximateHeight;

    layout[message.id] = {
      ...leftRightValues,
      top: message.overrideTop ? message.overrideTop : currentY,
    };

    currentY += MESSAGE_SPACING;
  });

  if (extraMessageToBeInserted()) {
    insertExtraMessage(messages.length);
  }

  layout.width = currentX;
  layout.height = currentY + MESSAGE_SPACING + DIAGRAM_PADDING.TOP_BOTTOM;

  return layout;
}
