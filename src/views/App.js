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
    const layout = layouter(name => name.length * 7 /* TODO: hack */, objects, messages);
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

                { objects.map(object => (
                  <Objekt
                        key={object.key}
                        object={object}
                        {...usefulProps}
                        {...controlsColorProp(object.key)}
                        />)) }

                { messages.map(message => (
                  <Message
                        key={message.key}
                        message={message}
                        {...usefulProps}
                        {...controlsColorProp(message.key)}
                        />)) }

                { pendingMessage &&
                  <Message
                        key={pendingMessage.key}
                        message={pendingMessage}
                        {...usefulProps}
                        /> }

                { pending.lifelineHoveredKey && !pending.componentMovedKey &&
                  <NewMessageMarker
                        left={layout[pending.lifelineHoveredKey].lifelineX - 15}
                        top={(pending.message ? pending.message.y : pending.lifelineHoveredY) - 15 + 'px'}
                        /> }
            </div>
        </div>
    )
}
