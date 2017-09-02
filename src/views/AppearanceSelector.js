import React from "react";
import {
  toggleMessageLineStyle,
  toggleMessageArrowStyle,
  flipMessageDirection,
} from "./../reducers";
import messageBorders from "./message-borders.png";
import messageBordersDashed from "./message-borders-dashed.png";
import messageBordersAsync from "./message-borders-async.png";
import { eatMouseDown } from "./utils";

export default function(props) {
  const { dispatch, message, layout, controlsColor, selfSent } = props;
  const key = message.key;

  const pointsLeft = layout[key].pointsLeft;
  const invisible = controlsColor === "transparent";

  const borderStyle = invisible ? "none" : "solid";

  const pngLine = message.isReply ? messageBorders : messageBordersDashed;
  const pngArrow = message.isAsync ? messageBorders : messageBordersAsync;

  const borderImageLine = invisible
    ? "none"
    : "url(" + pngLine + ") 0 9 17 fill repeat";
  const borderImageArrow = invisible
    ? "none"
    : "url(" + pngArrow + ") 0 9 17 fill repeat";

  const outlineStyle = {
    width: 30,
    height: 30,
    border: "1px dotted " + controlsColor,
    borderRadius: 15,
  };

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: -45,
        background: "transparent",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          left: "-50%",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            left: pointsLeft ? -4 : 4,
            pointerEvents: "auto",
          }}
        >
          {!selfSent && (
            <div
              id={"flip-" + key}
              className="message-end"
              onClick={() => dispatch(flipMessageDirection(key))}
              {...eatMouseDown}
              style={{
                background: "transparent",
                borderRadius: 15,
                border: "1px dotted " + controlsColor,
                ...outlineStyle,
                color: controlsColor,
                fontSize: 10,
                lineHeight: outlineStyle.height + "px",
                cursor: "default",
              }}
            >
              flip
            </div>
          )}
          {!selfSent && (
            <div
              id={"toggle-line-style-" + key}
              className="message-end"
              onClick={() => dispatch(toggleMessageLineStyle(key))}
              {...eatMouseDown}
              style={outlineStyle}
            >
              <div
                style={{
                  borderStyle,
                  borderWidth: "0px 0px 17px 0px",
                  borderImage: borderImageLine,
                  height: 6,
                }}
              />
            </div>
          )}
          <div
            id={"toggle-arrow-style-" + key}
            className="message-end"
            onClick={() => dispatch(toggleMessageArrowStyle(key))}
            {...eatMouseDown}
            style={outlineStyle}
          >
            <div
              style={{
                position: "relative",
                left: 8,
                top: 5,
                borderStyle,
                borderWidth: pointsLeft
                  ? "0px 0px 17px 9px"
                  : "0px 9px 17px 0px",
                borderImage: borderImageArrow,
                width: 3,
                height: 1,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
