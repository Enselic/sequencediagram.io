import React from 'react'
import { toggleMessageLineStyle } from './../reducers'
import messageBorders from './message-borders.png'
import messageBordersDashed from './message-borders-dashed.png'

export default function(props) {
    const { dispatch, pending, message } = props;
    const key = message.key;

    function handleMouseDown(e) {
        // We don't want the parent div to receive any mouse down event if
        // the remove button is clicked
        e.stopPropagation();
        e.preventDefault();
    }

    const show = pending.hoveredComponentKey === key;
    const borderStyle = show ? 'solid' : 'none';
    const color = (show ? 'black' : 'transparent');

    const height = 30;
    const width = 40;
    const leftRightPadding = 5;
    const style = {
        position: 'absolute',
        left: '50%',
        bottom: -45,
        width: width,
        height: height,
        background: 'transparent',
    }

    const png = message.isReply ? messageBorders : messageBordersDashed;
    const borderImage = 'url(' + png + ') 0 9 17 fill repeat';

    return (
        <div onClick={() => dispatch(toggleMessageLineStyle(key))} onMouseDown={handleMouseDown} style={style} >
            <div className="message-end" style={{
                    position: 'relative',
                    left: '-50%',
                    width: width,
                    height: height,
                    border: '1px dotted ' + color,
                    borderRadius: 5,
                    }}>
                <div style={{
                        position: 'relative',
                        left: leftRightPadding,
                        borderStyle,
                        borderWidth: '0px 0px 17px 0px',
                        borderImage,
                        width: width - leftRightPadding * 2,
                        height: 6,
                        }} />
            </div>
        </div>
    );
}
