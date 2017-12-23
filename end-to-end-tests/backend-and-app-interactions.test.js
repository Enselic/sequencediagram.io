/**
 * This file contains various tests for how the web app interactions with the
 * backend API server. Since the tests brings up and tears down the API server
 * for testing purposes, all tests that are affected by the API server being
 * up or not must be in this file. In all other files there is no dependency
 * on the API server is up or not.
 */

import {
  clickAddObject,
  buildDriverAndSetupEnv,
  getHostAndPort,
  goTo,
  makeApiServer,
  renameComponentFromTo,
  setupNoBrowserLogOutputTest,
  waitForElement,
  removeComponentWithKey,
} from './lib';
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
  let newlyCreatedPermalink = null;
  // Use random names to reduce risk of us seeing old data
  const randomObjectName1 = 'object1-' + Math.ceil(Math.random() * 1000000000);
  const randomObjectName2 = 'object2-' + Math.ceil(Math.random() * 1000000000);

  beforeAll(async () => {
    // Use a short artificial delay get more extreme latency
    await makeApiServer('listen?extraDelayMs=2000');
  });

  afterAll(async () => {
    await makeApiServer('close');
  });

  it(
    'creating a new diagram works',
    async () => {
      await goTo(driver, '');
      newlyCreatedPermalink = await waitForPermalink();
      await clickAddObject(driver);
      await renameComponentFromTo(driver, 'NewObject', randomObjectName1);
      await driver.sleep(1000);
      await waitForElement(driver, 'Saved');
    },
    20 * 1000
  );

  it(
    'loading an existing diagram works',
    async () => {
      // Go somewhere else to make sure it's not old state we're seeing
      await driver.get(
        'http://static.sequencediagram.io/acknowledgements.html'
      );
      // Then go to the permalink
      await driver.get(newlyCreatedPermalink);
      await waitForElement(driver, randomObjectName1);
      await clickAddObject(driver);
      await renameComponentFromTo(driver, 'NewObject', randomObjectName2);
      await driver.sleep(1000);
      await waitForElement(driver, 'Saved');
    },
    20 * 1000
  );

  it(
    'modifications are remembered',
    async () => {
      // Go somewhere else to make sure it's not old state we're seeing
      await driver.get(
        'http://static.sequencediagram.io/acknowledgements.html'
      );
      // Then go to the permalink
      await driver.get(newlyCreatedPermalink);
      await waitForElement(driver, randomObjectName2);
    },
    20 * 1000
  );

  it(
    'gracefully handles non-existing diagram',
    async () => {
      const initialUrl = `${getHostAndPort()}/2345678abC`;
      await driver.get(initialUrl);
      await waitForElement(driver, 'Error: Could not load diagram');
      expect(await driver.getCurrentUrl()).toEqual(initialUrl);
      // TODO: prevent creating of diagram components
    },
    20 * 1000
  );

  it(
    'MANUAL: save before id allocated (no "Saved" flicker)',
    async () => {
      await goTo(driver, '');
      // Before an ID has been allocated, make a change ...
      await clickAddObject(driver);
      // ... that should not have crashed the app
      await waitForPermalink();
      await driver.sleep(1000);
      await waitForElement(driver, 'Saved');
    },
    20 * 1000
  );
});

describe('when the API server is down the web app', async () => {
  it(
    'informs about the network error when creating a new diagram',
    async () => {
      await goTo(driver, '');
      await waitForElement(driver, 'Could not connect');
    },
    20 * 1000
  );

  it(
    'gracefully handles creating a new diagram',
    async () => {
      await goTo(driver, '');
      await waitForElement(driver, 'Could not connect');
      // Should still be possible to modify the diagram
      await clickAddObject(driver);
      await waitForElement(driver, 'NewObject');
    },
    20 * 1000
  );

  it(
    'gracefully handles non-existing diagram',
    async () => {
      const initialUrl = `${getHostAndPort()}/2345678abC`;
      await driver.get(initialUrl);
      await waitForElement(driver, 'Error: Could not connect');
      expect(await driver.getCurrentUrl()).toEqual(initialUrl);
    },
    20 * 1000
  );
});

describe('when the API server goes down, then comes back up', async () => {
  it(
    'new -> permalink -> Could not connect -> Saved',
    async () => {
      // API server is operating as normal
      await makeApiServer('listen');
      try {
        await goTo(driver, '');

        // We got a permalink id
        const permalink = await waitForPermalink();

        // Now the server goes down
        await makeApiServer('close');

        // After modifying the diagram, the web app should discover the problem
        await clickAddObject(driver);
        await waitForElement(driver, 'Could not connect');

        // Now the server comes back up
        await makeApiServer('listen');
        await driver.sleep(1000);
        await clickAddObject(driver);
        await waitForElement(driver, 'Saved');
        expect(await driver.getCurrentUrl()).toEqual(permalink);
      } finally {
        // Cleanup
        await makeApiServer('close');
      }
    },
    20 * 1000
  );
});

describe('when the API server is down but comes up later it', async () => {
  it(
    'works to get a permalink allocated later',
    async () => {
      await goTo(driver, '');
      await waitForElement(driver, 'Could not connect');
      await removeComponentWithKey(driver, 'o1');
      await renameComponentFromTo(driver, 'Bar', 'From before API server');

      try {
        await makeApiServer('listen');
        await clickAddObject(driver);
        await renameComponentFromTo(
          driver,
          'NewObject',
          'From after API server'
        );
        await waitForElement(driver, 'Saved');
        await waitForPermalink();

        // TODO: Starting offline, crating a diagram, allocate new id: expected
        // that the initial version of the diagram is the diagram the user built up
        // i.e. post for create should support initial state
      } finally {
        await makeApiServer('close');
      }
    },
    20 * 1000
  );
});

setupNoBrowserLogOutputTest(driver);

/* Backend unit tests follows. It is tempting to put them in a separate file,
 * but since the tests use a shared resource (network ports for the API server
 * and DynamoDb) we keep them in the same file.
 */

const fetch = require('node-fetch');

async function doFetch(path, method, sequenceDiagram) {
  const response = await fetch('http://localhost:7000' + path, {
    method,
    body: JSON.stringify(sequenceDiagram),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  const body = await response.json();
  const { status } = response;
  return { status, body };
}

// Assigned the id from backend via a test
let idToTest;

const sequenceDiagramInitialRevision = {
  objects: [],
  messages: [],
};

const sequenceDiagramRevision2 = {
  objects: [{ id: 'o1', name: 'This works' }],
  messages: [],
};

function expectSuccessfulPostOrGet(status, body, sequenceDiagram) {
  expect(status).toEqual(200);
  expect(body.creationTimeUtc).toBeGreaterThan(1500000000);
  expect(body.id).toMatch(/^[0-9a-zA-Z]{4,20}$/);
  expect(body.sequenceDiagram.objects).toEqual(sequenceDiagram.objects);
  expect(body.sequenceDiagram.messages).toEqual(sequenceDiagram.messages);
}

function expectError(status, body, expectedMessagePart, expectedCode) {
  expect(status).toBeGreaterThanOrEqual(400);
  expect(status).toBeLessThan(500);
  expect(body.error.code).toEqual(expectedCode);
  expect(body.error.message).toMatch(expectedMessagePart);
}

function isError(status, body, expectedMessagePart, expectedCode) {
  return (
    status >= 400 &&
    status < 500 &&
    body.error.code === expectedCode &&
    body.error.message.match(expectedMessagePart)
  );
}

describe('backend unit tests', async () => {
  beforeAll(async () => {
    await makeApiServer('listen');
  });

  afterAll(async () => {
    await makeApiServer('close');
  });

  it('POST /sequencediagrams', async () => {
    const { status, body } = await doFetch(
      '/sequencediagrams',
      'POST',
      sequenceDiagramInitialRevision
    );
    expectSuccessfulPostOrGet(status, body, sequenceDiagramInitialRevision);
    expect(body.revision).toEqual(1);

    idToTest = body.id;
  });

  // We don't support getting a list of all diagrams everyone
  // has ever created...
  it('GET /sequencediagrams', async () => {
    const { status, body } = await doFetch('/sequencediagrams', 'GET');
    expect(status).toBeGreaterThanOrEqual(400);
    expect(status).toBeLessThan(500);
  });

  it('POST /sequencediagrams/{id}', async () => {
    const { status, body } = await doFetch(
      '/sequencediagrams/' + idToTest,
      'POST',
      sequenceDiagramRevision2
    );
    expectSuccessfulPostOrGet(status, body, sequenceDiagramRevision2);
    expect(body.revision).toEqual(2);
  });

  it('GET /sequencediagrams/{id} latest revision', async () => {
    const { status, body } = await doFetch(
      '/sequencediagrams/' + idToTest,
      'GET'
    );
    expectSuccessfulPostOrGet(status, body, sequenceDiagramRevision2);
  });

  it('GET /sequencediagrams/{id}/{revision}', async () => {
    const { status, body } = await doFetch(
      '/sequencediagrams/' + idToTest + '/1',
      'GET'
    );
    expectSuccessfulPostOrGet(status, body, sequenceDiagramInitialRevision);
  });

  it('POST invalid bodies', async () => {
    const twoValidObjects = {
      objects: [{ id: 'o1', name: 'Foo' }, { id: 'o2', name: 'Bar' }],
    };
    const invalidValues = [
      {},
      { objects: [] },
      { messages: [] },
      [],
      { objects: [], messages: [], extra: [] },
      { objects: [{ id: 'x1', name: 'Invalid id' }], messages: [] },
      { objects: 42, messages: [] },
      { objects: [{ id: 42, name: 'Invalid id' }], messages: [] },
      { objects: [{ id: 'o1' }], messages: [] },
      { objects: [{ name: 'missing id' }], messages: [] },
      { objects: [{ id: 'o1', name: 42 }], messages: [] },
      {
        objects: [{ id: 'o1', name: 'extra prop', extra: 'foo' }],
        messages: [],
      },
      {
        ...twoValidObjects,
        messages: [
          { id: 'y1', sender: 'o1', receiver: 'o2', name: 'invalidId()' },
        ],
      },
      {
        ...twoValidObjects,
        messages: [
          { id: 42, sender: 'o1', receiver: 'o2', name: 'invalidId()' },
        ],
      },
      {
        ...twoValidObjects,
        messages: [{ id: 'm1', sender: 'o1', receiver: 'o2' }],
      },
      {
        ...twoValidObjects,
        messages: [{ id: 'm1', receiver: 'o2', name: 'Missing sender' }],
      },
      {
        ...twoValidObjects,
        messages: [{ id: 'm1', sender: 'o1', name: 'Missing receiver' }],
      },
      {
        ...twoValidObjects,
        messages: [{ sender: 'o1', receiver: 'o2', name: 'Missing id' }],
      },
      {
        ...twoValidObjects,
        messages: [
          { id: 'm1', sender: 'z1', receiver: 'o2', name: 'invalidSenderId()' },
        ],
      },
      {
        ...twoValidObjects,
        messages: [
          { id: 'm1', sender: 42, receiver: 'o2', name: 'invalid sender' },
        ],
      },
      {
        ...twoValidObjects,
        messages: [
          { id: 'm1', sender: 'o1', receiver: 42, name: 'invalid receiver' },
        ],
      },
      {
        ...twoValidObjects,
        messages: [
          {
            id: 'm1',
            sender: 'o1',
            receiver: 'z2',
            name: 'invalidReceiverId()',
          },
        ],
      },
      {
        ...twoValidObjects,
        messages: [
          {
            id: 'm1',
            sender: 'o1',
            receiver: 'z2',
            name: 'invalidReceiverId()',
          },
        ],
      },
      {
        ...twoValidObjects,
        messages: [{ id: 'm1', sender: 'o1', receiver: 'z2', name: 42 }],
      },
      {
        ...twoValidObjects,
        messages: [{ sender: 'o1', receiver: 'o2', name: 'missing id' }],
      },
      {
        ...twoValidObjects,
        messages: [
          {
            id: 'm1',
            sender: 'o1',
            receiver: 'o2',
            name: 'invalid isAsync',
            isAsync: 42,
          },
        ],
      },
      {
        ...twoValidObjects,
        messages: [
          {
            id: 'm1',
            sender: 'o1',
            receiver: 'o2',
            name: 'invalid isReply',
            isReply: 42,
          },
        ],
      },
      {
        ...twoValidObjects,
        messages: [
          {
            id: 'm1',
            sender: 'o1',
            receiver: 'z2',
            name: 'extra prop',
            asdf: false,
          },
        ],
      },
    ];
    let erronouslyValidValues = [];
    // forEach() does not work with async/await :(
    for (let i = 0; i < invalidValues.length; i++) {
      const paths = ['/sequencediagrams', '/sequencediagrams/' + idToTest];
      for (let j = 0; j < paths.length; j++) {
        const invalidValue = invalidValues[i];
        const { status, body } = await doFetch(paths[j], 'POST', invalidValue);
        if (
          !isError(
            status,
            body,
            'schema validation failed',
            'FailedSchemaValidation'
          )
        ) {
          erronouslyValidValues.push(invalidValue);
        }
      }
    }
    expect(erronouslyValidValues).toEqual([]);
  });

  it('POST /sequencediagrams/doesnotexist', async () => {
    const sequenceDiagram = {
      objects: [],
      messages: [],
    };
    const { status, body } = await doFetch(
      '/sequencediagrams/doesnotexist',
      'POST',
      sequenceDiagram
    );
    expectError(status, body, 'empty', 'EmptyQuery');
  });

  it('POST > 50 kB payload', async () => {
    const hugeSequenceDiagram = {
      objects: [],
      messages: [],
    };
    let kBsLeft = 50;
    while (kBsLeft-- > 0) {
      hugeSequenceDiagram.objects.push({
        id: 'o' + kBsLeft,
        name: 'x'.repeat(1000),
      });
    }

    const paths = ['/sequencediagrams', '/sequencediagrams/' + idToTest];
    for (let i = 0; i < paths.length; i++) {
      const { status, body } = await doFetch(
        paths[i],
        'POST',
        hugeSequenceDiagram
      );
      expectError(status, body, '50 kB', 'TooLarge');
    }
  });
});
