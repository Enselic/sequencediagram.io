import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  layouter,
  OBJECT_NAME_PADDING,
  OBJECT_NAME_FONT_SIZE_PX,
  MESSAGE_NAME_FONT_SIZE_PX,
} from '../layouter';

export function SvgMessageLine(props) {
  const yOffset = props.selfSentMessage ? 0 : 5;
  return (
    <g transform={`translate(0 ${yOffset})`}>
      {props.selfSentMessage ? (
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
          x2={props.overrideWidth || '100%'}
          y2="10"
          transform={'translate(' + (props.pointsLeft ? '0' : '-3') + ' 0)'}
          style={{
            fill: 'none',
            stroke: '#000000',
            strokeWidth: '2',
            strokeDasharray: '8,' + (props.isReply ? '8' : '0'),
          }}
        />
      )}
    </g>
  );
}

export function SvgMessageArrow(props) {
  const xOffset =
    !props.localArrowTranslate || props.pointsLeft ? 0 : props.width - 20;
  const yOffset = props.selfSentMessage ? 20 : 5;
  return (
    <g transform={`translate(${xOffset} ${yOffset})`}>
      <path
        transform={
          props.pointsLeft ? 'translate(20 20) rotate(180)' : undefined
        }
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
    </g>
  );
}

/**
 * Converts a sequence diagram to SVG.
 * @param {*} sequenceDiagram Same JSON schema as SequenceDiagram
 * from swagger.json
 */
export function exportSvg(sequenceDiagram) {
  const layout = layouter(sequenceDiagram.objects, sequenceDiagram.messages);

  const svgTree = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${layout.width}px`}
      height={`${layout.height}px`}
    >
      {sequenceDiagram.objects.map(object => {
        const objectLayout = layout[object.id];
        const fontRenderHeight = 21;
        const nameWidth =
          OBJECT_NAME_PADDING.LEFT_RIGHT * 2 + objectLayout.objectNameWidth;
        const nameHeight =
          OBJECT_NAME_PADDING.TOP_BOTTOM * 2 + fontRenderHeight;
        return (
          <g key={object.id}>
            <line
              x1={objectLayout.lifelineX}
              y1={objectLayout.top}
              x2={objectLayout.lifelineX}
              y2={objectLayout.top + layout.height}
              stroke="black"
              strokeDasharray="2"
            />
            <rect
              width={nameWidth}
              height={nameHeight}
              x={objectLayout.lifelineX - nameWidth / 2}
              y={objectLayout.top - OBJECT_NAME_PADDING.TOP_BOTTOM}
              fill="#ffe761"
            />
            <text
              textAnchor="middle"
              fontFamily="sans-serif"
              fontSize={`${OBJECT_NAME_FONT_SIZE_PX}px`}
              x={objectLayout.lifelineX}
              y={objectLayout.top + fontRenderHeight - 6}
            >
              {object.name}
            </text>
          </g>
        );
      })}
      {sequenceDiagram.messages.map(message => {
        const messageLayout = layout[message.id];
        const selfSentMessage = messageLayout.direction === 0;
        const pointsLeft = messageLayout.direction <= 0;
        const messageWidth = messageLayout.width;
        return (
          <g
            key={message.id}
            transform={`translate(${messageLayout.left},${messageLayout.top})`}
          >
            <text
              textAnchor="middle"
              x={messageWidth / 2}
              y={-8}
              fontFamily="sans-serif"
              fontSize={`${MESSAGE_NAME_FONT_SIZE_PX}px`}
            >
              {message.name}
            </text>
            <SvgMessageLine
              {...message}
              selfSentMessage={selfSentMessage}
              pointsLeft={pointsLeft}
              overrideWidth={messageWidth}
            />
            <SvgMessageArrow
              {...message}
              selfSentMessage={selfSentMessage}
              pointsLeft={pointsLeft}
              localArrowTranslate={true}
              width={messageWidth}
            />
          </g>
        );
      })}
    </svg>
  );
  const svgOutput = ReactDOMServer.renderToStaticMarkup(svgTree);
  return svgOutput;
}
