import React from 'react'

/**
 * When the user hovers a lifeline, this is what gets shown
 * to hint about that if they click, they will begin
 * constructing a new message.
 */
export default class NewMessageMarker extends React.PureComponent {
    render() {
        const { left, top } = this.props;
        return (
            <div style={{
                    border: '1px dotted black',
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    left: left,
                    top: top,
                    position: 'relative',
                    pointerEvents: 'none'
                    }}>
            </div>
        );
    }
}
