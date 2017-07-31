import messageBorderSelf from './views/message-borders-self.png'
import messageBorderSelfAsync from './views/message-borders-self-async.png'
import messageBorders from './views/message-borders.png'
import messageBordersAsync from './views/message-borders-async.png'
import messageBordersDashed from './views/message-borders-dashed.png'
import messageBordersDashedAsync from './views/message-borders-dashed-async.png'

export function layoutMessageLeftAndWidth(layout, message, overrideStartX, overrideEndX) {
    let startX;
    let endX;
    if (overrideStartX !== undefined) {
        startX = overrideStartX;
    } else {
        const start = layout[message.start];
        if (!start) {
            return undefined;
        }
        startX = start.lifelineX;
    }

    if (overrideEndX !== undefined) {
        endX = overrideEndX;
    } else {
        const end = layout[message.end];
        if (!end) {
            return undefined;
        }
        endX = end.lifelineX;
    }

    const pointsLeft = startX > endX;
    const direction = endX - startX;

    let borderImage;
    let borderWidth;
    let left;
    let width;
    const minWidth = 22; // From largest borderWidth
    const messageTextWidth = (layout && layout.getTextWidth) ? layout.getTextWidth(message.name) : 100 /* arbitrary */;
    if (Math.abs(direction) < 0.5) {
        let png = message.isAsync ? messageBorderSelfAsync : messageBorderSelf;
        borderImage = 'url(' + png + ') 0 0 19 22 fill';
        borderWidth = '0px 0px 19px 22px'
        left = startX;
        const maxLineWidth = 150;
        width = Math.min(maxLineWidth, Math.max(minWidth, messageTextWidth));
    } else {
        const arrowWidth = 9;
        let png;
        if (message.isAsync) {
            png = message.isReply ? messageBordersDashedAsync : messageBordersAsync;
        } else {
            png = message.isReply ? messageBordersDashed : messageBorders;
        }

        borderImage = 'url(' + png + ') 0 9 17 fill repeat';
        borderWidth = (pointsLeft ?
                       '0px 0px 17px ' + arrowWidth + 'px' :
                       '0px ' + arrowWidth + 'px 17px 0px');
        left = Math.min(startX, endX);
        width = Math.max(Math.abs(startX - endX) - arrowWidth, minWidth);
    }

    const approximateLineHeight = 18;
    const carefulnessFactor = 1.4;
    const approximateHeight = Math.floor(messageTextWidth * carefulnessFactor / width) * approximateLineHeight;

    return {
        left,
        width,
        pointsLeft,
        approximateHeight,
        borderImage,
        borderWidth,
    }
}

/**
 * Lays out ordered sets of objects and messages.
 * @param getTextWidth Used to measure rendered width of texts
 * @param objects Array of objects to layout.
 * @param messages Array of messages to layout.
 * @param extraMessage Optional pre-layouted message to take into account. For example a pending message.
 **/
export default function(getTextWidth, objects, messages, extraMessage) {
    const DIAGRAM_PADDING= { LEFT_RIGHT: 70, TOP_BOTTOM: 40 };
    const OBJECT_NAME_PADDING = { TOP_BOTTOM: 20, LEFT_RIGHT: 40 };
    const OBJECT_SPACING = OBJECT_NAME_PADDING.LEFT_RIGHT * 3;
    const MESSAGE_START_Y = 140;
    const MESSAGE_SPACING = 70;

    let layout = {};

    // We want subsequent measurements to use the same text measurer
    layout.getTextWidth = getTextWidth;

    let currentX = DIAGRAM_PADDING.LEFT_RIGHT;
    objects.forEach(object => {
        const objectNameWidth = getTextWidth(object.name) + OBJECT_NAME_PADDING.LEFT_RIGHT;
        layout[object.key] = { lifelineX: currentX + objectNameWidth / 2, top: DIAGRAM_PADDING.TOP_BOTTOM };
        currentX += objectNameWidth + OBJECT_SPACING;
    });

    let currentY = MESSAGE_START_Y;

    function insertExtraMessage(index) {
        layout[extraMessage.key] = {
            ...layoutMessageLeftAndWidth(layout,
                    extraMessage,
                    undefined /*overrideStartX*/,
                    extraMessage.end /*overrideEndX*/),
            top: currentY,
            index };
        currentY += MESSAGE_SPACING;
    }

    function extraMessageToBeInserted() {
        return extraMessage && !(extraMessage.key in layout);
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

        layout[message.key] = {
            ...leftRightValues,
            top: currentY,
        };

        currentY += MESSAGE_SPACING + leftRightValues.approximateHeight;
    });

    if (extraMessageToBeInserted()) {
        insertExtraMessage(messages.length);
    }

    layout.width = currentX;
    layout.height = currentY + DIAGRAM_PADDING.TOP_BOTTOM;

    return layout;
}
