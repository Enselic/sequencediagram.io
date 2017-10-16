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
  'misc.js',
  'undo-redo.js',
  'serialize-and-deserialize.js',
];

filesWithTests.forEach(file => {
  describe(file, () => {
    require('./' + file);
  });
});

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
