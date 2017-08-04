import * as ac from './../reducers'
import React from 'react'
import moveHelper from './utils/componentMoveHelper'
import Name from './Name'
import RemoveButton from './RemoveButton'
import MessageStartEnd from './MessageStartEnd'
import AppearanceSelector from './AppearanceSelector'
import devUtils from './../devUtils'
import { hoverHelper } from './utils'

export default function(props) {
    const { dispatch, message, msgLayout, objects, messages, pending, controlsColor, isPending } = props;

    let onMouseDown;
    let style;
    if (!isPending) {
        onMouseDown = moveHelper(
            objects,
            messages,
            message,
            e => e.pageY,
            el => el.style.top,
            ac.beginComponentMove,
            ac.endComponentMove,
            ac.rearrangeMessages,
            dispatch,
            pending
        );

        style = {
            transition: devUtils.transitionIfNotDev('left 0.3s, width 0.3s, top 0.3s, height 0.3s'),
        };
    } else {
        style= {
            pointerEvents: 'none',
        }
    }

    style = {
        ...style,
        position: 'absolute',
        textAlign: 'center',
        borderStyle: 'solid',
        userSelect: 'none',
    }

    // Show controls unless this is a pending message and unless
    // a pending message is in the middle of creation (so that the user
    // can focus on completing the new message without UI noise
    // from controls)
    const showControls = !isPending && !pending.message;
    const selfSent = message.start === message.end;

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

            { showControls && !selfSent &&
              <MessageStartEnd
                    {...props}
                    msgLayout={msgLayout}
                    type="end"
                    /> }

            { showControls &&
              <AppearanceSelector
                    {...props}
                    message={message}
                    msgLayout={msgLayout}
                    selfSent={selfSent}
                    /> }

        </div>
    )
}
