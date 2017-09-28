import React from "react";
import { eatMouseDownCallback } from "./utils";

export default class MessageArrow extends React.Component {
  render() {
    const {
      theKey,
      isReply,
      isAsync,
      direction,
      onLineClicked,
      onArrowClicked,
      onFlipClicked,
      showControls,
    } = this.props;

    const selfSentMessage = direction === 0;
    const pointsLeft = direction > 0;

    return (
      <div
        onMouseDown={showControls ? eatMouseDownCallback : null}
        style={{ position: "relative", top: -8 }}
      >
        <div
          id={"toggle-line-style-" + theKey}
          onClick={showControls ? onLineClicked : null}
          style={{
            position: "absolute",
            width: "100%",
            height: selfSentMessage ? 40 : 20,
          }}
        >
          <svg width="100%" height="100%" preserveAspectRatio="none">
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
          id={"toggle-arrow-style-" + theKey}
          onClick={showControls ? onArrowClicked : null}
          style={{
            position: "absolute",
            width: 20,
            height: 20,
            top: selfSentMessage ? 20 : 0,
            left: pointsLeft ? undefined : 0,
            right: pointsLeft ? 0 : undefined,
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
        {!selfSentMessage && (
          <div
            id={"flip-" + theKey}
            onClick={showControls ? onFlipClicked : null}
            style={{
              position: "absolute",
              width: 20,
              height: 20,
              left: !pointsLeft ? undefined : 0,
              right: !pointsLeft ? 0 : undefined,
            }}
          />
        )}
      </div>
    );
  }
}
