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
    const { dispatch, message, layout, objects, messages, pending, controlsColor } = props;

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

    // Show controls unless this is a pending message and unless
    // a pending message is in the middle of creation (so that the user
    // can focus on completing the new message without UI noise
    // from controls)
    const showControls = !isPending && !pending.message;

    return (
        <div onMouseDown={onMouseDown} style={{ ...msgLayout, ...style }} id={message.key} key={message.key} {...hoverHelper(pending, dispatch, message.key)} >
            { showControls &&
              <RemoveButton
                    rightOffset={msgLayout.pointsLeft ? 4 : -4}
                    keyToRemove={message.key}
                    dispatch={dispatch}
                    pending={pending}
                    controlsColor={controlsColor}
                    /> }

            <Name component={message} pending={pending} dispatch={dispatch} />

            { showControls &&
              <MessageStartEnd
                    {...props}
                    msgLayout={msgLayout}
                    type="start"
                    /> }

            { showControls &&
              <MessageStartEnd
                    {...props}
                    msgLayout={msgLayout}
                    type="end"
                    /> }

            { showControls &&
              <LineSelector
                    {...props}
                    message={message}
                    msgLayout={msgLayout}
                    /> }

            { showControls &&
              <ArrowSelector
                    {...props}
                    message={message}
                    msgLayout={msgLayout}
                    /> }

        </div>
    )
}
