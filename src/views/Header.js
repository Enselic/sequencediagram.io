import React from "react";

const gitMasterBuild = document.location.host.indexOf("git-master") !== -1;

function Info(props) {
  return (
    <div style={{ color: "#002456", padding: "10px 20px", paddingTop: 0 }}>
      {props.children}
    </div>
  );
}

export default function Header(props) {
  const { touchWarn } = props.pending;

  return (
    <div
      style={{
        backgroundColor: "#64b9ef",
      }}
    >
      {gitMasterBuild && (
        <Info>
          <b>Risk of dataloss:</b>
          <br />
          This is a build deployed by continous integration directly from the
          git master branch
        </Info>
      )}

      {touchWarn && (
        <Info>
          <b>Touch input is not supported:</b> Touch input is not supported yet,
          please use a mouse or contribute touch input support via GitHub
        </Info>
      )}
    </div>
  );
}
