/*

This file contains so called end-to-end tests.
These are tests that use use the application as a user would, i.e. it
should depend on as few implementation details as possible.
That way, the tests require minimal refactorings when the app itself is
refactored and even re-architectured.

We want the tests in the separate files to have access to all the helper functions
defined here without verbose exporting. That's why we put helper functions in
the global object

*/

// Set to true if you want to have time to observe what the tests
// are doing
const SLOW_DOWN_FOR_HUMAN_OBSERVATION = !!process.env
  .SLOW_DOWN_FOR_HUMAN_OBSERVATION;

// Default to headless testing when running in Continous Integration environments
const HEADLESS = !!process.env.CI && !SLOW_DOWN_FOR_HUMAN_OBSERVATION;

global.applyTimeoutFactor = function(timeout) {
  const factor = SLOW_DOWN_FOR_HUMAN_OBSERVATION ? 4 : 1;
  return timeout * factor;
};

jasmine.DEFAULT_TIMEOUT_INTERVAL = applyTimeoutFactor(10 * 1000);

let {
  logging,
  Builder,
  By,
  until,
  Key,
  promise,
} = require("selenium-webdriver");
let { Options } = require("selenium-webdriver/chrome");
let devUtils = require("../devUtils");

global.devMode = devUtils.devMode;

global.Key = Key;
global.logging = logging;

let options = new Options();
let args = ["window-size=1280,1050"];
if (HEADLESS) {
  args = args.concat(["headless", "disable-gpu"]);
}
options.addArguments(...args);
global.driver = new Builder()
  .forBrowser("chrome")
  .setChromeOptions(options)
  .build();

global.SPromise = promise.Promise;

afterAll(() => {
  return driver.quit();
});

// Helper functions

global.sleep = async function(seconds) {
  return driver.sleep(seconds * 1000);
};

function transitionsDisabled() {
  return devUtils.devMode;
}

global.sleepIfTransitionsEnabled = async function(seconds) {
  if (transitionsDisabled()) {
    // The UI reacts immediately to input, no need to sleep
    return true;
  } else {
    return sleep(seconds);
  }
};

global.waitForCssTransitions = async function() {
  if (!transitionsDisabled()) {
    return sleep(0.3);
  } else {
    return true;
  }
};

global.sleepIfHumanObserver = async function(seconds) {
  if (!SLOW_DOWN_FOR_HUMAN_OBSERVATION) {
    return true;
  }

  return sleep(seconds);
};

global.getTextCenterPos = async function(text) {
  const el = await findElementByText(text);
  const pos = await el.getLocation();
  const size = await el.getSize();
  return { x: pos.x + size.width / 2, y: pos.y + size.height / 2 };
};

global.reversePromise = function(promise) {
  return new SPromise((resolve, reject) => {
    promise.then(reject).catch(resolve);
  });
};

global.byText = function(text) {
  return By.xpath("//*[contains(text(),'" + text + "')]");
};

global.waitForElement = async function(text) {
  const locator = byText(text);
  return driver.wait(until.elementLocated(locator), 2000);
};

global.findElementByText = async function(text) {
  const locator = byText(text);
  await waitForElement(text);
  return driver.findElement(locator);
};

global.mouseMoveInSteps = async function(totalOffset) {
  const steps = 20;
  let i = steps;
  while (i > 0) {
    i--;
    // Steps must be ints, otherwise WebDriver pukes
    const offsetStep = {
      x: Math.ceil(totalOffset.x / steps),
      y: Math.ceil(totalOffset.y / steps),
    };
    await driver
      .actions()
      .mouseMove(offsetStep)
      .perform();
    await sleepIfHumanObserver(1.5 / steps);
  }
  return true;
};

global.dragAndDrop = async function(elementText, offset) {
  await driver
    .actions()
    .mouseDown(await findElementByText(elementText))
    .perform();
  await sleepIfHumanObserver(0.7);

  await mouseMoveInSteps(offset);

  await driver
    .actions()
    .mouseUp()
    .perform();
  return sleepIfHumanObserver(0.7);
};

global.click = async function(elementText) {
  return clickElement(await findElementByText(elementText));
};

global.clickElement = async function(element) {
  await driver
    .actions()
    .click(element)
    .perform();
  return waitForCssTransitions();
};

global.typeAndConfirmm = async function(typedText) {
  await type(typedText);
  return driver
    .actions()
    .sendKeys(Key.RETURN)
    .perform();
};

global.type = async function(typedText) {
  await driver
    .actions()
    .sendKeys(typedText)
    .perform();
};

global.clickAndType = async function(elementText, typedText) {
  await click(elementText);
  await typeAndConfirmm(typedText);
  return waitForCssTransitions();
};

global.assertFragment = async function(expected) {
  await sleepIfHumanObserver(0.7);
  return new SPromise((resolve, reject) => {
    driver
      .getCurrentUrl()
      .then(url => {
        const fragment = url.substring(url.indexOf("#") + 1);
        if (fragment === expected) {
          resolve();
        } else {
          const msg = "expected: " + expected + " got: " + fragment;
          reject(msg);
        }
      })
      .catch(e => console.log(e));
  });
};

global.urlParsing = function(url, expected) {
  return async () => {
    await goTo(url);
    return assertFragment(expected ? expected : url);
  };
};

global.goTo = async function(startState) {
  // CI scripts run from npm run build with serve (port 5000)
  // while you (typically) you run from npm start (port 3000)
  const port = process.env.PORT || (HEADLESS ? "5000" : "3000");

  // When no fragment is requsted, make sure to not even include '#'
  const fragment = startState ? "#" + startState : "";
  await driver.get(`http://localhost:${port}/${fragment}`);
  /* We use 0.3 second CSS transitions, so make sure those have
     * settled before we move on.
     */
  return waitForCssTransitions();
};

global.move = function(startState, grabbedText, toMove, expectedEndState) {
  return async () => {
    await goTo(startState);
    await dragAndDrop(grabbedText, toMove);
    return assertFragment(expectedEndState);
  };
};

global.clickLifelineForObjectWithText = async function(objectText) {
  await driver
    .actions()
    .mouseMove(await findElementByText(objectText), { x: 30, y: 100 })
    .click()
    .perform();
  await waitForCssTransitions();
  return sleepIfHumanObserver(0.7);
};

global.moveToComponentWithText = async function(componentText) {
  return driver
    .actions()
    .mouseMove(await findElementByText(componentText))
    .perform();
};

global.clickAddObject = async function() {
  await click("Add object");
  await waitForCssTransitions();
  return sleepIfHumanObserver(0.7);
};

global.addMessage = async function(start, end) {
  const startEl = await findElementByText(start);
  const endEl = await findElementByText(end);
  const startLoc = await startEl.getLocation();
  const endLoc = await endEl.getLocation();
  const fromObjectNameToLifelineOffset = { x: 30, y: 70 };

  await driver
    .actions()
    .mouseMove(startEl, fromObjectNameToLifelineOffset)
    .click()
    .perform();
  await sleepIfHumanObserver(0.7);

  await mouseMoveInSteps(calcOffset(startLoc, endLoc));

  await driver
    .actions()
    .click()
    .perform();
  return sleepIfHumanObserver(0.7);
};

function calcOffset(startLoc, endLoc) {
  return { x: endLoc.x - startLoc.x, y: endLoc.y - startLoc.y };
}

global.moveEndPointToActor = async function(
  messageKey,
  endPointType,
  actorName
) {
  // Low prio todo: Stop depending on the implementation detail that messages have
  // end point buttons with certain IDs without complicating testing code too much
  const messageEndPointEl = await driver.findElement(
    By.id(messageKey + "-" + endPointType)
  );
  const actorNameEl = await findElementByText(actorName);
  const messageEndPointLoc = await messageEndPointEl.getLocation();
  const actorNameLoc = await actorNameEl.getLocation();
  let offsetToMove = calcOffset(messageEndPointLoc, actorNameLoc);
  offsetToMove.y = 0;

  await driver
    .actions()
    .click(messageEndPointEl)
    .perform();
  await mouseMoveInSteps(offsetToMove);
  await driver
    .actions()
    .click()
    .perform();
};

global.flip = async function(key) {
  // Low prio todo: Stop depending on the implementation detail that messages have
  // flip buttons with certain IDs without complicating testing code too much
  await driver
    .actions()
    .click(await driver.findElement(By.id("flip-" + key)))
    .perform();
  return sleepIfHumanObserver(0.7);
};

global.toggleArrowStyle = async function(key) {
  // Low prio todo: Stop depending on the implementation detail that messages have
  // toggle buttons with certain IDs without complicating testing code too much
  await driver
    .actions()
    .click(await driver.findElement(By.id("toggle-arrow-style-" + key)))
    .perform();
  return sleepIfHumanObserver(0.7);
};

global.toggleLineStyle = async function(key) {
  // Low prio todo: Stop depending on the implementation detail that messages have
  // toggle buttons with certain IDs without complicating testing code too much
  await driver
    .actions()
    .click(await driver.findElement(By.id("toggle-line-style-" + key)))
    .perform();
  return sleepIfHumanObserver(0.7);
};

global.removeComponentWithKey = async function(key) {
  // Low prio todo: Stop depending on the implementation detail that components have
  // remove buttons with certain IDs without complicating testing code too much
  await driver
    .actions()
    .click(await driver.findElement(By.id("remove-" + key)))
    .perform();
  return waitForCssTransitions();
};

const filesWithTests = [
  "move-object.js",
  "add-object.js",
  "remove-object.js",
  "misc-object.js",

  "move-message.js",
  "add-message.js",
  "remove-message.js",
  "change-message-appearance.js",

  "misc.js",
  "undo-redo.js",
  "serialize-and-deserialize.js",
];

filesWithTests.forEach(file => {
  describe(file, () => {
    require("./" + file);
  });
});

test("no browser log output", async () => {
  const logEntries = await driver
    .manage()
    .logs()
    .get(logging.Type.BROWSER);
  expect(logEntries).toEqual([]);
});
