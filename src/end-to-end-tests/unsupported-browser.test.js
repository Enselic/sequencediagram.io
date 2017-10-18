import {
  buildDriverAndSetupEnv,
  findElementByText,
  getPort,
  getSchemeAndHost,
} from './lib';

const driver = buildDriverAndSetupEnv('firefox');

it('unsupported browser warning', async () => {
  await driver.get(`${getSchemeAndHost()}:${getPort()}`);
  await findElementByText(driver, 'Your browser is not supported yet');
});

// Skip setupNoBrowserLogOutputTest, firefox does not support it
