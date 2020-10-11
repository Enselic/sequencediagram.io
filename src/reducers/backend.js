import { replaceCore } from "./core";

const server = process.env.REACT_APP_API_SERVER;

export const PENDING = "<<PENDING>>";
export const TOO_OLD = "<<TOO_OLD>>";

export function newDiagram(initialDiagram) {
  return (dispatch, getState) => {
    setDiagramAsPending(dispatch, getState);

    doPost(server + "/sequencediagrams", initialDiagram)
      .then(updateIdAndRevision(dispatch, getState))
      .catch(fetchCatchHandler(dispatch, setDiagramMissing()))
      .then(() => dispatch(decreasePendingOperation()));
  };
}

export function loadDiagram(id, revision) {
  return (dispatch, getState) => {
    setDiagramAsPending(dispatch, getState, !!revision);

    fetch(server + "/sequencediagrams/" + id + (revision ? "/" + revision : ""))
      .then(updateIdAndRevision(dispatch, getState, revision))
      .then((body) => {
        dispatch(
          replaceCore(
            body.sequenceDiagram.objects,
            body.sequenceDiagram.messages
          )
        );
      })
      .catch(fetchCatchHandler(dispatch))
      .then(() => dispatch(decreasePendingOperation()));
  };
}

export function saveDiagram(diagram) {
  return (dispatch, getState) => {
    // Let the UI know we've started a query
    dispatch(setRevisionPending());

    doPost(
      server + "/sequencediagrams/" + getState().backend.idOnServer,
      diagram
    )
      .then(updateIdAndRevision(dispatch, getState))
      .catch(fetchCatchHandler(dispatch))
      .then(() => dispatch(decreasePendingOperation()));
  };
}

function setDiagramAsPending(dispatch, getState, fixedRevision) {
  // Make sure we're not already doing this
  const { backend } = getState();
  if (backend.idOnServer === PENDING) {
    throw new Error("Diagram already pending");
  }

  // Let the UI know we've started a query
  dispatch(setDiagramPending(fixedRevision));
}

function doPost(path, state) {
  return fetch(path, {
    method: "POST",
    body: JSON.stringify(state),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}

function updateIdAndRevision(dispatch, getState, fixedRevision) {
  return (response) =>
    response.json().then((body) => {
      const currentRevision = getState().backend.revisionOnServer;
      if (
        typeof body.id === "string" &&
        body.id.length >= 4 &&
        body.sequenceDiagram &&
        Array.isArray(body.sequenceDiagram.objects) &&
        Array.isArray(body.sequenceDiagram.messages)
      ) {
        if (
          typeof currentRevision !== "number" ||
          currentRevision < body.revision
        ) {
          dispatch(setIdAndRevision(body.id, body.revision, !!fixedRevision));

          // Update URL
          const wantedPath =
            "/" + body.id + (fixedRevision ? "?revision=" + fixedRevision : "");
          if (window.location.pathname !== wantedPath) {
            window.history.replaceState(null, null, wantedPath);
          }
        }
      } else {
        if (body.error) {
          throw body.error;
        } else {
          throw new Error(
            "failed to create new diagram, expected body.id being a " +
              "string with len >= 4, but body is: " +
              JSON.stringify(body)
          );
        }
      }
      return body;
    });
}

function fetchCatchHandler(dispatch, actionIfFailed) {
  return (e) => {
    if (actionIfFailed) {
      dispatch(actionIfFailed);
    }
    if (e instanceof TypeError) {
      dispatch(setError("Could not connect to " + server, "ConnectionFailed"));
    } else {
      let message = e.message || e;
      if (e.code === "EmptyQuery") {
        message = "Could not load diagram";
      }
      dispatch(setError(message, e.code));
    }
  };
}

function setDiagramPending(fixedRevision) {
  return { type: "SET_DIAGRAM_PENDING", fixedRevision };
}

function setDiagramMissing() {
  return { type: "SET_DIAGRAM_MISSING" };
}

function setRevisionPending() {
  return { type: "SET_REVISION_PENDING" };
}

function setIdAndRevision(id, revision, fixedRevision) {
  return { type: "SET_ID_AND_REVISION", id, revision, fixedRevision };
}

/**
 * By keeping track how many requests that are in flight, we can avoid
 * erronously marking the diagram as 'saved' when the first of two 'save'
 * HTTP POST requests are received.
 */
function decreasePendingOperation() {
  return { type: "DECREASE_PENDING_OPERATION" };
}

export function markServerRevisionAsOld() {
  return { type: "MARK_SERVER_REVISION_AS_OLD" };
}

function setError(message, code) {
  return { type: "SET_ERROR", error: { message, code } };
}

export default function (
  state = {
    idOnServer: undefined,
    revisionOnServer: undefined,
    fixedRevision: undefined,
    error: undefined,
    nbrOfPendingOperations: 0,
  },
  action
) {
  switch (action.type) {
    case "SET_DIAGRAM_PENDING":
      return {
        ...state,
        idOnServer: PENDING,
        revisionOnServer: PENDING,
        fixedRevision: action.fixedRevision,
        nbrOfPendingOperations: state.nbrOfPendingOperations + 1,
        error: undefined,
      };

    case "SET_DIAGRAM_MISSING":
      return {
        ...state,
        idOnServer: undefined,
        revisionOnServer: undefined,
      };

    case "SET_REVISION_PENDING":
      return {
        ...state,
        revisionOnServer: PENDING,
        nbrOfPendingOperations: state.nbrOfPendingOperations + 1,
      };

    case "DECREASE_PENDING_OPERATION": {
      let newValue = state.nbrOfPendingOperations - 1;
      if (newValue < 0) {
        console.error(
          "PLEASE REPORT THIS BUG: newNbrOfPendingOperations was < 0"
        );
        newValue = 0;
      }

      return {
        ...state,
        nbrOfPendingOperations: newValue,
      };
    }

    case "SET_ID_AND_REVISION":
      return {
        ...state,
        idOnServer: action.id,
        revisionOnServer: action.revision,
        fixedRevision: action.fixedRevision,
        error: undefined,
      };

    case "MARK_SERVER_REVISION_AS_OLD":
      return {
        ...state,
        revisionOnServer: TOO_OLD,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.error,
      };

    default:
      return state;
  }
}
