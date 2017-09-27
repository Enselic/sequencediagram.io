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
    background: showControls && "#f8f8f8",
    textAlign: "center",
    color: showControls ? "#888" : "transparent",
    display: "block",
    cursor: "default",
    padding: 10,
    marginBottom: 5,
    zIndex: 999,
    fontWeight: "bold",
    boxShadow: showControls && "0 3px 3px 0 rgba(0,0,0,.33)",
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
      &#10006;
    </div>
  );
}
