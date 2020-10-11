import React from "react";

export default function Kbd(props) {
  return (
    <kbd
      style={{
        display: "inline-block",
        color: "black",
        backgroundColor: "#ccc",
        borderRadius: "4px",
      }}
    >
      {props.children}
    </kbd>
  );
}
