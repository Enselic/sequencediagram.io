import React from 'react'

export default function(props) {
    const linkColor = {
        color: '#ddd',
    };
    return (
        <div style={{ padding: '10px 0px', background: 'black', position: 'absolute', top: '100%', width: '100%', fontSize: '80%', ...linkColor }}>
            &nbsp;v0.9.0-beta1 @&nbsp;
            <a style={{...linkColor}} target="_blank" rel="noopener noreferrer" href="https://github.com/Enselic/sequencediagram.io">GitHub</a> <br/>
            &nbsp;By&nbsp;<a style={{...linkColor}} target="_blank" rel="noopener noreferrer" href="https://setofskills.com/">setofskills.com</a> <br/>
            &nbsp;Twitter:&nbsp;<a style={{...linkColor}} target="_blank" rel="noopener noreferrer" href="https://twitter.com/SeqDiagram_io">@SeqDiagram_io</a> <br/>
            &nbsp;<a style={{...linkColor}} target="_blank" rel="noopener noreferrer" href="./acknowledgements.html">Acknowledgements</a>
        </div>
    );
}
