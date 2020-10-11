import React from "react";
import MessageButton from "./MessageButton";

const RemoveButton = (props) => {
  return (
    // We want the RemoveButton to have the same general style as a
    // MessageButton even though they are not related functionally
    <MessageButton
      id={"remove-" + props.idToRemove}
      onClick={props.onRemove}
      background="#f88"
      className="remove-button"
      {...props}
    >
      remove
    </MessageButton>
  );
};
export default RemoveButton;
