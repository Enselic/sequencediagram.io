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
    if (Math.abs(direction) < 0.5) {
        let png = message.isAsync ? messageBorderSelfAsync : messageBorderSelf;
        borderImage = 'url(' + png + ') 0 0 19 22 fill';
        borderWidth = '0px 0px 19px 22px'
        left = startX;
        width = 22; // From borderWidth
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
        width = Math.abs(startX - endX) - arrowWidth;
    }

    return {
        left,
        width,
        pointsLeft,
        borderImage,
        borderWidth,
    }
}

export default function(getTextWidth, objects, messages) {
    const DIAGRAM_PADDING= { LEFT_RIGHT: 30, TOP_BOTTOM: 30 };
    const OBJECT_NAME_PADDING = { TOP_BOTTOM: 15, LEFT_RIGHT: 30 };
    const OBJECT_SPACING = OBJECT_NAME_PADDING.LEFT_RIGHT * 3;
    const MESSAGE_START_Y = 120;
    const MESSAGE_SPACING = 70;

    let layout = {};

    let currentX = DIAGRAM_PADDING.LEFT_RIGHT;
    objects.forEach(object => {
        const objectNameWidth = getTextWidth(object.name) + OBJECT_NAME_PADDING.LEFT_RIGHT;
        layout[object.key] = { lifelineX: currentX + objectNameWidth / 2, top: DIAGRAM_PADDING.TOP_BOTTOM };
        currentX += objectNameWidth + OBJECT_SPACING;
    });

    let currentY = MESSAGE_START_Y;

    layout['next-object'] = { lifelineX: currentX };

    messages.forEach(message => {
        const leftRightValues = layoutMessageLeftAndWidth(layout, message);
        if (!leftRightValues) {
            return;
        }

        layout[message.key] = {
            ...leftRightValues,
            top: currentY,
        };

        currentY += MESSAGE_SPACING;
    });

    layout.width = currentX;
    layout.height = currentY + DIAGRAM_PADDING.TOP_BOTTOM;

    return layout;
}
