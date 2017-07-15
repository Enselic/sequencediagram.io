import React from 'react'
import { isChrome } from './utils'

export default function(props) {
    const { showShareInfo, touchWarn } = props.pending;

    return (
        <div style={{ backgroundColor: '#000', padding: 10 }}>
            { touchWarn && <i style={{ color: 'red' }}>Touch input not supported yet, please use a mouse or contribute touch input support via GitHub</i>}
            { !isChrome() && <i style={{ color: 'red' }}>Your browser is not supported yet, please use Google Chrome or contribute more browser support via GitHub</i>}

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
