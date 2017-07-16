import React from 'react'
import { isChrome } from './utils'

export default function(props) {
    const { showShareInfo, touchWarn } = props.pending;

    return (
        <div style={{ backgroundColor: '#000', padding: 10 }}>
            { touchWarn && <i style={{ color: 'red' }}>Touch input not supported yet, please use a mouse or contribute touch input support via GitHub</i>}
            { !isChrome() && <i style={{ color: 'red' }}>Your browser is not supported yet, please use Google Chrome or contribute more browser support via GitHub</i>}

            <div style={{
                    fontSize: '300%',
                    color: '#fff',
                    }}>
                <a target="_blank" rel="noopener noreferrer" href="/" style={{
                        textDecoration: 'none',
                        color: '#fff',
                        }}>SequenceDiagram.io</a>
            </div>
            <div style={{
                    fontSize: '110%',
                    marginTop: '0.5em',
                    }}>
                <span style={{
                        color: 'white',
                        }}>
                    { showShareInfo && (<span>
                        <b>Share by URL:</b> The current diagram is tersely encoded in the
                        current URL and can simply be shared as-is by copy-paste
                        from the browser address bar. <br/>
                        <b>Share by PNG:</b> <kbd>F12</kbd> (for <i>Developer Tools</i>) then <kbd>
                        Ctrl/Cmd + Shift + P</kbd> (for <i>Command Menu</i>) then <kbd>
                        Capture full size screenshot</kbd>.
                    </span> )}
                </span>
            </div>
        </div>
    );
}
