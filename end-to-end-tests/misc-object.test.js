import {
  assertFragment,
  buildDriverAndSetupEnv,
  clickAndType,
  goTo,
  setupNoBrowserLogOutputTest,
} from './lib';

const driver = buildDriverAndSetupEnv();

fit('change object name', async () => {
  await goTo(driver, 'o1,ChangeMyName');
  await clickAndType(driver, 'ChangeMyName', 'NewText');
  return assertFragment(driver, 'o1,NewText');
});

setupNoBrowserLogOutputTest(driver);
