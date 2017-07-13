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

// Set to false to show tests while they run. The main reason we default to
// running headless is to make it configuration easier for CI builds
const HEADLESS = !SLOW_DOWN_FOR_HUMAN_OBSERVATION && 1

if (SLOW_DOWN_FOR_HUMAN_OBSERVATION) {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
}
let { Builder, By, until, Key, promise } = require('selenium-webdriver');
let { Options } = require('selenium-webdriver/chrome');
let devUtils = require('../devUtils');

let options = new Options();
if (HEADLESS) {
    options.addArguments('headless', 'disable-gpu');
}
global.driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

let Promise = promise.Promise;

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

global.findElementByText = function(text) {
    const locator = By.xpath("//*[contains(text(),'" + text + "')]");
    driver.wait(until.elementLocated(locator));
    return driver.findElement(locator);
}

function dragAndDrop(elementText, offset) {
    driver.actions().mouseDown(findElementByText(elementText)).perform();
    // XXX: Why can't we set this to 20 without stalling WebDriver command execution?
    const steps = 5;
    let i = steps;
    while (i > 0) {
        i--;
        driver.actions().mouseMove({ x: offset.x / steps, y: offset.y / steps }).perform();
        sleepIfHumanObserver(0.7 / steps);
    }
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
    driver.actions()
    .sendKeys(typedText)
    .sendKeys(Key.RETURN)
    .perform();
}

global.clickAndType = function(elementText, typedText) {
    click(elementText);
    typeAndConfirmm(typedText);
    waitForCssTransitions();
}

global.assertFragment = function(expected) {
    sleepIfHumanObserver(0.7);
    return new Promise((resolve, reject) => {
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
}

global.clickAddObject = function() {
    click('Add object');
    waitForCssTransitions();
}

global.removeComponentWithKey = function(key) {
    // Low prio todo: Stop depending on the implementation detail that components have
    // remove buttons with certain IDs without complicating testing code too much
    driver.actions().click(driver.findElement(By.id('remove-' + key))).perform();
    waitForCssTransitions();
}

global.ctrlZ = function() {
    driver.actions().sendKeys([ Key.CONTROL, 'z', Key.NULL ]).perform();
    waitForCssTransitions();
}



require('./move-object');
require('./add-object');
require('./remove-object');
require('./misc-object');

require('./move-message');
require('./add-message');
require('./remove-message');
require('./change-message-appearance');

require('./misc');
require('./undo-redo');
require('./serialize-and-deserialize');

// TODO: Click an empty area
// TODO: Click and drag on empty area
// TODO: Double-click on empty area
// TODO: drag and drop remove button shall not select text
// TODO: test devMode === false
// TODO: test that when there is a pending message, the controls for other messages is removed (to not be in the way)