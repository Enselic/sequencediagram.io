import * as ac from './../reducers'
import React from 'react'
import moveHelper from './utils/componentMoveHelper'
import Name from './Name'
import RemoveButton from './RemoveButton'
import MessageStartEnd from './MessageStartEnd'
import LineSelector from './LineSelector'
import ArrowSelector from './ArrowSelector'
import devUtils from './../devUtils'
import { hoverHelper } from './utils'
import { layoutMessageLeftAndWidth } from './../layouter'

export const PENDING_MESSAGE_KEY = "pendingMessage";

export default function(props) {
    const { dispatch, message, layout, objects, messages, pending } = props;

    let msgLayout;
    let onMouseDown;
    let style;
    const isPending = message.key === PENDING_MESSAGE_KEY;
    if (!isPending) {
        msgLayout = layout[message.key];
        if (!msgLayout) {
            return null;
        }

        onMouseDown = moveHelper(
            objects,
            messages,
            message,
            e => e.pageY,
            el => el.style.top,
            ac.beginComponentMove,
            ac.endComponentMove,
            ac.rearrangeMessages,
            dispatch
        );

        style = {
            transition: devUtils.transitionIfNotDev('left 0.3s, width 0.3s, top 0.3s, height 0.3s'),
        };
    } else {
        msgLayout = layoutMessageLeftAndWidth(layout, message);
        msgLayout.top = pending.message.y;
        style= {
            pointerEvents: 'none',
        }
    }

    style = {
        ...style,
        position: 'absolute',
        textAlign: 'center',
        borderStyle: 'solid',
    }

    return (
        <div onMouseDown={onMouseDown} style={{ ...msgLayout, ...style }} id={message.key} key={message.key} {...hoverHelper(pending, dispatch, message.key)} >
            { !isPending && !pending.message && <RemoveButton rightOffset={msgLayout.pointsLeft ? 4 : -4} keyToRemove={message.key} dispatch={dispatch} pending={pending} /> }
            <Name component={message} pending={pending} dispatch={dispatch} />
            { !isPending && !pending.message && <MessageStartEnd {...props} msgLayout={msgLayout} type="start" /> }
            { !isPending && !pending.message && <MessageStartEnd {...props} msgLayout={msgLayout} type="end" /> }
            { !isPending && !pending.message && <LineSelector {...props} message={message} msgLayout={msgLayout} /> }
            { !isPending && !pending.message && <ArrowSelector {...props} message={message} msgLayout={msgLayout} /> }
        </div>
    )
}