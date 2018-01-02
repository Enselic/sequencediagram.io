[![Build Status](https://travis-ci.org/Enselic/sequencediagram.io.svg?branch=master)](https://travis-ci.org/Enselic/sequencediagram.io)
[![Coverage Status](https://coveralls.io/repos/github/Enselic/sequencediagram.io/badge.svg?branch=master)](https://coveralls.io/github/Enselic/sequencediagram.io?branch=master)
[![Semver](http://img.shields.io/SemVer/2.0.0.png)](http://semver.org/spec/v2.0.0.html)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.png?v=103)](https://opensource.org/licenses/mit-license.php)

https://sequencediagram.io
==========================

Pleasurably create simple and sharable sequence diagrams directly in the browser. Also works offline.


Why this project exists
=======================

I wanted there to be a pleasurable way to create simple sequence diagrams.
For instance, adding three objects to a diagram should be at most three clicks,
and removing three objects from a diagram should also be at most three clicks.
Most other software suffers from feature bloat, causing even even basic diagram operations
to require several interactions.


Target audience
===============

Software developers sitting at their desktop using modern browsers, and they
already know what a sequence diagram is.

Important design points
-----------------------

* It is important that when the user is idle, the digram shown is without controls.
This is so that when the digram is shared by sending its URL, it looks clean and pretty when just viewed. And we don't want to complicate the UI with a "enter view mode" mode.


Roadmap
=======

The current feature set is minimal but useful.
Here is a list of features that I plan on adding later, roughly sorted by descending priority.
Contributions of any kind are very welcomed however!

- Make Object movable vertically to represent creation
- Support visualization of so called found/lost messages, i.e. messages originating form/ending in a circle
- Allow X-es to be added to lifelines, representing object destruction
- Support adding arbitrary comments to the diagram
- Support more browsers i.e. make the test suite work on more browsers
- Support touch-based editing of diagrams in a good way (must not interfer with primary audience using mouse input however)
- Support SVG export to allow embedding in in e.g. PDFs. For now, users can take PNG screenshots of the app
- Integrate with user accounts from other services to allow user accounts to take ownership of diagrams
- Let the user add so called activation boxes to lifelines to represent processing
- Support adding a title to the diagram (work in progress: https://github.com/Enselic/sequencediagram.io/tree/add-title)
- Allow nesting of activation boxes
- Support conditions on lifelines somehow
- Support pictograms. Maybe through unicode pictograms in a larger font-size.
- Support exporting a powerpoint where each slide adds a message


Setting up for development
==========================

It should work to git clone this repo and then run `npm start` after `npm install`.
To run the automated tests it should work to run `npm test` while `npm start` is
running.

Visual Studio Code
------------------

First launch Google Chrome with `google-chrome --remote-debugging-port=9222`.
Then open up the project in vscode with `code sequencediagram.io/`. Now you
should be able to set breakpoints, launch, debug, etc (after `npm start` as per
above), after installing the `Debugger for Chrome` vscode extension.

Folder structure and technology
----------------------------

```
public/
src/
Web app using React (via create-react-app) and Redux

backend/
NodeJS backend using AWS Lambda, AWS API Gateway, AWS DynamoDB, with localhost wrappers

end-to-end-tests/
Automated and high level tests of both the web app and backend using selenium-webdriver

config/
scripts/build.js
Configuration and script for building production version of the web app.

scripts-ci/
Scripts used by CI. To run it all locally, see below.

static/
Things at http://static.sequencediagram.io/
```

Running tests like Travis CI
----------------------------

```bash
scripts-ci/run-tests-like-travis-ci.sh
```


TODO
====

List of minor/uninteresting things to do, roughly sorted by priority.
- code coverage for JSON schema validator
- Make 'saved revision X' link clickable
- Add link to release notes in message about new version
- Fade in controls slowly to reduce flicker (as requested by Pavel)
- make it easy to 'fork' a diagram
- Make /f4Fdfh76d/123 an invalid URL that should not create a new diagram
- add support for finding and using revisions
- Make messages movable when grabbing buttons (like Pavel expected)
- optional encrypt on client side (server can't read data)
- Make adding a component edit its text directly
- Make it easy to run GremlinsJs
- make permalink work offline too, i.e. save last known state locally
- Add debugging tips to README.md
- make NewMesssageMarker only be where messages will be added
- Make tab switch objects
- Make <input /> show as multiline when the layout will wrap lines. Use <textarea /> ?
- Make messages movable horizontally
- Create a more accurate text measurer
