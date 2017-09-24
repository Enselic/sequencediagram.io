import React from "react";
import { isChrome } from "./utils";

export default function(props) {
  const { showShareInfo, touchWarn, showNewContentAvailable } = props.pending;

  function Kbd(props) {
    return (
      <kbd
        style={{
          display: "inline-block",
          padding: "0.2em",
          color: "black",
          backgroundColor: "#ccc",
          borderRadius: "4px",
        }}
      >
        {props.children}
      </kbd>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#64b9ef",
      }}
    >
      {touchWarn && (
        <div style={{ color: "#002456", padding: "10px 20px", paddingTop: 0 }}>
          Touch input is not supported yet, please use a mouse or contribute
          touch input support via GitHub
        </div>
      )}

      {!isChrome() && (
        <div style={{ color: "#002456", padding: "10px 20px", paddingTop: 0 }}>
          Your browser is not supported yet, please use Google Chrome or
          contribute more browser support via GitHub
        </div>
      )}

      {showShareInfo && (
        <div style={{ color: "#002456", padding: "12px 20px", paddingTop: 0 }}>
          <b>Share by URL:</b> The current diagram is tersely encoded in the
          current URL and can simply be shared as-is by copy-paste from the
          browser address bar.
        </div>
      )}

      {showShareInfo && (
        <div style={{ color: "#002456", padding: "12px 20px", paddingTop: 0 }}>
          <b>Share by PNG:</b> <Kbd>F12</Kbd> (for <i>Developer Tools</i>) then{" "}
          <Kbd>Ctrl/Cmd + Shift + P</Kbd> (for <i>Command Menu</i>) then{" "}
          <Kbd>Capture full size screenshot</Kbd>.
        </div>
      )}

      {showNewContentAvailable && (
        <div style={{ color: "#002456", padding: "12px 20px", paddingTop: 0 }}>
          <b>New version available</b> A new version of the this web app has
          been published. Press F5 to load it.
        </div>
      )}
    </div>
  );
}
