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

import { logging, Key, promise } from 'selenium-webdriver';

import {
  applyTimeoutFactor,
  buildDriver,
  getSchemeAndHost,
  getPort,
  setupNoBrowserLogOutputTest,
} from './lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = applyTimeoutFactor(10 * 1000);

global.driver = buildDriver();

afterAll(() => {
  return driver.quit();
});

const filesWithTests = [
  'move-object.js',
  'add-object.js',
  'remove-object.js',
  'misc-object.js',
  'move-message.js',
  'add-message.js',
  'remove-message.js',
  'change-message-appearance.js',
  'undo-redo.js',
  'serialize-and-deserialize.js',
];

filesWithTests.forEach(file => {
  describe(file, () => {
    require('./' + file);
  });
});

setupNoBrowserLogOutputTest(driver);