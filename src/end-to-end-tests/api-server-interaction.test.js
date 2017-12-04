/**
 * This file contains various tests for how the web app interactions with the
 * backend API server. Since the tests brings up and tears down the API server
 * for testing purposes, all tests that are affected by the API server beingn
 * up or not must be in this file. In all other files it is random if the API
 * server is up or not.
 */

import {
  clickAddObject,
  buildDriverAndSetupEnv,
  getHostAndPort,
  goTo,
  renameComponentFromTo,
  setupNoBrowserLogOutputTest,
  waitForElement,
  removeComponentWithKey,
} from './lib';
import ApiServerLocal from './../../backend/api-server/api-server-localhost';
import url from 'url';

const driver = buildDriverAndSetupEnv();

async function waitForPermalink() {
  let tries = 25;
  let currentUrl;
  while (tries-- > 0) {
    currentUrl = await driver.getCurrentUrl();
    if (url.parse(currentUrl).path.length > 1) {
      return currentUrl;
    }
    await driver.sleep(200);
  }
  throw new Error('timed out in waitForPermalink()');
}

describe('when the API server is fully functional', async () => {
  // Use a short artificial delay get more extreme latency
  const timeout = 2000;
  const server = new ApiServerLocal(timeout);
  let newlyCreatedPermalink = null;
  // Use random names to reduce risk of us seeing old data
  const randomObjectName1 = 'object1-' + Math.ceil(Math.random() * 1000000000);
  const randomObjectName2 = 'object2-' + Math.ceil(Math.random() * 1000000000);

  beforeAll(async () => {
    await server.listen();
  });

  afterAll(async () => {
    await server.close();
  });

  it('creating a new diagram works', async () => {
    await goTo(driver, '');
    newlyCreatedPermalink = await waitForPermalink();
    await clickAddObject(driver);
    await renameComponentFromTo(driver, 'NewObject', randomObjectName1);
    await driver.sleep(1000);
    await waitForElement(driver, 'Saved');
  });

  it('loading an existing diagram works', async () => {
    // Go somewhere else to make sure it's not old state we're seeing
    await driver.get('http://static.sequencediagram.io/acknowledgements.html');
    // Then go to the permalink
    await driver.get(newlyCreatedPermalink);
    await waitForElement(driver, randomObjectName1);
    await clickAddObject(driver);
    await renameComponentFromTo(driver, 'NewObject', randomObjectName2);
    await driver.sleep(1000);
    await waitForElement(driver, 'Saved');
  });

  it('modifications are remembered', async () => {
    // Go somewhere else to make sure it's not old state we're seeing
    await driver.get('http://static.sequencediagram.io/acknowledgements.html');
    // Then go to the permalink
    await driver.get(newlyCreatedPermalink);
    await waitForElement(driver, randomObjectName2);
  });

  it('gracefully handles non-existing diagram', async () => {
    const initialUrl = `${getHostAndPort()}/2345678abC`;
    await driver.get(initialUrl);
    await waitForElement(driver, 'Error: Could not load diagram');
    expect(await driver.getCurrentUrl()).toEqual(initialUrl);
    // TODO: prevent creating of diagram components
  });

  it('MANUAL: save before id allocated (no "Saved" flicker)', async () => {
    await goTo(driver, '');
    // Before an ID has been allocated, make a change ...
    await clickAddObject(driver);
    // ... that should not have crashed the app
    await waitForPermalink();
    await driver.sleep(1000);
    await waitForElement(driver, 'Saved');
  });
});

describe('when the API server is down the web app', async () => {
  it('informs about the network error when creating a new diagram', async () => {
    await goTo(driver, '');
    await waitForElement(driver, 'Could not connect');
  });

  it('gracefully handles creating a new diagram', async () => {
    await goTo(driver, '');
    await waitForElement(driver, 'Could not connect');
    // Should still be possible to modify the diagram
    await clickAddObject(driver);
    await waitForElement(driver, 'NewObject');
  });

  it('gracefully handles non-existing diagram', async () => {
    const initialUrl = `${getHostAndPort()}/2345678abC`;
    await driver.get(initialUrl);
    await waitForElement(driver, 'Error: Could not connect');
    expect(await driver.getCurrentUrl()).toEqual(initialUrl);
  });
});

describe('when the API server goes down, then comes back up', async () => {
  it(
    'new -> permalink -> Could not connect -> Saved',
    async () => {
      const server = new ApiServerLocal();

      // API server is operating as normal
      await server.listen();
      try {
        await goTo(driver, '');

        // We got a permalink id
        const permalink = await waitForPermalink();

        // Now the server goes down
        await server.close();

        // After modifying the diagram, the web app should discover the problem
        await clickAddObject(driver);
        await waitForElement(driver, 'Could not connect');

        // Now the server comes back up
        await server.listen();
        await driver.sleep(1000);
        await clickAddObject(driver);
        await waitForElement(driver, 'Saved');
        expect(await driver.getCurrentUrl()).toEqual(permalink);
      } finally {
        // Cleanup
        await server.close();
      }
    },
    20 * 1000
  );
});

describe('when the API server is down but comes up later it', async () => {
  it('works to get a permalink allocated later', async () => {
    await goTo(driver, '');
    await waitForElement(driver, 'Could not connect');
    await removeComponentWithKey(driver, 'o1');
    await renameComponentFromTo(driver, 'Bar', 'From before API server');

    const server = new ApiServerLocal();
    try {
      await server.listen();
      await clickAddObject(driver);
      await renameComponentFromTo(driver, 'NewObject', 'From after API server');
      await waitForElement(driver, 'Saved');
      await waitForPermalink();

      // TODO: Starting offline, crating a diagram, allocate new id: expected
      // that the initial version of the diagram is the diagram the user built up
      // i.e. post for create should support initial state
    } finally {
      await server.close();
    }
  });
});

setupNoBrowserLogOutputTest(driver);
