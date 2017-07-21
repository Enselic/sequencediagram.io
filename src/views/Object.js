import * as ac from './../reducers'
import React from 'react'
import moveHelper from './utils/componentMoveHelper'
import Name from './Name'
import RemoveButton from './RemoveButton'
import devUtils from './../devUtils'
import { hoverHelper, hoverLifelineHelper, eventToDiagramCoords } from './utils'

/**
 * Note that 'object' here does not mean 'an instance of a class'.
 * Instead, it is the concrete thing in the diagram with a lifeline that
 * the user can add.
 */
export default function(props) {
    const { dispatch, object, layout, objects, messages, pending, controlsColor } = props;

    function lifelineClick(object) {
        return e => {
            let action;
            if (!pending.message || !pending.message.start) {
                action = ac.pendingAddMessage(object.key, eventToDiagramCoords(e)[1]);
            } else {
                action = ac.addMessage(pending.message.start, object.key, 'sendMessage()', layout.extraMessage.index);
            }
            dispatch(action);
        }
    }

    const onMouseDown = moveHelper(
        objects,
        messages,
        object,
        e => e.pageX,
        el => el.style.left,
        ac.beginComponentMove,
        ac.endComponentMove,
        ac.rearrangeObjects,
        dispatch,
        pending
    );

    let style = {
        left: layout[object.key].lifelineX,
        top: layout[object.key].top,
        position: 'absolute',
        transition: devUtils.transitionIfNotDev('left 0.3s'),
    };

    return (
        <div style={style} id={object.key} key={object.key} >
            <div onMouseDown={onMouseDown} {...hoverHelper(pending, dispatch, object.key)} style={{
                    background: '#ffff99',
                    padding: '15px 30px',
                    border: '1px solid black',
                    borderRadius: '4px',
                    transform: 'translateX(-50%)',
                    position: 'relative',
                    }} >
                <RemoveButton controlsColor={controlsColor} rightOffset={0} keyToRemove={object.key} dispatch={dispatch} pending={pending} {...hoverHelper(pending, dispatch, object.key)} />
                <Name component={object} pending={pending} dispatch={dispatch} />
            </div>
            <div {...hoverLifelineHelper(dispatch, object.key)} onClick={lifelineClick(object)}  style={{ textAlign: 'center', transform: 'translateX(-50%)' }} >
                <div style={{ display: 'inline-block', borderLeft: '1px dashed black', width: '1px', height: layout['height'] + 'px' }}>
                </div>
            </div>
        </div>
    )
}
