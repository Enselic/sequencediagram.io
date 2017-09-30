import React from "react";
import { eatMouseDown } from "./utils";

export default function(props) {
  const { keyToRemove, onRemove, extraStyle, isHovered } = props;

  const style = {
    position: "absolute",
    bottom: "100%",
    left: 0,
    right: 0,
    background: isHovered && "#e6e6e6",
    textAlign: "center",
    color: isHovered ? "#888" : "transparent",
    display: "block",
    cursor: "default",
    padding: 10,
    zIndex: 999,
    fontWeight: "bold",
    fontSize: 13,
    ...extraStyle,
  };

  return (
    <div
      className="remove-button"
      id={"remove-" + keyToRemove}
      {...eatMouseDown}
      style={style}
      onClick={onRemove}
    >
      remove
    </div>
  );
}
