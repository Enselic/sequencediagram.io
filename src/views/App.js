import React from 'react'
import layouter from './../layouter'
import Objekt from './Object'
import Message, { PENDING_MESSAGE_KEY } from './Message'
import Header from './Header'
import Menu from './Menu'
import NewMessageMarker from './NewMessageMarker'
import { transferPropsToStyle } from './utils'
import { layoutMessageLeftAndWidth } from './../layouter'
import * as ac from './../reducers'

export default function(props) {
    const { state, dispatch } = props;
    const { core, pending } = state;
    const { objects, messages } = core.present;

    // We want to perform the layout as if the pending name was commited, so that
    // the diagram layout adapts to the pending name which we show as part of the
    // diagram
    const objectsWithPendingNames = objects.map(object => {
        if (pending.componentRenamed && pending.componentRenamed.key === object.key) {
            return { ...object, name: pending.componentRenamed.newName};
        } else {
            return object;
        }
    })
    const layout = layouter(name => name.length * 7 /* TODO: hack */, objectsWithPendingNames, messages, pending.message);
    const usefulProps = { objects, messages, pending, dispatch, layout };

    let pendingMessage;
    let handleMouseMove;
    if (pending.message) {
        const key = PENDING_MESSAGE_KEY;
        pendingMessage = {
            key: key,
            start: pending.message.start,
            end: pending.message.start,
            name: 'sendMessage()' };
        handleMouseMove = e => {
            const el = document.getElementById(key);
            const tmpLayout = layoutMessageLeftAndWidth(
                layout,
                pendingMessage,
                undefined,
                e.pageX);
            tmpLayout.width = tmpLayout.width + 'px';
            tmpLayout.left = tmpLayout.left + 'px';
            transferPropsToStyle(tmpLayout, el.style);
        }
    }


    function controlsColorProp(componentKey) {
        const show = pending.hoveredComponentKey === componentKey &&
                !pending.componentMovedKey;
        return {
            controlsColor: show ? 'black' : 'transparent',
        }
    }

    return (
        <div onTouchEnd={() => dispatch(ac.touchWarn())} style={{
                minWidth: layout.width,
                position: 'relative'
                }} >

            <Header {...usefulProps} />

            <Menu {...usefulProps}
                    showUndo={core.past.length > 0}
                    showRedo={core.future.length > 0}
                    showTipIfSpace={objects.length < 3 && messages.length < 2}
                    />

            <div onMouseMove={handleMouseMove} style={{ position: 'relative', height: layout.height + 50 }} id="diagram-root">

                { objects.map(object => (<Objekt
                        key={object.key}
                        object={object}
                        {...usefulProps}
                        {...controlsColorProp(object.key)}
                        />)) }

                { messages.map(message => {
                    const msgLayout = layout[message.key];
                    return msgLayout ? (<Message
                            key={message.key}
                            message={message}
                            msgLayout={msgLayout}
                            {...usefulProps}
                            {...controlsColorProp(message.key)}
                            />) : null;
                    }) }

                { pendingMessage && <Message
                        key={pendingMessage.key}
                        message={pendingMessage}
                        msgLayout={{ ...layoutMessageLeftAndWidth(layout, pendingMessage), top: layout.extraMessage.top }}
                        {...usefulProps}
                        /> }

                { pending.lifelineHoveredKey && !pending.componentMovedKey && <NewMessageMarker
                        left={layout[pending.lifelineHoveredKey].lifelineX}
                        top={pending.message ? layout.extraMessage.top : pending.lifelineHoveredY}
                        isStart={!!!pending.message}
                        direction={layout[pending.lifelineHoveredKey].lifelineX > pending.lifelineHoveredX ? -1 : 1}
                        /> }
            </div>
        </div>
    )
}
