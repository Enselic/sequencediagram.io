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
const SLOW_DOWN_FOR_HUMAN_OBSERVATION = 0

// Default to headless testing when running in Continous Integration environments
const HEADLESS = !!process.env.CI

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10 * 1000;
if (SLOW_DOWN_FOR_HUMAN_OBSERVATION) {
    jasmine.DEFAULT_TIMEOUT_INTERVAL *= 4;
}

let { Builder, By, until, Key, promise } = require('selenium-webdriver');
let { Options } = require('selenium-webdriver/chrome');
let devUtils = require('../devUtils');

global.Key = Key;

let options = new Options();
if (HEADLESS) {
    options.addArguments('headless', 'disable-gpu');
}
global.driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

global.SPromise = promise.Promise;

afterAll(() => {
    driver.quit();
});

// Helper functions

global.sleep = function(seconds) {
    driver.sleep(seconds * 1000);
}

function transitionsDisabled() {
    return devUtils.devMode;
}

global.sleepIfTransitionsEnabled = function(seconds) {
    if (transitionsDisabled()) {
        // The UI reacts immediately to input, no need to sleep
    } else {
        sleep(seconds);
    }
}

global.waitForCssTransitions = function() {
    if (!transitionsDisabled()) {
        sleep(0.3);
    }
}

global.sleepIfHumanObserver = function(seconds) {
    if (!SLOW_DOWN_FOR_HUMAN_OBSERVATION) {
        return;
    }

    sleep(seconds);
}

global.reversePromise = function(promise) {
    return new SPromise((resolve, reject) => {
        promise.then(reject).catch(resolve);
    });
}

global.byText = function(text) {
    return By.xpath("//*[contains(text(),'" + text + "')]");
}

global.waitForElement = function(text) {
    const locator = byText(text);
    return driver.wait(until.elementLocated(locator), 2000);
}

global.findElementByText = function(text) {
    const locator = byText(text);
    waitForElement(text);
    return driver.findElement(locator);
}

global.mouseMoveInSteps = function(totalOffset) {
    const steps = 20;
    let i = steps;
    while (i > 0) {
        i--;
        // Steps must be ints, otherwise WebDriver pukes
        const offsetStep = {
            x: Math.ceil(totalOffset.x / steps),
            y: Math.ceil(totalOffset.y / steps),
        };
        driver.actions().mouseMove(offsetStep).perform();
        sleepIfHumanObserver(0.7 / steps);
    }
}

function dragAndDrop(elementText, offset) {
    driver.actions().mouseDown(findElementByText(elementText)).perform();
    sleepIfHumanObserver(0.7);

    mouseMoveInSteps(offset);

    driver.actions().mouseUp().perform();
    sleepIfHumanObserver(0.7);
}

global.click = function(elementText) {
    clickElement(findElementByText(elementText));
}

global.clickElement = function(element) {
    driver.actions()
    .click(element)
    .perform();
    waitForCssTransitions();
}

global.typeAndConfirmm = function(typedText) {
    type(typedText);
    driver.actions()
    .sendKeys(Key.RETURN)
    .perform();
}

global.type = function(typedText) {
    driver.actions()
    .sendKeys(typedText)
    .perform();
}

global.clickAndType = function(elementText, typedText) {
    click(elementText);
    typeAndConfirmm(typedText);
    waitForCssTransitions();
}

global.assertFragment = function(expected) {
    sleepIfHumanObserver(0.7);
    return new SPromise((resolve, reject) => {
        driver.getCurrentUrl().then(url => {
            const fragment = url.substring(url.indexOf('#') + 1);
            if (fragment === expected) {
                resolve();
            } else {
                const msg = 'expected: ' + expected + ' got: ' + fragment;
                reject(msg);
            }
        }).catch(e => console.log(e));
    });
}

global.urlParsing = function(url, expected) {
    return () => {
        goTo(url);
        return assertFragment(expected ? expected : url);
    }
}

global.goTo = function(startState) {
    driver.get('http://localhost:3000/#' + startState);
    /* We use 0.3 second CSS transitions, so make sure those have
     * settled before we move on.
     */
    waitForCssTransitions();
    return startState;
}


global.move = function(startState, grabbedText, toMove, expectedEndState) {
    return () => {
        goTo(startState);
        dragAndDrop(grabbedText, toMove);
        return assertFragment(expectedEndState);
    };
}

global.clickLifelineForObjectWithText = function(objectText) {
    driver.actions().mouseMove(findElementByText(objectText), { x: 30, y: 100 }).click().perform();
    waitForCssTransitions();
    sleepIfHumanObserver(0.7);
}

global.clickAddObject = function() {
    click('Add object');
    waitForCssTransitions();
    sleepIfHumanObserver(0.7);
}

global.addMessage = function(start, end) {
    let startEl;
    let endEl;
    return Promise.all([
        findElementByText(start),
        findElementByText(end),
    ]).then(args => {
        startEl = args[0];
        endEl = args[1];
        return Promise.all([
            startEl.getLocation(),
            endEl.getLocation(),
        ]);
    }).then(args => {
        const startLoc = args[0];
        const endLoc = args[1];

        const fromObjectNameToLifelineOffset = { x: 30, y: 70 };

        driver.actions().mouseMove(startEl, fromObjectNameToLifelineOffset).click().perform();
        sleepIfHumanObserver(0.7);

        mouseMoveInSteps(calcOffset(startLoc, endLoc));

        const ret = driver.actions().click().perform();
        sleepIfHumanObserver(0.7);
        return ret;
    });
}


function calcOffset(startLoc, endLoc) {
    return { x: endLoc.x - startLoc.x, y: endLoc.y - startLoc.y };
}

global.moveEndPointToActor = async function(messageKey, endPointType, actorName) {
    // Low prio todo: Stop depending on the implementation detail that messages have
    // end point buttons with certain IDs without complicating testing code too much
    const messageEndPointEl = await driver.findElement(By.id(messageKey + '-' + endPointType));
    const actorNameEl = await findElementByText(actorName);
    const messageEndPointLoc = await messageEndPointEl.getLocation();
    const actorNameLoc = await actorNameEl.getLocation();
    const offsetToMove = calcOffset(messageEndPointLoc, actorNameLoc);

    await driver.actions().mouseMove(messageEndPointEl).mouseDown().perform();
    mouseMoveInSteps(offsetToMove);
    await driver.actions().mouseUp().perform();
}

global.flip = function(key) {
    // Low prio todo: Stop depending on the implementation detail that messages have
    // flip buttons with certain IDs without complicating testing code too much
    driver.actions().click(driver.findElement(By.id('flip-' + key))).perform();
    sleepIfHumanObserver(0.7);
}

global.toggleArrowStyle = function(key) {
    // Low prio todo: Stop depending on the implementation detail that messages have
    // toggle buttons with certain IDs without complicating testing code too much
    driver.actions().click(driver.findElement(By.id('toggle-arrow-style-' + key))).perform();
    sleepIfHumanObserver(0.7);
}

global.toggleLineStyle = function(key) {
    // Low prio todo: Stop depending on the implementation detail that messages have
    // toggle buttons with certain IDs without complicating testing code too much
    driver.actions().click(driver.findElement(By.id('toggle-line-style-' + key))).perform();
    sleepIfHumanObserver(0.7);
}

global.removeComponentWithKey = function(key) {
    // Low prio todo: Stop depending on the implementation detail that components have
    // remove buttons with certain IDs without complicating testing code too much
    driver.actions().click(driver.findElement(By.id('remove-' + key))).perform();
    waitForCssTransitions();
}


const filesWithTests = [
    'move-object.js',
    'add-object.js',
    'remove-object.js',
    'misc-object.js',

    'move-message.js',
    'add-message.js',
    'remove-message.js',
    'change-message-appearance.js',

    'misc.js',
    'undo-redo.js',
    'serialize-and-deserialize.js',
];

filesWithTests.forEach(file => {
    describe(file, () => {
        require('./' + file);
    })
})

// TODO: Click an empty area
// TODO: Click and drag on empty area
// TODO: Double-click on empty area
// TODO: drag and drop remove button shall not select text
// TODO: test devMode === false
// TODO: test that when there is a pending message, the controls for other messages is removed (to not be in the way)