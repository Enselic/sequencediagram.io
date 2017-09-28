import { removeComponent } from "./../reducers";
import React from "react";
import { eatMouseDown } from "./utils";

export default function(props) {
  const { keyToRemove, dispatch, controlsColor, extraStyle } = props;

  const showControls = controlsColor !== "transparent" ? true : undefined;
  const style = {
    position: "absolute",
    bottom: "100%",
    left: 0,
    right: 0,
    background: showControls && "#e6e6e6",
    textAlign: "center",
    color: showControls ? "#888" : "transparent",
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
      onClick={() => dispatch(removeComponent(keyToRemove))}
    >
      remove
    </div>
  );
}
