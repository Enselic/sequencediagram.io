import {
  assertFragment,
  buildDriverAndSetupEnv,
  clickAddObject,
  goTo,
  setupNoBrowserLogOutputTest,
} from './lib';

const driver = buildDriverAndSetupEnv();

it('add object to empty diagram', async () => {
  await goTo(driver, 'empty');
  await clickAddObject(driver);
  return assertFragment(driver, 'o1,NewObject');
});

it('add object to non-empty diagram', async () => {
  await goTo(driver, 'o1,Foo');
  await clickAddObject(driver);
  return assertFragment(driver, 'o1,Foo;o2,NewObject');
});

it('add object uses lowest available id', async () => {
  await goTo(driver, 'o10,10;o100,100;o1000,1000');
  await clickAddObject(driver);
  return assertFragment(driver, 'o10,10;o100,100;o1000,1000;o1001,NewObject');
});

it('add object to non-empty diagram with message', async () => {
  await goTo(driver, 'o1,Foo;o10,Bar;m10,o10,o1,Heeeeej');
  await clickAddObject(driver);
  return assertFragment(
    driver,
    'o1,Foo;o10,Bar;o11,NewObject;m10,o10,o1,Heeeeej'
  );
});
