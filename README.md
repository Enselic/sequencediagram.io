
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

Software developers sitting at their desktop using modern browsers.

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

- Let the user select if messages are normal or replies (with a dashed message line)
- Let the user specify if messages are synchronous (solid arrow head) or asynchronous (open arrow head)
- Let the user add so called activation boxes to lifelines to represent processing
- Support touch-based editing of diagrams in a good way (must not interfer with primary audience using mouse input however)
- Support adding message in a single click-drag-release motion (click at start, release at end)
- support adding objects at arbitrary indexes by dragging the 'add object' button to desired index
- Support adding arbitrary comments to the diagram
- Support SVG export to allow embedding in in e.g. PDFs. For now, users can take PNG screenshots of the app
- Allow nesting of activation boxes
- Allow X-es to be added to lifelines, representing object destruction
- Support visualization of so called found message, i.e. messages originating form a solid circle
- Optimize for consistent 60 FPS animations. Nice to have of course but probably quite a bit of work


Setting up for development
==========================

Should work to git clone this repo and then run `npm start` after `npm install`.
To run the automated tests you need make Selenium 2/WebDriver to work, then just
run `npm test`.

Technology
----------

- Redux + React for the app
- selenium-webdriver for automated end-to-end testing.
  (I'm not a big fan of implementation-dependent testing because they are a pain to maintain.)


Misc
====

Large diagram using all current features:
https://SequenceDiagram.io/#o4,User;o1,Web%20browser;o2,Server;m3,o4,o1,enter%20URL;m4,o4,o1,Press%20return;m1,o1,o2,GET%20%2F;m5,o2,o1,response;m6,o1,o1,parse%20and%20render;m7,o1,o4,display


TODO
====

List of minor/uninteresting things to do, roughly sorted by priority.
- Create a more accurate text measurer
- Make page warn when using unsupported browsers
- Add more end-to-end tests so that all current features are covered, like message end point move, including undo redo
- Bug: React doesn't trigger mouse enter if the mouse static but components move in under the cursor
- Bug: Message grab points does not remain filled when dragged
- Enable Cache-Control using deploy scripts
- make features more discoverable using a tutorial-like approach
- Make adding an actor edit its text. Makes text edit discoverabble
- make pending message animate nicely to real message
- make pending message and end-point-of-message move behave the same with regards to lifeline "stickyness"
