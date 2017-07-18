import React from 'react'
import { layoutMessageLeftAndWidth } from './../layouter'
import * as ac from './../reducers'

export default function(props) {
    const { dispatch, message, layout, objects, pending, type, msgLayout } = props;

    function eventToPos(e) {
        return e.pageX;
    }

    function mousedown(part) {
        return e => {
            e.preventDefault();
            e.stopPropagation();

            const messageCopy = { ...message };

            const el = document.getElementById(message.key);

            function updatePositions(e) {
                let shortestDist = 10000000;
                objects.forEach(object => {
                    const dist = Math.abs(eventToPos(e) - layout[object.key].lifelineX);
                    if (dist < shortestDist) {
                        shortestDist = dist;
                        messageCopy[part] = object.key;
                    }
                });

                const l = layoutMessageLeftAndWidth(layout, messageCopy);
                const style = el.style;
                style.left = l.left + 'px';
                style.width = l.width + 'px';
                style.borderWidth = l.borderWidth;
                style.borderImage = l.borderImage;
            }

            function mousemove(e) {
                e.preventDefault();

                updatePositions(e);
            }
            window.addEventListener('mousemove', mousemove);

            function mouseup(e) {
                e.preventDefault();

                if (JSON.stringify(messageCopy) !== JSON.stringify(message)) {
                    dispatch(ac.replaceMessage(messageCopy));
                }

                window.removeEventListener('mousemove', mousemove);
                dispatch(ac.endComponentMove());

            }
            window.addEventListener('mouseup', mouseup, { once: true });

            updatePositions(e);

            dispatch(ac.beginComponentMove(message.key));
        }
    }

    const color = (pending.hoveredComponentKey === message.key || pending.componentMovedKey === message.key ? 'black' : 'transparent');
    let right, left;
    if (msgLayout.pointsLeft) {
        if (type === 'start') {
            right = -16;
        } else {
            left = -24;
        }
    } else {
        if (type === 'start') {
            left = -16;
        } else {
            right = -24;
        }
    }
    const style= {
        position: 'absolute',
        right,
        left,
        bottom: '-25px',
        width: 30,
        height: 27,
        background: 'transparent',
        borderRadius: '15px',
        border: '1px dotted ' + color,
        color: color,
        paddingTop: 3,
        fontSize: 10,
    }

    return <span style={style} className="message-end" onMouseDown={mousedown(type)}>move</span>;
}
