import {
  assertFragment,
  buildDriverAndSetupEnv,
  clickAndType,
  goTo,
} from './lib';

const driver = buildDriverAndSetupEnv();

it('change object name', async () => {
  await goTo(driver, 'o1,ChangeMyName');
  await clickAndType(driver, 'ChangeMyName', 'NewText');
  return assertFragment(driver, 'o1,NewText');
});
