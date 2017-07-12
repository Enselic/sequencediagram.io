import React from 'react'

export default function(props) {
    const { showShareInfo } = props.pending;

    return (
        <div style={{ backgroundColor: '#000', padding: 10 }}>
            <div style={{ fontSize: '300%', color: '#fff' }}>
                <a style={{ textDecoration: 'none', color: '#fff' }} target="_blank" rel="noopener noreferrer" href="/">SequenceDiagram.io</a>
            </div>
            <div style={{ fontSize: '180%', marginTop: '0.5em', height: showShareInfo ? '2.5em' : 0, transition: '1s' }}>
                <span style={{ color: showShareInfo ? '#fff' : 'transparent', transition: '1s'}}>
                    { showShareInfo ? 'Simply share the current URL in the browser address bar to share the diagram with someone else.' : '' }
                </span>
            </div>
        </div>
    );
}
