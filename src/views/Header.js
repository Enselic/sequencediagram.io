import React from 'react';
import { isChrome } from './utils';

const gitMasterBuild = document.location.host.indexOf('git-master') !== -1;

function Info(props) {
  return (
    <div style={{ color: '#002456', padding: '10px 20px', paddingTop: 0 }}>
      {props.children}
    </div>
  );
}

export default function Header(props) {
  const { touchWarn, showNewContentAvailable } = props.pending;

  return (
    <div
      style={{
        backgroundColor: '#64b9ef',
      }}
    >
      {gitMasterBuild && (
        <Info>
          <b>Risk of dataloss:</b>
          <br />This is a build deployed by continous integration directly from
          the git master branch
        </Info>
      )}

      {touchWarn && (
        <Info>
          <b>Touch input is not supported:</b> Touch input is not supported yet,
          please use a mouse or contribute touch input support via GitHub
        </Info>
      )}

      {!isChrome() && (
        <Info>
          <b>Unsupported browser:</b> Your browser is not supported yet, please
          use Google Chrome or contribute more browser support via GitHub
        </Info>
      )}

      {showNewContentAvailable && (
        <Info>
          <b>New version available:</b> A new version of the this web app has
          been published. Press F5 to load it.
        </Info>
      )}
    </div>
  );
}
