import {
  addMessage,
  assertFragment,
  buildDriver,
  findElementByText,
  goTo,
  setupNoBrowserLogOutputTest,
  sleepIfHumanObserver,
} from './lib';

const driver = buildDriver();

afterAll(() => {
  return driver.quit();
});

function addingMessage(start, firstClick, secondClick, expected) {
  return async () => {
    await goTo(driver, start);
    await addMessage(driver, firstClick, secondClick);
    return assertFragment(driver, expected);
  };
}

it(
  'add message between two objects',
  addingMessage('o1,O1;o2,O2', 'O1', 'O2', 'o1,O1;o2,O2;m1,o1,o2,newMessage()')
);

it(
  'add message between two objects reversed',
  addingMessage('o1,O1;o2,O2', 'O2', 'O1', 'o1,O1;o2,O2;m1,o2,o1,newMessage()')
);

it(
  'add message between next first and next last object',
  addingMessage(
    'o1,O1;o2,O2;o3,O3;o4,O4',
    'O2',
    'O3',
    'o1,O1;o2,O2;o3,O3;o4,O4;m1,o2,o3,newMessage()'
  )
);

it(
  'add message between next last and next first object',
  addingMessage(
    'o1,O1;o2,O2;o3,O3;o4,O4',
    'O3',
    'O2',
    'o1,O1;o2,O2;o3,O3;o4,O4;m1,o3,o2,newMessage()'
  )
);

function insertMessage(start, messageText, offsetFunc1, offsetFunc2, expected) {
  return async () => {
    await goTo(driver, start);
    const message = await findElementByText(driver, messageText);
    const size = await message.getSize();
    await sleepIfHumanObserver(driver, 1);
    await driver
      .actions()
      .mouseMove(message, offsetFunc1(size))
      .perform();
    await sleepIfHumanObserver(driver, 1);
    await driver
      .actions()
      .click()
      .perform();
    await sleepIfHumanObserver(driver, 1);
    await driver
      .actions()
      .mouseMove(message, offsetFunc2(size))
      .perform();
    await sleepIfHumanObserver(driver, 1);
    await driver
      .actions()
      .click()
      .perform();
    return assertFragment(driver, expected);
  };
}
const OFFSET_FROM_MESSAGE_TO_BELOW = 60;

it(
  'add message just below existing single message',
  insertMessage(
    'o1,Foo;o2,Bar;m1,o1,o2,this-is-a-message-reference()',
    'this-is-a-message-reference()',
    size => {
      return { x: 0, y: size.height + OFFSET_FROM_MESSAGE_TO_BELOW };
    },
    size => {
      return { x: size.width, y: size.height + OFFSET_FROM_MESSAGE_TO_BELOW };
    },
    'o1,Foo;o2,Bar;m1,o1,o2,this-is-a-message-reference();m2,o1,o2,newMessage()'
  )
);

it(
  'add message just below existing single message reversed',
  insertMessage(
    'o1,Foo;o2,Bar;m1,o1,o2,this-is-a-message-reference()',
    'this-is-a-message-reference()',
    size => {
      return { x: size.width, y: size.height + OFFSET_FROM_MESSAGE_TO_BELOW };
    },
    size => {
      return { x: 0, y: size.height + OFFSET_FROM_MESSAGE_TO_BELOW };
    },
    'o1,Foo;o2,Bar;m1,o1,o2,this-is-a-message-reference();m2,o2,o1,newMessage()'
  )
);

it(
  'add message just above existing single message',
  insertMessage(
    'o1,Foo;o2,Bar;m1,o1,o2,this-is-a-message-reference()',
    'this-is-a-message-reference()',
    size => {
      return { x: 0, y: -20 };
    },
    size => {
      return { x: size.width, y: -20 };
    },
    'o1,Foo;o2,Bar;m2,o1,o2,newMessage();m1,o1,o2,this-is-a-message-reference()'
  )
);

it(
  'add message just above existing single message reversed',
  insertMessage(
    'o1,Foo;o2,Bar;m1,o1,o2,this-is-a-message-reference()',
    'this-is-a-message-reference()',
    size => {
      return { x: size.width, y: -20 };
    },
    size => {
      return { x: 0, y: -20 };
    },
    'o1,Foo;o2,Bar;m2,o2,o1,newMessage();m1,o1,o2,this-is-a-message-reference()'
  )
);

it(
  'add message between two messages',
  insertMessage(
    'o1,Foo;o2,Bar;m1,o1,o2,this-is-a-message-reference();m2,o2,o1,M2()',
    'this-is-a-message-reference()',
    size => {
      return { x: 0, y: size.height + OFFSET_FROM_MESSAGE_TO_BELOW };
    },
    size => {
      return { x: size.width, y: size.height + OFFSET_FROM_MESSAGE_TO_BELOW };
    },
    'o1,Foo;o2,Bar;m1,o1,o2,this-is-a-message-reference();m3,o1,o2,newMessage();m2,o2,o1,M2()'
  )
);

it(
  'add message between two messages reversed',
  insertMessage(
    'o1,Foo;o2,Bar;m1,o1,o2,this-is-a-message-reference();m2,o2,o1,M2()',
    'this-is-a-message-reference()',
    size => {
      return { x: size.width, y: size.height + OFFSET_FROM_MESSAGE_TO_BELOW };
    },
    size => {
      return { x: 0, y: size.height + OFFSET_FROM_MESSAGE_TO_BELOW };
    },
    'o1,Foo;o2,Bar;m1,o1,o2,this-is-a-message-reference();m3,o2,o1,newMessage();m2,o2,o1,M2()'
  )
);

setupNoBrowserLogOutputTest(driver);
