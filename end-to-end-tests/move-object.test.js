import {
  assertFragment,
  buildDriverAndSetupEnv,
  clickText,
  findElementByText,
  getTextCenterPos,
  goTo,
  mouseMoveInSteps,
  move,
  setupNoBrowserLogOutputTest,
  sleepIfHumanObserver,
  typeText,
  typeTextAndPressReturn,
} from "./lib";

const driver = buildDriverAndSetupEnv();

function moveObject(startState, grabbedText, xToMove, expectedEndState) {
  return move(
    driver,
    startState,
    grabbedText,
    { x: xToMove, y: 0 },
    expectedEndState
  );
}

// One object

it(
  "EDGE CASE: move single object left",
  moveObject("o1234,SingleObject", "SingleObject", -100, "o1234,SingleObject")
);

it(
  "EDGE CASE: move single object right",
  moveObject("o1234,SingleObject", "SingleObject", 100, "o1234,SingleObject")
);

// Two objects:

it(
  "move first object of two objects",
  moveObject("o1,First;o2,Second", "First", 500, "o2,Second;o1,First")
);

it(
  "move second object of two objects",
  moveObject("o100,Foo;o200,Bar", "Bar", -500, "o200,Bar;o100,Foo")
);

it(
  "EDGE CASE: move first object left of two objects",
  moveObject("o1,First;o2,Second", "First", -500, "o1,First;o2,Second")
);

it(
  "EDGE CASE: move second object right of two objects",
  moveObject("o1,First;o2,Second", "Second", 500, "o1,First;o2,Second")
);

// Three objects, moving first

it(
  "make first object of three second",
  moveObject(
    "o11,Emma;o22,Alvin;o33,Saga",
    "Emma",
    300,
    "o22,Alvin;o11,Emma;o33,Saga"
  )
);

it(
  "make first object of three last",
  moveObject(
    "o11,Emma;o22,Alvin;o33,Saga",
    "Emma",
    1000,
    "o22,Alvin;o33,Saga;o11,Emma"
  )
);

// Three objects, moving second

it(
  "make second object of three first",
  moveObject(
    "o2,Banana;o4,Apple;o7,Orange",
    "Apple",
    -500,
    "o4,Apple;o2,Banana;o7,Orange"
  )
);

it(
  "make second object of three last",
  moveObject(
    "o2,Banana;o4,Apple;o7,Orange",
    "Apple",
    300,
    "o2,Banana;o7,Orange;o4,Apple"
  )
);

// Three objects, moving third

it(
  "make third object of three first",
  moveObject(
    "o9,CCC;o8,BBB;o7,Martin",
    "Martin",
    -700,
    "o7,Martin;o9,CCC;o8,BBB"
  )
);

it(
  "make third object of three second",
  moveObject(
    "o9,CCC;o8,BBB;o7,Martin",
    "Martin",
    -300,
    "o9,CCC;o7,Martin;o8,BBB"
  )
);

it(
  "MANUAL: move object with messages attached look good",
  moveObject(
    "o1,o1;o2,o2;o3,o3;o4,o4;m1,o1,o2,m1;m2,o3,o2,m2;m3,o2,o4,m3,a;m4,o4,o2,m4,r",
    "o2",
    700,
    "o1,o1;o3,o3;o4,o4;o2,o2;m1,o1,o2,m1;m2,o3,o2,m2;m3,o2,o4,m3,a;m4,o4,o2,m4,r"
  )
);

it("move away and back does not trigger click", async () => {
  const text = "FixedName";
  const expected = "o1," + text;
  await goTo(driver, expected);
  await driver
    .actions()
    .mouseDown(await findElementByText(driver, text))
    .perform();
  await mouseMoveInSteps(driver, { x: 100, y: 0 });
  await mouseMoveInSteps(driver, { x: -100, y: 0 });
  await driver.actions().mouseUp().perform();
  await typeTextAndPressReturn(
    driver,
    "This-text-shall-not-end-up-as-name-for-object"
  );
  return assertFragment(driver, expected);
});

it("move does not suppress blur event (i.e. text commit) when renaming", async () => {
  await goTo(driver, "o1,Foo;o2,Bar");
  await clickText(driver, "Foo");
  await typeText(driver, "CHEEERS");
  await clickText(driver, "Bar");
  return assertFragment(driver, "o1,CHEEERS;o2,Bar");
});

it("can click in renamed component text to place cursor", async () => {
  await goTo(driver, "o1,PrefixMe");
  const el = await findElementByText(driver, "PrefixMe");
  // To hit upper left coner, to place cursor first
  const topLeft = { x: 1, y: 1 };
  await driver.actions().mouseMove(el, topLeft).mouseDown().mouseUp().perform();
  await sleepIfHumanObserver(driver, 1);
  await driver.actions().mouseDown().mouseUp().perform();
  // To make sure subsequence state changes from backend interactions
  // do not mess up cursor posision, wait a while here
  await driver.sleep(3000);
  await sleepIfHumanObserver(driver, 1);
  await typeTextAndPressReturn(driver, "prefix");
  return assertFragment(driver, "o1,prefixPrefixMe");
});

it("pending object move changes is stable", async () => {
  await goTo(driver, "o1,EndsUpRight;o2,EndsUpLeft");
  const el = await findElementByText(driver, "EndsUpRight");
  const endsUpRightPos = await getTextCenterPos(driver, "EndsUpRight");
  const endsUpLeftPos = await getTextCenterPos(driver, "EndsUpLeft");
  const slightlyRightOfEndsUpLeft = {
    x: endsUpLeftPos.x - endsUpRightPos.x + 30,
    y: 0,
  };
  const inBetweenReversed = { x: -slightlyRightOfEndsUpLeft.x / 2, y: 0 };

  await driver.actions().mouseMove(el).mouseDown().perform();

  // This should result in the expected state we assert on
  await mouseMoveInSteps(driver, slightlyRightOfEndsUpLeft);

  // This should not change the layout back
  await mouseMoveInSteps(driver, inBetweenReversed);

  await driver.actions().mouseUp().perform();
  return assertFragment(driver, "o2,EndsUpLeft;o1,EndsUpRight");
});

it("overlapping div does not interfer", async () => {
  // Because of mapWithSameDomOrder(), the "first" div might
  // not necessarily be below other divs, so it can block events
  // for other divs
  await goTo(driver, "o1,nn;o2,mmmmmmmmmmmmmmmmmmmm");
  await driver.sleep(100);
  await driver
    .actions()
    .mouseMove(await findElementByText(driver, "nn"))
    .mouseDown()
    .perform();
  await driver.sleep(100);
  await driver.actions().mouseMove({ x: 500, y: 0 }).mouseUp().perform();
  await driver.sleep(100);
  await driver
    .actions()
    .mouseMove(await findElementByText(driver, "nn"))
    .mouseDown()
    .perform();
  await driver.sleep(100);
  await driver.actions().mouseMove({ x: -500, y: 0 }).mouseUp().perform();
  await driver.sleep(100);
  return assertFragment(driver, "o1,nn;o2,mmmmmmmmmmmmmmmmmmmm");
});

setupNoBrowserLogOutputTest(driver);
