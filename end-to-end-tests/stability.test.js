import {
  loadScript,
  buildDriverAndSetupEnv,
  goTo,
  waitForPermalink,
  disableAnchors,
} from './lib';

const driver = buildDriverAndSetupEnv();

const runningTimeSeconds = process.env.STABILITY_DURATION_IN_SECONDS || 10;

let newlyCreatedPermalink = null;

async function unleashGremlins(driver) {
  await disableAnchors(driver);
  await loadScript(
    driver,
    'https://cdnjs.cloudflare.com/ajax/libs/gremlins.js/0.1.0/gremlins.min.js',
    'gremlins'
  );
  await driver.executeScript(
    'window.gremlins.createHorde().gremlin(gremlins.species.clicker()).unleash({nb: 10000});'
  );
  await driver.sleep(runningTimeSeconds * 1000);
}

it(
  `gremlins.min.js on default diagram for ${runningTimeSeconds} seconds`,
  async () => {
    await goTo(driver, '');
    newlyCreatedPermalink = await waitForPermalink(driver);
    await unleashGremlins(driver);
  },
  (runningTimeSeconds + 20) * 1000
);

it(
  `gremlins.min.js on fixed revision for ${runningTimeSeconds} seconds`,
  async () => {
    await driver.get(newlyCreatedPermalink + '?revision=1');
    await unleashGremlins(driver);
  },
  (runningTimeSeconds + 20) * 1000
);
