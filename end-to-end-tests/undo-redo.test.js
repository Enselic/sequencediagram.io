import { Key } from 'selenium-webdriver';
import {
  addMessage,
  applyTimeoutFactor,
  assertFragment,
  buildDriverAndSetupEnv,
  clickAddObject,
  clickAndType,
  clickText,
  dragAndDrop,
  findElementByText,
  flip,
  goTo,
  moveAnchorPointToActor,
  setupNoBrowserLogOutputTest,
  sleepIfHumanObserver,
  toggleArrowStyle,
  toggleLineStyle,
  waitForCssTransitions,
  waitForElement,
  typeTextAndPressReturn,
  pressReturn,
} from './lib';

const driver = buildDriverAndSetupEnv();

async function ctrlZ() {
  await driver
    .actions()
    .sendKeys([Key.CONTROL, 'z', Key.NULL])
    .perform();
  await waitForCssTransitions(driver);
  return sleepIfHumanObserver(driver, 0.7);
}

async function ctrlShiftZ() {
  await driver
    .actions()
    .sendKeys([Key.CONTROL, Key.SHIFT, 'z', Key.NULL])
    .perform();
  await waitForCssTransitions(driver);
  return sleepIfHumanObserver(driver, 0.7);
}

async function ctrlZOrUndo(i) {
  if (i % 2 > 0) {
    return ctrlZ();
  } else {
    return clickText(driver, 'Undo');
  }
}
async function ctrlShiftZOrRedo(i) {
  if (i % 2 > 0) {
    return ctrlShiftZ();
  } else {
    return clickText(driver, 'Redo');
  }
}

it(
  'use all features, then undo all, then redo all',
  async () => {
    class UndoRedoAsserter {
      constructor() {
        this.fragments = [];
      }

      async assertFragmentAndPush(expectedFragment) {
        this.fragments.push(expectedFragment);
        return assertFragment(driver, expectedFragment);
      }

      async undoRedoAll() {
        // Deterministically mix Ctrl-[Shift-]Z and Undo/Redo menu items
        const len = this.fragments.length;
        for (let i = len - 1; i >= 0; i--) {
          await assertFragment(driver, this.fragments[i]);
          await ctrlZOrUndo(i);
        }
        for (let i = 0; i < len; i++) {
          await ctrlShiftZOrRedo(i);
          await assertFragment(driver, this.fragments[i]);
        }
      }
    }

    let asserter = new UndoRedoAsserter();

    await goTo(driver, 'empty');

    await clickAddObject(driver);
    await asserter.assertFragmentAndPush('o1,NewObject');

    await typeTextAndPressReturn(driver, 'Undoer');
    await asserter.assertFragmentAndPush('o1,Undoer');

    await clickAddObject(driver);
    await asserter.assertFragmentAndPush('o1,Undoer;o2,NewObject');

    await typeTextAndPressReturn(driver, 'Redoer');
    await asserter.assertFragmentAndPush('o1,Undoer;o2,Redoer');

    await addMessage(driver, 'Undoer', 'Redoer');
    await asserter.assertFragmentAndPush(
      'o1,Undoer;o2,Redoer;m1,o1,o2,newMessage()'
    );

    await typeTextAndPressReturn(driver, 'invoke()');
    await asserter.assertFragmentAndPush(
      'o1,Undoer;o2,Redoer;m1,o1,o2,invoke()'
    );

    await clickAddObject(driver);
    await asserter.assertFragmentAndPush(
      'o1,Undoer;o2,Redoer;o3,NewObject;m1,o1,o2,invoke()'
    );

    await typeTextAndPressReturn(driver, 'User');
    await asserter.assertFragmentAndPush(
      'o1,Undoer;o2,Redoer;o3,User;m1,o1,o2,invoke()'
    );

    await moveAnchorPointToActor(driver, 'm1', 'sender', 'User');
    await asserter.assertFragmentAndPush(
      'o1,Undoer;o2,Redoer;o3,User;m1,o3,o2,invoke()'
    );

    await addMessage(driver, 'Redoer', 'User');
    await asserter.assertFragmentAndPush(
      'o1,Undoer;o2,Redoer;o3,User;m2,o2,o3,newMessage();m1,o3,o2,invoke()'
    );

    await typeTextAndPressReturn(driver, 'newMessage2()');
    await asserter.assertFragmentAndPush(
      'o1,Undoer;o2,Redoer;o3,User;m2,o2,o3,newMessage2();m1,o3,o2,invoke()'
    );

    await flip(driver, 'm2');
    await asserter.assertFragmentAndPush(
      'o1,Undoer;o2,Redoer;o3,User;m2,o3,o2,newMessage2();m1,o3,o2,invoke()'
    );

    await clickAndType(driver, 'newMessage2()', 'call()'); // Use a different term so we can search by text uniquely
    await asserter.assertFragmentAndPush(
      'o1,Undoer;o2,Redoer;o3,User;m2,o3,o2,call();m1,o3,o2,invoke()'
    );

    await toggleArrowStyle(driver, 'm2');
    await asserter.assertFragmentAndPush(
      'o1,Undoer;o2,Redoer;o3,User;m2,o3,o2,call(),a;m1,o3,o2,invoke()'
    );

    await toggleLineStyle(driver, 'm1');
    await asserter.assertFragmentAndPush(
      'o1,Undoer;o2,Redoer;o3,User;m2,o3,o2,call(),a;m1,o3,o2,invoke(),r'
    );

    await dragAndDrop(driver, 'User', { x: -700, y: 0 });
    await asserter.assertFragmentAndPush(
      'o3,User;o1,Undoer;o2,Redoer;m2,o3,o2,call(),a;m1,o3,o2,invoke(),r'
    );

    await dragAndDrop(driver, 'call()', { x: 0, y: 500 });
    await asserter.assertFragmentAndPush(
      'o3,User;o1,Undoer;o2,Redoer;m1,o3,o2,invoke(),r;m2,o3,o2,call(),a'
    );

    return asserter.undoRedoAll();
  },
  applyTimeoutFactor(80 * 1000)
);

it(
  'pending message turns Undo into Cancel',
  async () => {
    const initialState = 'o1,Foo;o2,Bar';
    await goTo(driver, initialState);

    const startEl = await findElementByText(driver, 'Foo');
    const fromObjectNameToLifelineOffset = { x: 30, y: 70 };

    // Start creating a message
    await driver
      .actions()
      .mouseMove(startEl, fromObjectNameToLifelineOffset)
      .click()
      .perform();
    await sleepIfHumanObserver(driver, 0.7);

    // Cancel it
    await clickText(driver, 'Cancel');

    // Now click again. If Cancel does not work, a message will be created
    // What we expect is a pending message state again
    await driver
      .actions()
      .mouseMove(startEl, fromObjectNameToLifelineOffset)
      .click()
      .perform();
    await sleepIfHumanObserver(driver, 0.7);

    return assertFragment(driver, initialState);
  },
  applyTimeoutFactor(80 * 1000)
);

setupNoBrowserLogOutputTest(driver);
