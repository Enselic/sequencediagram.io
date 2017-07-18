import React from 'react'

/**
 * When the user hovers a lifeline, this is what gets shown
 * to hint about that if they click, they will begin
 * constructing a new message.
 */
export default class NewMessageMarker extends React.PureComponent {
    render() {
        const width = 30;
        const height = 30;
        const textContainerWidth = 150;
        const { left, top } = this.props;
        return (
            <div style={{
                    border: '1px dotted black',
                    width: width,
                    height: height,
                    borderRadius: 15,
                    left: left,
                    top: top,
                    position: 'relative',
                    pointerEvents: 'none'
                    }}>
                <div style={{
                        position: 'absolute',
                        top: -height,
                        left: -textContainerWidth/2 + width / 2,
                        textAlign: 'center',
                        width: textContainerWidth,
                        }}>
                    Add message
                </div>
            </div>
        );
    }
}
