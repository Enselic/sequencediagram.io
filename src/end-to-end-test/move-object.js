function moveObject(startState, grabbedText, xToMove, expectedEndState) {
  return move(startState, grabbedText, { x: xToMove, y: 0 }, expectedEndState);
}

// One object

test(
  "EDGE CASE: move single object left",
  moveObject("o1234,SingleObject", "SingleObject", -100, "o1234,SingleObject")
);

test(
  "EDGE CASE: move single object right",
  moveObject("o1234,SingleObject", "SingleObject", 100, "o1234,SingleObject")
);

// Two objects:

test(
  "move first object of two objects",
  moveObject("o1,First;o2,Second", "First", 500, "o2,Second;o1,First")
);

test(
  "move second object of two objects",
  moveObject("o100,Foo;o200,Bar", "Bar", -500, "o200,Bar;o100,Foo")
);

test(
  "EDGE CASE: move first object left of two objects",
  moveObject("o1,First;o2,Second", "First", -500, "o1,First;o2,Second")
);

test(
  "EDGE CASE: move second object right of two objects",
  moveObject("o1,First;o2,Second", "Second", 500, "o1,First;o2,Second")
);

// Three objects, moving first

test(
  "make first object of three second",
  moveObject(
    "o11,Emma;o22,Alvin;o33,Saga",
    "Emma",
    260,
    "o22,Alvin;o11,Emma;o33,Saga"
  )
);

test(
  "make first object of three last",
  moveObject(
    "o11,Emma;o22,Alvin;o33,Saga",
    "Emma",
    1000,
    "o22,Alvin;o33,Saga;o11,Emma"
  )
);

// Three objects, moving second

test(
  "make second object of three first",
  moveObject(
    "o2,Banana;o4,Apple;o7,Orange",
    "Apple",
    -500,
    "o4,Apple;o2,Banana;o7,Orange"
  )
);

test(
  "make second object of three last",
  moveObject(
    "o2,Banana;o4,Apple;o7,Orange",
    "Apple",
    300,
    "o2,Banana;o7,Orange;o4,Apple"
  )
);

// Three objects, moving third

test(
  "make third object of three first",
  moveObject(
    "o9,CCC;o8,BBB;o7,Martin",
    "Martin",
    -500,
    "o7,Martin;o9,CCC;o8,BBB"
  )
);

test(
  "make third object of three second",
  moveObject(
    "o9,CCC;o8,BBB;o7,Martin",
    "Martin",
    -260,
    "o9,CCC;o7,Martin;o8,BBB"
  )
);

test(
  "MANUAL (VISUAL): move object with messages attached look good",
  moveObject(
    "o1,o1;o2,o2;o3,o3;o4,o4;m1,o1,o2,m1;m2,o3,o2,m2;m3,o2,o4,m3,a;m4,o4,o2,m4,r",
    "o2",
    700,
    "o1,o1;o3,o3;o4,o4;o2,o2;m1,o1,o2,m1;m2,o3,o2,m2;m3,o2,o4,m3,a;m4,o4,o2,m4,r"
  )
);

test("move away and back does not trigger click", () => {
  const text = "FixedName";
  const expected = goTo("o1," + text);
  driver.actions().mouseDown(findElementByText(text)).perform();
  mouseMoveInSteps({ x: 100, y: 0 });
  mouseMoveInSteps({ x: -100, y: 0 });
  driver.actions().mouseUp().perform();
  typeAndConfirmm("This-text-shall-not-end-up-as-name-for-object");
  return assertFragment(expected);
});

test("move does not suppress blur event (i.e. text commit) when renaming", () => {
  goTo("o1,Foo;o2,Bar");
  click("Foo");
  type("CHEEERS");
  click("Bar");
  return assertFragment("o1,CHEEERS;o2,Bar");
});

test("can click in renamed component text to place cursor", () => {
  goTo("o1,PrefixMe");
  return findElementByText("PrefixMe").then(el => {
    // To hit upper left coner, to place cursor first
    const topLeft = { x: 1, y: 1 };
    driver.actions().mouseMove(el, topLeft).mouseDown().mouseUp().perform();
    sleepIfHumanObserver(1);
    driver.actions().mouseDown().mouseUp().perform();
    sleepIfHumanObserver(1);
    typeAndConfirmm("prefix");
    return assertFragment("o1,prefixPrefixMe");
  });
});

test("pending object move changes is stable", async () => {
  goTo("o1,EndsUpRight;o2,EndsUpLeft");
  const el = await findElementByText("EndsUpRight");
  const endsUpRightPos = await getTextCenterPos("EndsUpRight");
  const endsUpLeftPos = await getTextCenterPos("EndsUpLeft");
  const slightlyRightOfEndsUpLeft = {
    x: endsUpLeftPos.x - endsUpRightPos.x + 30,
    y: 0,
  };
  const inBetweenReversed = { x: -slightlyRightOfEndsUpLeft.x / 2, y: 0 };

  await driver.actions().mouseMove(el).mouseDown().perform();

  // This should result in the expected state we assert on
  await mouseMoveInSteps(slightlyRightOfEndsUpLeft);

  // This should not change the layout back
  await mouseMoveInSteps(inBetweenReversed);

  await driver.actions().mouseUp().perform();
  return assertFragment("o2,EndsUpLeft;o1,EndsUpRight");
});
