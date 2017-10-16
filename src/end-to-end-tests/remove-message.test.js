import {
  assertFragment,
  buildDriverAndSetupEnv,
  goTo,
  removeComponentWithKey,
  sleepIfHumanObserver,
  typeTextAndPressReturn,
} from './lib';

const driver = buildDriverAndSetupEnv();

it('remove single message', async () => {
  await goTo(driver, 'o1,A1;o2,A2;m1,o1,o2,m1');
  await removeComponentWithKey(driver, 'm1');
  return assertFragment(driver, 'o1,A1;o2,A2');
});

it('remove last message of two', async () => {
  await goTo(driver, 'o1,A1;o2,A2;m1,o1,o2,m1;m2,o2,o1,m2');
  await removeComponentWithKey(driver, 'm2');
  return assertFragment(driver, 'o1,A1;o2,A2;m1,o1,o2,m1');
});

it('remove message does not trigger name change', async () => {
  // Since the remove message button is within the name div, clicking the
  // remove button might trigger a name change state change unless the code
  // is careful
  await goTo(driver, 'o1,A1;o2,A2;m1,o1,o2,SameNameUsedTwiceForIdenticalSizes');
  await removeComponentWithKey(driver, 'm1');
  await goTo(driver, 'o1,A1;o2,A2;m1,o1,o2,SameNameUsedTwiceForIdenticalSizes');

  // If m1 text is selected (which it should not), typing text and pressing enter will change the text
  await typeTextAndPressReturn(driver, 'This-text-should-not-end-up-anywhere');

  return assertFragment(
    driver,
    'o1,A1;o2,A2;m1,o1,o2,SameNameUsedTwiceForIdenticalSizes'
  );
});

it('MANUAL: hover is triggered when component moves in under cursor', async () => {
  await goTo(
    driver,
    'o1,Foo;o3,Baz;m2,o1,o3,after this is removed;m3,o1,o3,mouse move should show controls, if not => failed test'
  );
  await removeComponentWithKey(driver, 'm2');
  await driver
    .actions()
    .mouseMove({ x: -2, y: -2 })
    .perform();
  await sleepIfHumanObserver(driver, 1);
  await removeComponentWithKey(driver, 'm3');
  return assertFragment(driver, 'o1,Foo;o3,Baz');
});
