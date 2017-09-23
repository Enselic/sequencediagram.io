import React from "react";
import { eatMouseDown } from "./utils";

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
    } = this.props;

    const selfSentMessage = direction === 0;
    const pointsLeft = direction > 0;

    return (
      <div {...eatMouseDown} style={{ position: "relative", top: -8 }}>
        <div
          id={"toggle-line-style-" + theKey}
          onClick={onLineClicked}
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
                d="m 0,13 c 0,0 39,-1 40,8 1,11 -35,9 -35,9"
              />
            ) : (
              <line
                x1="0"
                y1="10"
                x2="100%"
                y2="10"
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
          onClick={onArrowClicked}
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
                stroke: isAsync ? "#000000" : "none",
                strokeWidth: 2,
              }}
              d={
                "M 0,0 C 20,10 20,10 20,10 L 0,20" +
                (isAsync ? "" : "z") /* close path */
              }
            />
          </svg>
        </div>
        {!selfSentMessage && (
          <div
            id={"flip-" + theKey}
            onClick={onFlipClicked}
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
