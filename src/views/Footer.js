import React from 'react'

export default function(props) {
    const leftRightPadding = 10;
    const itemStyle = {
        color: '#ddd',
        textDecoration: 'none',
        paddingLeft: leftRightPadding,
        paddingTop: 10,
        marginRight: 30,
    }
    function ExternalLink(props) {
        return <a style={{ ...itemStyle,  }} target="_blank" rel="noopener noreferrer" href={props.href}>{props.children}</a>
    }

    return (
        <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                background: '#111',
                position: 'absolute',
                top: '100%',
                width: '100%',
                padding: '40px 0',
                }}>
            <ExternalLink href="https://github.com/Enselic/sequencediagram.io">GitHub</ExternalLink>
            <ExternalLink href="https://setofskills.com">Blog</ExternalLink>
            <ExternalLink href="https://twitter.com/SeqDiagram_io">Twitter</ExternalLink>
            <ExternalLink href="./acknowledgements.html">Acknowledgements</ExternalLink>
            <b style={{ marginLeft: 'auto', ...itemStyle, paddingRight: leftRightPadding }}>v1.1.0-beta</b>
        </div>
    );
}
