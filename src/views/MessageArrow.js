import React from 'react';
import {
  default as MessageButton,
  MESSAGE_BUTTON_WIDTH,
} from './MessageButton';
import RemoveButton from './RemoveButton';
import { SvgMessageLine, SvgMessageArrow } from './../exporters/export-svg';
import { eatMouseDownCallback } from './utils';

function createAnchorButton(type, message) {
  return (props) => {
    return (
      <MessageButton
        id={message.id + '-' + type}
        onClick={(e) => {
          props.onAnchorClick(message, type, e.pageX);
        }}
        {...props}
      >
        {type}
      </MessageButton>
    );
  };
}

export default class MessageArrow extends React.Component {
  constructor(props) {
    super(props);

    const { message } = props;
    this.MessageSenderButton = createAnchorButton('sender', message);
    this.MessageReceiverButton = createAnchorButton('receiver', message);
  }
  render() {
    const {
      message,
      direction,
      onLineClicked,
      onArrowClicked,
      onFlipClicked,
      showControls,
      isHovered,
      isPending,
      onRemove,
    } = this.props;
    const { id, isReply, isAsync } = message;

    const selfSentMessage = direction === 0;
    const pointsLeft = direction <= 0;
    const showControlsButNotPending = showControls && !isPending;
    const lifelineWidth = 1;

    const flipExtraStyle = {
      position: 'absolute',
      left: pointsLeft ? undefined : 0,
      right: pointsLeft ? 0 : undefined,
    };

    const arrowExtraStyle = {
      position: 'absolute',
      left: !pointsLeft ? undefined : 0,
      right: !pointsLeft ? 0 : undefined,
    };

    const lineExtraStyle = {
      position: 'absolute',
      left: MESSAGE_BUTTON_WIDTH,
      right: MESSAGE_BUTTON_WIDTH,
    };

    return (
      <div
        onMouseDown={showControls ? eatMouseDownCallback : null}
        style={{
          top: 'calc(100% - 5px)',
          display: 'flex',
          position: 'absolute',
          left: showControlsButNotPending
            ? -MESSAGE_BUTTON_WIDTH * 2 - lifelineWidth
            : 0,
          right:
            showControlsButNotPending && !selfSentMessage
              ? -MESSAGE_BUTTON_WIDTH
              : 0,
        }}
      >
        {showControlsButNotPending && (
          <RemoveButton
            idToRemove={message.id}
            isHovered={isHovered}
            onRemove={onRemove}
            extraStyle={{ width: MESSAGE_BUTTON_WIDTH }}
          />
        )}

        {showControlsButNotPending &&
          (!pointsLeft || selfSentMessage ? (
            <this.MessageSenderButton {...this.props} />
          ) : (
            <this.MessageReceiverButton {...this.props} />
          ))}

        <div
          style={{
            position: 'relative',
            flexGrow: 1,
          }}
        >
          {showControlsButNotPending && (
            <MessageButton
              id={'toggle-line-style-' + id}
              onClick={showControls ? onLineClicked : null}
              isHovered={isHovered}
              bottomText={!selfSentMessage && 10}
              extraStyle={{
                width: selfSentMessage
                  ? '50%'
                  : `calc(100% - ${MESSAGE_BUTTON_WIDTH * 2}px)`,
                ...(selfSentMessage ? flipExtraStyle : lineExtraStyle),
              }}
            >
              {isReply ? 'reply' : 'regular'}
            </MessageButton>
          )}

          {showControlsButNotPending && !selfSentMessage && (
            <MessageButton
              id={'flip-' + id}
              onClick={showControls ? onFlipClicked : null}
              isHovered={isHovered}
              bottomText={10}
              extraStyle={{
                ...flipExtraStyle,
              }}
            >
              flip
            </MessageButton>
          )}

          {showControlsButNotPending && (
            <MessageButton
              id={'toggle-arrow-style-' + id}
              onClick={showControls ? onArrowClicked : null}
              isHovered={isHovered}
              bottomText={selfSentMessage ? 3 : 8}
              extraStyle={{
                ...Object.assign({}, selfSentMessage && { width: '50%' }),
                ...arrowExtraStyle,
              }}
            >
              {isAsync ? 'async' : 'sync'}
            </MessageButton>
          )}

          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 30,
              pointerEvents: 'none',
            }}
          >
            <svg width="100%" height="35" preserveAspectRatio="none">
              <SvgMessageLine
                selfSentMessage={selfSentMessage}
                isReply={isReply}
                pointsLeft={pointsLeft}
              />
            </svg>
          </div>
          <div
            style={{
              ...arrowExtraStyle,
              pointerEvents: 'none',
            }}
          >
            <svg width="20" height="40" viewBox="0 0 20 40">
              <SvgMessageArrow
                selfSentMessage={selfSentMessage}
                isAsync={isAsync}
                pointsLeft={pointsLeft}
              />
            </svg>
          </div>
        </div>

        {showControlsButNotPending &&
          !selfSentMessage &&
          (pointsLeft ? (
            <this.MessageSenderButton {...this.props} />
          ) : (
            <this.MessageReceiverButton {...this.props} />
          ))}
      </div>
    );
  }
}
