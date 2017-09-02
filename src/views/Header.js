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
    <div style={{ backgroundColor: "#000" }}>
      {touchWarn && (
        <div style={{ color: "red", padding: "10px 10px", paddingTop: 0 }}>
          Touch input is not supported yet, please use a mouse or contribute
          touch input support via GitHub
        </div>
      )}

      {!isChrome() && (
        <div style={{ color: "red", padding: "10px 10px", paddingTop: 0 }}>
          Your browser is not supported yet, please use Google Chrome or
          contribute more browser support via GitHub
        </div>
      )}

      {showShareInfo && (
        <div style={{ color: "#fff", padding: "12px 10px", paddingTop: 0 }}>
          <b>Share by URL:</b> The current diagram is tersely encoded in the
          current URL and can simply be shared as-is by copy-paste from the
          browser address bar. You might want to make use of{" "}
          <a
            style={{ padding: 0 }}
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.google.se/search?q=url+shortener"
          >
            URL shortener services
          </a>.
        </div>
      )}

      {showShareInfo && (
        <div style={{ color: "#fff", padding: "12px 10px", paddingTop: 0 }}>
          <b>Share by PNG:</b> <Kbd>F12</Kbd> (for <i>Developer Tools</i>) then{" "}
          <Kbd>Ctrl/Cmd + Shift + P</Kbd> (for <i>Command Menu</i>) then{" "}
          <Kbd>Capture full size screenshot</Kbd>.
        </div>
      )}

      {showNewContentAvailable && (
        <div style={{ color: "#fff", padding: "12px 10px", paddingTop: 0 }}>
          <b>New version available</b> A new version of the this web app has
          been published. Press F5 to load it.
        </div>
      )}
    </div>
  );
}
