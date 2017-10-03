import React from "react";
import {
  default as MessageButton,
  MESSAGE_BUTTON_WIDTH,
} from "./MessageButton";
import RemoveButton from "./RemoveButton";
import { eatMouseDownCallback } from "./utils";
import { boxShadow, backgroundDark } from "./common";

function createStartOrEndButton(type, message) {
  return props => {
    return (
      <MessageButton
        id={message.id + "-" + type}
        onClick={e => {
          props.onStartEndClick(message, type, e.pageX);
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
    this.MessageStartButton = createStartOrEndButton("start", message);
    this.MessageEndButton = createStartOrEndButton("end", message);
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
    const pointsLeft = direction > 0;
    const showControlsButNotPending = showControls && !isPending;
    const lifelineWidth = 1;

    const flipExtraStyle = {
      position: "absolute",
      left: !pointsLeft ? undefined : 0,
      right: !pointsLeft ? 0 : undefined,
    };

    const arrowExtraStyle = {
      position: "absolute",
      left: pointsLeft ? undefined : 0,
      right: pointsLeft ? 0 : undefined,
    };

    const lineExtraStyle = {
      position: "absolute",
      left: 0,
      right: 0,
    };

    return (
      <div
        onMouseDown={showControls ? eatMouseDownCallback : null}
        style={{
          boxShadow: isHovered && boxShadow,
          top: "calc(100% - 10px)",
          display: "flex",
          position: "absolute",
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
          (pointsLeft || selfSentMessage ? (
            <this.MessageStartButton {...this.props} />
          ) : (
            <this.MessageEndButton {...this.props} />
          ))}

        <div
          style={{
            position: "relative",
            flexGrow: 1,
          }}
        >
          {showControlsButNotPending && (
            <MessageButton
              id={"toggle-line-style-" + id}
              onClick={showControls ? onLineClicked : null}
              isHovered={isHovered}
              bottomText
              extraStyle={{
                width: selfSentMessage ? "50%" : "100%",
                ...(selfSentMessage ? flipExtraStyle : lineExtraStyle),
              }}
            >
              {isReply ? "reply" : "regular"}
            </MessageButton>
          )}

          {showControlsButNotPending &&
          !selfSentMessage && (
            <MessageButton
              id={"flip-" + id}
              onClick={showControls ? onFlipClicked : null}
              isHovered={isHovered}
              background={backgroundDark}
              bottomText
              extraStyle={{
                ...flipExtraStyle,
              }}
            >
              flip
            </MessageButton>
          )}

          {showControlsButNotPending && (
            <MessageButton
              id={"toggle-arrow-style-" + id}
              className="message-end"
              onClick={showControls ? onArrowClicked : null}
              isHovered={isHovered}
              background={backgroundDark}
              bottomText
              extraStyle={{
                ...Object.assign({}, selfSentMessage && { width: "50%" }),
                ...arrowExtraStyle,
              }}
            >
              {isAsync ? "async" : "sync"}
            </MessageButton>
          )}

          <div
            style={{
              ...lineExtraStyle,
              top: selfSentMessage ? 0 : 10,
              height: 30,
              pointerEvents: "none",
            }}
          >
            <svg width="100%" height="35" preserveAspectRatio="none">
              {selfSentMessage ? (
                <path
                  style={{
                    fill: "none",
                    stroke: "#000000",
                    strokeWidth: 2,
                    strokeDasharray: "8," + (isReply ? "8" : "0"),
                  }}
                  d="m 0,13 c 0,0 39,-1 40,8 1,11 -36,9 -36,9"
                />
              ) : (
                <line
                  x1="3"
                  y1="10"
                  x2="100%"
                  y2="10"
                  transform={"translate(" + (pointsLeft ? "-3" : "0") + " 0)"}
                  style={{
                    fill: "none",
                    stroke: "#000000",
                    strokeWidth: "2",
                    strokeDasharray: "8," + (isReply ? "8" : "0"),
                  }}
                />
              )}
            </svg>
          </div>
          <div
            style={{
              ...arrowExtraStyle,
              pointerEvents: "none",
              top: selfSentMessage ? 20 : 10,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              transform={pointsLeft ? undefined : "rotate(180)"}
            >
              <path
                style={{
                  fill: isAsync ? "none" : "#000000",
                  stroke: "#000000",
                  strokeWidth: 2,
                }}
                d={
                  "M 2,2 C 18,10 18,10 18,10 L 2,18" +
                  (isAsync ? "" : "z") /* close path */
                }
              />
            </svg>
          </div>
        </div>

        {showControlsButNotPending &&
          !selfSentMessage &&
          (pointsLeft ? (
            <this.MessageEndButton {...this.props} />
          ) : (
            <this.MessageStartButton {...this.props} />
          ))}
      </div>
    );
  }
}
