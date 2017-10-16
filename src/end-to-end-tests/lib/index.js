import { logging, Builder, By, until, Key, promise } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';

const SeleniumPromise = promise.Promise;

// Set to true if you want to have time to observe what the tests
// are doing
const SLOW_DOWN_FOR_HUMAN_OBSERVATION = !!process.env
  .SLOW_DOWN_FOR_HUMAN_OBSERVATION;

// Default to headless testing when running in Continous Integration environments
const HEADLESS = !!process.env.CI && !SLOW_DOWN_FOR_HUMAN_OBSERVATION;

export function getPort() {
  // CI scripts run from npm run build with serve (port 5000)
  // while you (typically) you run from npm start (port 3000)
  return process.env.PORT || (process.env.CI ? '5000' : '3000');
}

export function getSchemeAndHost() {
  return 'http://localhost';
}

export function buildDriver() {
  let options = new Options();
  let args = ['window-size=1280,1050'];
  if (HEADLESS) {
    args = args.concat(['headless', 'disable-gpu']);
  }
  options.addArguments(...args);
  const prefs = new logging.Preferences();
  // So we can test the we don't forget debug logs
  prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);
  options.setLoggingPrefs(prefs);
  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}

export function applyTimeoutFactor(timeout) {
  const factor = SLOW_DOWN_FOR_HUMAN_OBSERVATION ? 4 : 1;
  return timeout * factor;
}

export async function waitForCssTransitions(driver) {
  return driver.sleep(300);
}

export async function sleepIfHumanObserver(driver, seconds) {
  if (!SLOW_DOWN_FOR_HUMAN_OBSERVATION) {
    return true;
  }

  return driver.sleep(seconds * 1000);
}

export async function getTextCenterPos(driver, text) {
  const el = await findElementByText(driver, text);
  const pos = await el.getLocation();
  const size = await el.getSize();
  return { x: pos.x + size.width / 2, y: pos.y + size.height / 2 };
}

export function reversePromise(promise) {
  return new SeleniumPromise((resolve, reject) => {
    promise.then(reject).catch(resolve);
  });
}

function byText(text) {
  return By.xpath("//*[contains(text(),'" + text + "')]");
}

export async function waitForElement(driver, text) {
  const locator = byText(text);
  return driver.wait(until.elementLocated(locator), 2000);
}

export async function findElementByText(driver, text) {
  const locator = byText(text);
  await waitForElement(driver, text);
  return driver.findElement(locator);
}

export async function mouseMoveInSteps(driver, totalOffset) {
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
    await sleepIfHumanObserver(driver, 1.5 / steps);
  }
  return true;
}

export async function dragAndDrop(driver, elementText, offset) {
  await driver
    .actions()
    .mouseDown(await findElementByText(driver, elementText))
    .perform();
  await sleepIfHumanObserver(driver, 0.7);

  await mouseMoveInSteps(driver, offset);

  await driver
    .actions()
    .mouseUp()
    .perform();
  return sleepIfHumanObserver(driver, 0.7);
}

export async function clickText(driver, elementText) {
  return clickElement(driver, await findElementByText(driver, elementText));
}

async function clickElement(driver, element) {
  await driver
    .actions()
    .click(element)
    .perform();
  return waitForCssTransitions(driver);
}

export async function typeTextAndPressReturn(driver, typedText) {
  await typeText(driver, typedText);
  return driver
    .actions()
    .sendKeys(Key.RETURN)
    .perform();
}

export async function typeText(driver, typedText) {
  await driver
    .actions()
    .sendKeys(typedText)
    .perform();
}

export async function clickAndType(driver, elementText, typedText) {
  await clickText(driver, elementText);
  await typeTextAndPressReturn(driver, typedText);
  return waitForCssTransitions(driver);
}

export async function assertFragment(driver, expected) {
  await sleepIfHumanObserver(driver, 0.7);
  return new SeleniumPromise((resolve, reject) => {
    driver
      .getCurrentUrl()
      .then(url => {
        const fragment = url.substring(url.indexOf('#') + 1);
        if (fragment === expected) {
          resolve();
        } else {
          const msg = 'expected: ' + expected + ' got: ' + fragment;
          reject(msg);
        }
      })
      .catch(e => console.log(e));
  });
}

export function urlParsing(driver, url, expected) {
  return async () => {
    await goTo(driver, url);
    return assertFragment(driver, expected ? expected : url);
  };
}

export async function goTo(driver, startState) {
  // When no fragment is requsted, make sure to not even include '#'
  const fragment = startState ? '#' + startState : '';
  await driver.get(`${getSchemeAndHost()}:${getPort()}/${fragment}`);
  /* We use 0.3 second CSS transitions, so make sure those have
     * settled before we move on.
     */
  return waitForCssTransitions(driver);
}

export function move(
  driver,
  startState,
  grabbedText,
  toMove,
  expectedEndState
) {
  return async () => {
    await goTo(driver, startState);
    await dragAndDrop(driver, grabbedText, toMove);
    return assertFragment(driver, expectedEndState);
  };
}

export async function clickLifelineForObjectWithText(driver, objectText) {
  await driver
    .actions()
    .mouseMove(await findElementByText(driver, objectText), { x: 30, y: 100 })
    .click()
    .perform();
  await waitForCssTransitions(driver);
  return sleepIfHumanObserver(driver, 0.7);
}

export async function clickAddObject(driver) {
  await clickText(driver, 'Add object');
  await waitForCssTransitions(driver);
  return sleepIfHumanObserver(driver, 0.7);
}

export async function addMessage(driver, sender, receiver) {
  const startEl = await findElementByText(driver, sender);
  const endEl = await findElementByText(driver, receiver);
  const startLoc = await startEl.getLocation();
  const endLoc = await endEl.getLocation();
  const fromObjectNameToLifelineOffset = { x: 30, y: 70 };

  await driver
    .actions()
    .mouseMove(startEl, fromObjectNameToLifelineOffset)
    .click()
    .perform();
  await sleepIfHumanObserver(driver, 0.7);

  await mouseMoveInSteps(driver, calcOffset(startLoc, endLoc));

  await driver
    .actions()
    .click()
    .perform();
  return sleepIfHumanObserver(driver, 0.7);
}

function calcOffset(startLoc, endLoc) {
  return { x: endLoc.x - startLoc.x, y: endLoc.y - startLoc.y };
}

export async function moveAnchorPointToActor(
  driver,
  messageKey,
  anchorPointType,
  actorName
) {
  // Low prio todo: Stop depending on the implementation detail that messages have
  // anchor point buttons with certain IDs without complicating testing code too much
  const messageAnchorPointEl = await driver.findElement(
    By.id(messageKey + '-' + anchorPointType)
  );
  const actorNameEl = await findElementByText(driver, actorName);
  const messageAnchorPointLoc = await messageAnchorPointEl.getLocation();
  const actorNameLoc = await actorNameEl.getLocation();
  let offsetToMove = calcOffset(messageAnchorPointLoc, actorNameLoc);
  offsetToMove.y = 0;

  await driver
    .actions()
    .click(messageAnchorPointEl)
    .perform();
  await mouseMoveInSteps(driver, offsetToMove);
  await driver
    .actions()
    .click()
    .perform();
}

export async function flip(driver, id) {
  // Low prio todo: Stop depending on the implementation detail that messages have
  // flip buttons with certain IDs without complicating testing code too much
  await driver
    .actions()
    .click(await driver.findElement(By.id('flip-' + id)))
    .perform();
  return sleepIfHumanObserver(driver, 0.7);
}

export async function toggleArrowStyle(driver, id) {
  // Low prio todo: Stop depending on the implementation detail that messages have
  // toggle buttons with certain IDs without complicating testing code too much
  await driver
    .actions()
    .click(await driver.findElement(By.id('toggle-arrow-style-' + id)))
    .perform();
  return sleepIfHumanObserver(driver, 0.7);
}

export async function toggleLineStyle(driver, id) {
  // Low prio todo: Stop depending on the implementation detail that messages have
  // toggle buttons with certain IDs without complicating testing code too much
  await driver
    .actions()
    .click(await driver.findElement(By.id('toggle-line-style-' + id)))
    .perform();
  return sleepIfHumanObserver(driver, 0.7);
}

export async function removeComponentWithKey(driver, id) {
  // Low prio todo: Stop depending on the implementation detail that components have
  // remove buttons with certain IDs without complicating testing code too much
  await driver
    .actions()
    .click(await driver.findElement(By.id('remove-' + id)))
    .perform();
  return waitForCssTransitions(driver);
}

/**
 * Run this function after setting up all other tests.
 */
export function setupNoBrowserLogOutputTest(driver) {
  it('no browser log output', async () => {
    const okEntries = [
      'Download the React DevTools for a better development experience',
      'Content is cached for offline use.',
      'New content is available; please refresh.',
    ];

    let logEntries = await driver
      .manage()
      .logs()
      .get(logging.Type.BROWSER);

    logEntries = logEntries.filter(entry => {
      let wasOk = false;
      okEntries.forEach(okEntry => {
        wasOk |= entry.message.indexOf(okEntry) >= 0;
      });
      return !wasOk;
    });

    expect(logEntries).toEqual([]);
  });
}
