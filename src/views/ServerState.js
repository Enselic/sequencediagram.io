import React from "react";
import * as ac from "./../reducers";

export default function ServerState(props) {
  const {
    idOnServer,
    revisionOnServer,
    fixedRevision,
    nbrOfPendingOperations,
    error,
  } = props.reduxState.backend;
  let message;
  let addLink = false;
  if (error) {
    message = "Error: " + (error.message || error);
  } else if (revisionOnServer === ac.PENDING) {
    // Wait for (imminent) new state before saying anything
    message = "";
  } else if (
    idOnServer &&
    revisionOnServer &&
    revisionOnServer !== ac.TOO_OLD &&
    nbrOfPendingOperations === 0 &&
    !fixedRevision
  ) {
    message = `Saved revision ${revisionOnServer}`;
    addLink = true;
  } else {
    message = "";
  }
  return (
    <div
      style={{
        color: "#002456",
        textAlign: "right",
        flexGrow: 1,
        marginRight: 20,
        fontSize: 20,
      }}
    >
      {addLink ? (
        <a
          style={{
            backgroundColor: "transparent",
            border: "none",
            padding: "5px 20px",
            color: "#002456",
          }}
          href={"/" + idOnServer + "?revision=" + revisionOnServer}
        >
          {message}
        </a>
      ) : (
        message
      )}
    </div>
  );
}
