import React from "react";
import { eatMouseDown } from "./utils";

export const MESSAGE_BUTTON_WIDTH = 80;

export default class MessageButton extends React.Component {
  render() {
    const props = this.props;
    const { isHovered } = props;

    return (
      <span
        id={props.id}
        onClick={props.onClick}
        style={{
          position: "relative",
          cursor: "default",
          textAlign: "center",
          width: MESSAGE_BUTTON_WIDTH,
          height: 60,
          fontSize: 16,
          border: isHovered
            ? "1px dashed " + (props.background || "#8ecaef")
            : "none",
          background: isHovered && "#f8f8f8",
          boxSizing: "border-box",
          color: isHovered && "#555",
          ...props.extraStyle,
        }}
        className={props.className || "message-button"}
        {...eatMouseDown}
      >
        {isHovered && (
          <span
            style={{
              position: "absolute",
              bottom: props.bottomText || 20,
              left: 0,
              width: "100%",
            }}
          >
            {isHovered && props.children}
          </span>
        )}
      </span>
    );
  }
}
