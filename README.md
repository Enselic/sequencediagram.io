[![Build Status](https://travis-ci.org/Enselic/sequencediagram.io.svg?branch=master)](https://travis-ci.org/Enselic/sequencediagram.io)
[![Coverage Status](https://coveralls.io/repos/github/Enselic/sequencediagram.io/badge.svg?branch=master-with-code-coverage)](https://coveralls.io/github/Enselic/sequencediagram.io?branch=master-with-code-coverage)
[![Semver](http://img.shields.io/SemVer/2.0.0.png)](http://semver.org/spec/v2.0.0.html)
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

It is important that when the user is idle, the digram shown is without controls.
This is so that when the digram is shared by sending its URL, it looks clean and pretty when just viewed.
And we don't want to complicate the UI with a "enter view mode" mode.


Roadmap
=======

The current feature set is minimal but useful.
Here is a list of features that I plan on adding later, roughly sorted by descending priority.
Contributions of any kind are very welcomed however!

- Support more browsers i.e. make the test suite work on more browsers
- Support adding a title to the diagram (work in progress: https://github.com/Enselic/sequencediagram.io/tree/add-title)
- Support touch-based editing of diagrams in a good way (must not interfer with primary audience using mouse input however)
- Support adding arbitrary comments to the diagram
- Support SVG export to allow embedding in in e.g. PDFs. For now, users can take PNG screenshots of the app
- Support visualization of so called found message, i.e. messages originating form a solid circle
- Let the user add so called activation boxes to lifelines to represent processing
- Allow nesting of activation boxes
- Allow X-es to be added to lifelines, representing object destruction
- Optimize for consistent 60 FPS animations. Nice to have of course but probably quite a bit of work


Setting up for development
==========================

It should work to git clone this repo and then run `npm start` after `npm install`.
To run the automated tests it should work to run `npm test` while `npm start` is
running.

Technology
----------

- React (via create-react-app) and Redux for the app
- selenium-webdriver for automated end-to-end testing.


Misc
====

Diagram using all current features, i.e. the "most advanced" diagram you can create:
https://SequenceDiagram.io/#o5,Friend;o4,User;o1,Web%20browser;o2,Server;m8,o5,o4,say(%22visit%20URL%22),a;m3,o4,o1,enter%20URL;m4,o4,o1,Press%20return;m1,o1,o2,GET%20%2F;m5,o2,o1,response,r;m6,o1,o1,parse%20and%20render;m7,o1,o4,display


TODO
====

List of minor/uninteresting things to do, roughly sorted by priority.
- Make adding an object preselect its text
- Make <input /> show as multiline when the layout will wrap lines. Use <textarea /> ?
- Make tab switch objects
- Create a more accurate text measurer
- Make messages movable horizontally
- Use CSS3 translate instead of left/top to animate objects and message. Will probably result in higher FPS
