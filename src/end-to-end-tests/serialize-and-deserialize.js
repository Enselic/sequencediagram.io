import {
  waitForCssTransitions,
  sleepIfHumanObserver,
  getTextCenterPos,
  waitForElement,
  findElementByText,
  mouseMoveInSteps,
  dragAndDrop,
  clickText,
  typeTextAndPressReturn,
  typeText,
  clickAndType,
  assertFragment,
  goTo,
  clickLifelineForObjectWithText,
  clickAddObject,
  addMessage,
  moveAnchorPointToActor,
  flip,
  toggleArrowStyle,
  toggleLineStyle,
  removeComponentWithKey,
} from './lib';

// Parsing edge cases

it('extra semicolons are handled', async () => {
  await goTo(driver, ';o1,Foo;;;;;;;o2,Bar;;m1,o1,o2,baz();;');
  return assertFragment(driver, 'o1,Foo;o2,Bar;m1,o1,o2,baz()');
});

it('random garbage is handled', async () => {
  await goTo(
    driver,
    'sdkfj haiw3h rp9yefIUAFGO/A#Ryq8o37ry eöiHF FHP)F(YWP)¤r8yDF'
  );
  return assertFragment(driver, '');
});

it('missing components are handled', async () => {
  await goTo(
    driver,
    'o1;o2,;m1;m2,;m3,a;m3,o1;m4,o1,a;m5,o1,o2,;o100,Valid;o3Invalid;o101,Alsovalid;m6,o100,o101,Valid;m10,o101,o100,'
  );
  return assertFragment(driver, 'o100,Valid;o101,Alsovalid;m6,o100,o101,Valid');
});

it('messages with invalid references are not included in deserialization', async () => {
  await goTo(driver, "'o1,Foo;o2,Bar;m1,o1,o2,Baz'");
  await clickText(driver, 'Bar');
  await typeTextAndPressReturn(driver, 'NoBoom');
  return assertFragment(driver, 'o2,NoBoom');
});

it('invalid message references do not crash', async () => {
  await goTo(driver, 'o1,Foo;o3,Baz;m2,o2,o3,bar()');
  await clickText(driver, 'Foo');
  await typeTextAndPressReturn(driver, 'NoBoom');
  return assertFragment(driver, 'o1,NoBoom;o3,Baz');
});

it('Can have unicode arrow in message and object name', async () => {
  const toAssert =
    'o1,%E2%87%90;o2,Unicode%20arrows%20ftw;m1,o1,o2,%E2%87%90%20plus%20text';
  await goTo(
    driver,
    'o1,%E2%87%90;o2,Unicode%20arrows%20ftw;m1,o1,o2,%E2%87%90%20plus%20text'
  );
  await assertFragment(driver, toAssert);
  await goTo(driver, 'o1,⇐;o2,Unicode%20arrows%20ftw;m1,o1,o2,⇐%20plus%20text');
  return assertFragment(driver, toAssert);
});

/*TODO
it('double object ids', () => {
    goTo(driver, 'o1,First;o1,Duplicate');
});
*/

// TODO: negative ids are handled i.e. ignored
