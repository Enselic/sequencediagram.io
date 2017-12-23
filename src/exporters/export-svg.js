import React from 'react';

export function SvgMessageLine(props) {
  return props.selfSentMessage ? (
    <path
      style={{
        fill: 'none',
        stroke: '#000000',
        strokeWidth: 2,
        strokeDasharray: '8,' + (props.isReply ? '8' : '0'),
      }}
      d="m 0,13 c 0,0 39,-1 40,8 1,11 -36,9 -36,9"
    />
  ) : (
    <line
      x1="3"
      y1="10"
      x2="100%"
      y2="10"
      transform={'translate(' + (props.pointsLeft ? '-3' : '0') + ' 0)'}
      style={{
        fill: 'none',
        stroke: '#000000',
        strokeWidth: '2',
        strokeDasharray: '8,' + (props.isReply ? '8' : '0'),
      }}
    />
  );
}

export function SvgMessageArrow(props) {
  return (
    <path
      style={{
        fill: props.isAsync ? 'none' : '#000000',
        stroke: '#000000',
        strokeWidth: 2,
      }}
      d={
        'M 2,2 C 18,10 18,10 18,10 L 2,18' +
        (props.isAsync ? '' : 'z') /* close path */
      }
    />
  );
}

/**
 * Converts a sequence diagram to SVG.
 * @param {*} sequenceDiagram Same JSON schema as SequenceDiagram
 * from swagger.json
 */
export function exportSvg(sequenceDiagram) {
  /* TODO */
}
