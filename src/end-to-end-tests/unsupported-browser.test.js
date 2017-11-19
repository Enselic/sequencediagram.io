import {
  buildDriverAndSetupEnv,
  findElementByText,
  getHostAndPort,
} from './lib';

const driver = buildDriverAndSetupEnv('firefox');

it('unsupported browser warning', async () => {
  await driver.get(`${getHostAndPort()}`);
  await findElementByText(driver, 'Your browser is not supported yet');
});

// Skip setupNoBrowserLogOutputTest, firefox does not support it
