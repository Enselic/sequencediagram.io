import React from 'react';
import * as ac from './../reducers';

export default function ServerState(props) {
  const {
    idOnServer,
    revisionOnServer,
    fixedRevision,
    nbrOfPendingOperations,
    error,
  } = props.reduxState.backend;
  let message;
  if (error) {
    message = 'Error: ' + (error.message || error);
  } else if (revisionOnServer === ac.PENDING) {
    // Wait for (imminent) new state before saying anything
    message = '';
  } else if (
    idOnServer &&
    revisionOnServer &&
    revisionOnServer !== ac.TOO_OLD &&
    nbrOfPendingOperations === 0 &&
    !fixedRevision
  ) {
    message = 'Saved';
  } else {
    message = '';
  }
  return (
    <div
      style={{
        color: '#002456',
        textAlign: 'right',
        flexGrow: 1,
        marginRight: 20,
        fontSize: 20,
      }}
    >
      {message}
    </div>
  );
}
