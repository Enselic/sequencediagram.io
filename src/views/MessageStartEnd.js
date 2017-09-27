import React from "react";
import { eatMouseDown } from "./utils";

export default function(props) {
  const { message, type, msgLayout, controlsColor, onStartEndClick } = props;

  const padding = 15;
  const width = 30;
  let right, left;
  if (
    (msgLayout.direction < 0 && type === "start") ||
    (msgLayout.direction >= 0 && type === "end")
  ) {
    right = -width;
  } else {
    left = -width;
  }

  const margin = 15;
  if (left) {
    left -= padding + margin;
  }
  if (right) {
    right -= padding + margin;
  }
  const showControls = controlsColor !== "transparent" ? true : undefined;
  const style = {
    cursor: "default",
    position: "absolute",
    right,
    left,
    width: width,
    bottom: -25,
    padding,
    background: showControls && "#f8f8f8",
    zIndex: 999,
    fontWeight: "bold",
    color: showControls ? "#888" : "transparent",
  };

  return (
    <span
      id={message.key + "-" + type}
      style={style}
      className="message-end"
      {...eatMouseDown}
      onClick={e => {
        onStartEndClick(message, type, e.pageX);
      }}
    >
      ⇆
    </span>
  );
}
