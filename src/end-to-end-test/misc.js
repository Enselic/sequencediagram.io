test("change to state without messages after state with messages", async () => {
  await goTo("o1,Foo;o2,Bar;m1,o1,o2,baz()");
  await goTo("o100,Hello");
  // The code might crash if it doesnt transition atomically to the new
  // app state. For example, if there is an intermediate state where the new
  // object o100 lives along the old message m1, m1 will reference objects
  // not present any longer, which can cause an app crash if not handled
  // carefully
  return assertFragment("o100,Hello");
});

test('hints shown when clicking "Share"', async () => {
  await goTo("empty");
  await click("Add object"); // To make Share button appear
  await click("Share");
  await waitForElement("Share by PNG");
  return waitForElement("Share by URL");
});

test(
  'hints hide when clicking "Hide share info"',
  async () => {
    await goTo("empty");
    await click("Add object"); // To make Share button appear
    await click("Share");
    await click("Hide share info");
    return reversePromise(
      Promise.all([
        waitForElement("Share by PNG"),
        waitForElement("Share by URL"),
      ])
    );
  },
  applyTimeoutFactor(20 * 1000)
);

const tipText = 'Click "Add object" to start';

test("tip shown for default diagram", async () => {
  await goTo("none");
  await sleepIfHumanObserver(2);
  return waitForElement(tipText);
});

test("tip not shown for non-default diagram (one extra object)", async () => {
  await goTo("o1,Foo;o3,NewObject;o4,NewObject;m1,o1,o3,newMessage()");
  await sleepIfHumanObserver(2);
  return reversePromise(waitForElement(tipText));
});

test("tip not shown for non-default diagram (one extra message)", async () => {
  await goTo("o1,Foo;o2,Bar;m1,o1,o2,message();m2,o1,o2,newMessage()");
  await sleepIfHumanObserver(2);
  return reversePromise(waitForElement(tipText));
});

test("MANUAL: Inspect layout and message appearances", async () => {
  const url =
    "o4,Recieve;o1,Sender%20;o2,Recieve;o3,Self%20sender;o7,Foo;o8,Bar;o5,Loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong;m17,o7,o8,message%20with%20big%20height.%20message%20with%20big%20height.%20message%20with%20big%20height.%20message%20with%20big%20height.%20message%20with%20big%20height.%20message%20with%20big%20height.%20message%20with%20big%20height.%20;m15,o5,o3,oomph%20oomph%20oomph%20oomph%20oomph%20oomph%20oomph;m1,o1,o4,sync%20left;m9,o1,o4,async%20left%20async%20left%20async%20left%20async%20left,a;m2,o1,o4,sync%20reply%20left.%20sync%20reply%20left.%20sync%20reply%20left.%20sync%20reply%20left.%20sync%20reply%20left.%20sync%20reply%20left.%20sync%20reply%20left.%20sync%20reply%20left.%20sync%20reply%20left.%20sync%20reply%20left.%20sync%20reply%20left.%20sync%20reply%20left.%20,ra;m7,o1,o4,async%20reply%20left,ra;m5,o1,o2,sync;m6,o1,o2,async%20async%20async%20async%20async%20async,a;m10,o1,o2,sync%20reply.%20sync%20reply.%20sync%20reply.%20sync%20reply.%20sync%20reply.%20sync%20reply.%20sync%20reply.%20sync%20reply.%20sync%20reply.%20sync%20reply.%20sync%20reply.%20sync%20reply.%20sync%20reply.%20,r;m8,o1,o2,async%20reply,ra;m11,o3,o3,sync;m12,o3,o3,async%20async,a;m13,o3,o3,sync%20reply%20sync%20reply%20sync%20reply%20sync%20reply%20,r;m14,o3,o3,async%20reply%20async%20reply%20async%20reply%20async%20reply%20async%20reply%20async%20reply%20async,ra;m16,o3,o5,newMessage()";
  await goTo(url);
  await sleepIfHumanObserver(15);
  return assertFragment(url);
});

test("Warn that touch input is not supported yet, and dismiss it", async () => {
  // Pretend we got a "pure" link to the site i.e. without any URL fragment
  await goTo("");
  await assertFragment("o1,Foo;o2,Bar;m1,o1,o2,message()");
  await driver
    .touchActions()
    .tap(await findElementByText("Foo"))
    .perform();
  const touchHintText = "Touch input is not supported yet";
  await waitForElement(touchHintText);
  await driver
    .actions()
    .sendKeys(Key.ESCAPE)
    .perform();
  return reversePromise(waitForElement(touchHintText));
});

test("MANUAL: Drag and drop Object remove button shall not select any text", async () => {
  await goTo(
    "o1,MANUAL%3A%20Drag%20and%20drop%20the%20remove%20button%20of%20this%20object%20(but%20don't%20trigger%20a%20click).%20No%20text%20shall%20be%20selected."
  );
  return sleepIfHumanObserver(7);
});

test("ensure devMode == false", () => {
  // We don't want to deploy in dev mode...
  expect(devMode).toBeFalsy();
});

test("MANUAL: Controls are removed when a message is pending", async () => {
  await goTo(
    "o1,Foo;o2,Bar;m1,o1,o2,MANUAL%20TEST%3A%201.%20Click%20any%20lifeline%20to%20create%20a%20pending%20message.%20Expected%3A%20The%20controls%20for%20this%20message%20shall%20not%20be%20displayed%20when%20hovered%20because%20it%20makes%20the%20UI%20nosiy%20and%20distracting."
  );
  return sleepIfHumanObserver(7);
});

/* why does not this work?
test.only('Clicking Acknowledgements brings us to Acknowledgements', async () => {
    goTo('');
    await click('Acknowledgements');
    await sleep(3);
    const title = await driver.getTitle();
    expect(title).toEqual("Acknowledgements for https://sequencediagram.io");
});
*/

test("MANUAL: Diagram text not visibly selectable", async () => {
  await goTo(
    "o1,Make%20sure%20this%20text%20is%20not%20selected%20after%20Ctrl%2BA;o2,.;m1,o1,o2,Nor%20this%20text%2C%20or%20any%20controls"
  );
  await driver
    .actions()
    .sendKeys([Key.CONTROL, "a", Key.NULL])
    .perform();
  return sleepIfHumanObserver(7);
});

test("MANUAL: can't remove object while pending message", async () => {
  await goTo("o2,Bar;o3,Baz;o4,Foo");
  await clickLifelineForObjectWithText("Bar");
  // TODO: instructions
  return sleepIfHumanObserver(7);
});

test("MANUAL: remove button does not hang around", async () => {
  await goTo("empty");

  await clickAddObject();
  await assertFragment("o1,NewObject");

  await clickAndType("NewObject", "Remove button should disappear");
  await assertFragment("o1,Remove%20button%20should%20disappear");

  await clickAddObject();
  await assertFragment("o1,Remove%20button%20should%20disappear;o2,NewObject");

  await clickAndType("NewObject", "... when it is shown above");
  await assertFragment(
    "o1,Remove%20button%20should%20disappear;o2,...%20when%20it%20is%20shown%20above"
  );
});
