import devUtils from "./devUtils";

export const DIAGRAM_PADDING = { LEFT_RIGHT: 140, TOP_BOTTOM: 90 };
export const OBJECT_NAME_PADDING = { TOP_BOTTOM: 30, LEFT_RIGHT: 50 };
export const OBJECT_SPACING = OBJECT_NAME_PADDING.LEFT_RIGHT * 3.5;
export const OBJECT_NAME_FONT_SIZE_PX = 18;
export const MESSAGE_SPACING = 100;
export const MESSAGE_MIN_WIDTH = Math.max(
  42 /* Width of self-sent SVG */,
  100 /* enough width for two buttons */
);
export const MESSAGE_START_Y =
  DIAGRAM_PADDING.TOP_BOTTOM +
  OBJECT_NAME_PADDING.TOP_BOTTOM * 2 +
  OBJECT_NAME_FONT_SIZE_PX +
  MESSAGE_SPACING * 0.7;

export function layoutMessageLeftAndWidth(
  layout,
  message,
  overrideSenderX,
  overrideReceiverX
) {
  let senderX;
  let receiverX;
  let transition = devUtils.transitionIfNotDev(
    "left 0.3s, width 0.3s, top 0.3s, height 0.3s"
  );
  if (overrideSenderX !== undefined) {
    transition = null;
    senderX = overrideSenderX;
  } else if (typeof message.sender === "number") {
    transition = null;
    senderX = message.sender;
  } else {
    const sender = layout[message.sender];
    if (!sender) {
      return undefined;
    }
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
    if (!receiver) {
      return undefined;
    }
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
      ? layout.getTextWidth(message.name)
      : 100 /* arbitrary */;
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
  let transition = devUtils.transitionIfNotDev("left 0.3s");
  const objectNameWidth =
    getTextWidth(object.name) + OBJECT_NAME_PADDING.LEFT_RIGHT;
  let lifelineX = currentX + objectNameWidth / 2;

  if (object.overrideLifelineX) {
    transition = "none";
    lifelineX = object.overrideLifelineX;
  }
  const objectLayout = {
    lifelineX,
    top: DIAGRAM_PADDING.TOP_BOTTOM,
    transition,
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
        undefined /*overrideSenderX*/,
        extraMessage.receiver /*overrideReceiverX*/
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
      top: message.overrideTop ? message.overrideTop : currentY,
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
