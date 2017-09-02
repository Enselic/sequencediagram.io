function addingMessage(start, firstClick, secondClick, expected) {
  return () => {
    goTo(start);
    return addMessage(firstClick, secondClick).then(_ =>
      assertFragment(expected)
    );
  };
}

test(
  "add message between two objects",
  addingMessage("o1,O1;o2,O2", "O1", "O2", "o1,O1;o2,O2;m1,o1,o2,newMessage()")
);

test(
  "add message between two objects reversed",
  addingMessage("o1,O1;o2,O2", "O2", "O1", "o1,O1;o2,O2;m1,o2,o1,newMessage()")
);

test(
  "add message between next first and next last object",
  addingMessage(
    "o1,O1;o2,O2;o3,O3;o4,O4",
    "O2",
    "O3",
    "o1,O1;o2,O2;o3,O3;o4,O4;m1,o2,o3,newMessage()"
  )
);

test(
  "add message between next last and next first object",
  addingMessage(
    "o1,O1;o2,O2;o3,O3;o4,O4",
    "O3",
    "O2",
    "o1,O1;o2,O2;o3,O3;o4,O4;m1,o3,o2,newMessage()"
  )
);

function insertMessage(start, messageText, offsetFunc1, offsetFunc2, expected) {
  return () => {
    goTo(start);
    const message = findElementByText(messageText);
    return message
      .getSize()
      .then(size => {
        sleepIfHumanObserver(1);
        driver
          .actions()
          .mouseMove(message, offsetFunc1(size))
          .perform();
        sleepIfHumanObserver(1);
        driver
          .actions()
          .click()
          .perform();
        sleepIfHumanObserver(1);
        driver
          .actions()
          .mouseMove(message, offsetFunc2(size))
          .perform();
        sleepIfHumanObserver(1);
        return driver
          .actions()
          .click()
          .perform();
      })
      .then(() => {
        return assertFragment(expected);
      });
  };
}

test(
  "add message just below existing single message",
  insertMessage(
    "o1,Foo;o2,Bar;m1,o1,o2,singleMessage()",
    "singleMessage()",
    size => {
      return { x: 0, y: size.height + 30 };
    },
    size => {
      return { x: size.width, y: size.height + 30 };
    },
    "o1,Foo;o2,Bar;m1,o1,o2,singleMessage();m2,o1,o2,newMessage()"
  )
);

test(
  "add message just below existing single message reversed",
  insertMessage(
    "o1,Foo;o2,Bar;m1,o1,o2,singleMessage()",
    "singleMessage()",
    size => {
      return { x: size.width, y: size.height + 30 };
    },
    size => {
      return { x: 0, y: size.height + 30 };
    },
    "o1,Foo;o2,Bar;m1,o1,o2,singleMessage();m2,o2,o1,newMessage()"
  )
);

test(
  "add message just above existing single message",
  insertMessage(
    "o1,Foo;o2,Bar;m1,o1,o2,singleMessage()",
    "singleMessage()",
    size => {
      return { x: 0, y: -30 };
    },
    size => {
      return { x: size.width, y: -30 };
    },
    "o1,Foo;o2,Bar;m2,o1,o2,newMessage();m1,o1,o2,singleMessage()"
  )
);

test(
  "add message just above existing single message reversed",
  insertMessage(
    "o1,Foo;o2,Bar;m1,o1,o2,singleMessage()",
    "singleMessage()",
    size => {
      return { x: size.width, y: -30 };
    },
    size => {
      return { x: 0, y: -30 };
    },
    "o1,Foo;o2,Bar;m2,o2,o1,newMessage();m1,o1,o2,singleMessage()"
  )
);

test(
  "add message between two messages",
  insertMessage(
    "o1,Foo;o2,Bar;m1,o1,o2,M1();m2,o2,o1,M2()",
    "M1()",
    size => {
      return { x: 0, y: size.height + 30 };
    },
    size => {
      return { x: size.width, y: size.height + 30 };
    },
    "o1,Foo;o2,Bar;m1,o1,o2,M1();m3,o1,o2,newMessage();m2,o2,o1,M2()"
  )
);

test(
  "add message between two messages reversed",
  insertMessage(
    "o1,Foo;o2,Bar;m1,o1,o2,M1();m2,o2,o1,M2()",
    "M1()",
    size => {
      return { x: size.width, y: size.height + 30 };
    },
    size => {
      return { x: 0, y: size.height + 30 };
    },
    "o1,Foo;o2,Bar;m1,o1,o2,M1();m3,o2,o1,newMessage();m2,o2,o1,M2()"
  )
);

test("remove object while pending message", async () => {
  goTo("o2,Bar;o3,Baz;o4,Foo");
  clickLifelineForObjectWithText("Bar");

  // First remove an object that is not a starting point for a pending message
  // No special code needs to run
  removeComponentWithKey("o4");
  await assertFragment("o2,Bar;o3,Baz");

  // Now remove the object that has a pending message attached
  // Our code should handle this and dismiss the pending message
  removeComponentWithKey("o2");

  // Do something afterwards so we detect if the app crashed
  clickLifelineForObjectWithText("Baz");
  clickLifelineForObjectWithText("Baz");
  return assertFragment("o3,Baz;m1,o3,o3,newMessage()");
});
