[![Build Status](https://travis-ci.org/Enselic/sequencediagram.io.svg?branch=master)](https://travis-ci.org/Enselic/sequencediagram.io)
[![Coverage Status](https://coveralls.io/repos/github/Enselic/sequencediagram.io/badge.svg?branch=master-with-code-coverage)](https://coveralls.io/github/Enselic/sequencediagram.io?branch=master-with-code-coverage)
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

* It is important that in 'Offline mode', the diagram state is kept in the fragment part
of the URL. This enables users to construct diagrams with sensitive data since the fragment
will not end up in any HTTP server logs.


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

Technology
----------

- React (via create-react-app) and Redux for the app
- selenium-webdriver for automated end-to-end testing.

Running tests like Travis CI
----------------------------

Paste the following into a terminal:
```
scripts-ci/start-services-in-background.sh &
scripts-ci/wait-for-ports.sh 8000 5000
CI=t scripts-ci/run-tests.sh
```


Misc
====

Diagram using all current features, i.e. the "most advanced" diagram you can create:
https://SequenceDiagram.io/#o5,Friend;o4,User;o1,Web%20browser;o2,Server;m8,o5,o4,say(%22visit%20URL%22),a;m3,o4,o1,enter%20URL;m4,o4,o1,Press%20return;m1,o1,o2,GET%20%2F;m5,o2,o1,response,r;m6,o1,o1,parse%20and%20render;m7,o1,o4,display


TODO
====

List of minor/uninteresting things to do, roughly sorted by priority.
- Fade in controls slowly to reduce flicker (as requested by Pavel)
- Make 'Undo' cancel pending message (like Pavel expected)
- Make messages movable when grabbing buttons (like Pavel expected)
- Default to using permalinks:
  - https://sequencediagram.io/1234 points to latest version
  - https://sequencediagram.io/1234/12 points to revision 12
  - optional login/authentication
  - custom names
- Make adding a component edit its text directly
- Add debugging tips to README.md
- make NewMesssageMarker only be where messages will be added
- Make tab switch objects
- Make <input /> show as multiline when the layout will wrap lines. Use <textarea /> ?
- Make messages movable horizontally
- Create a more accurate text measurer
- compare ourselves with websequencediagram dot com, our main competitor
