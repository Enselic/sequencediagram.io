import { assertFragment, clickAndType, goTo } from './lib';

it('change object name', async () => {
  await goTo(driver, 'o1,ChangeMyName');
  await clickAndType(driver, 'ChangeMyName', 'NewText');
  return assertFragment(driver, 'o1,NewText');
});
