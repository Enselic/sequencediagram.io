function moveMessage(startState, grabbedText, yToMove, expectedEndState) {
  return move(startState, grabbedText, { x: 0, y: yToMove }, expectedEndState);
}

// single messsage

test(
  "EDGE CASE: move a single message up",
  moveMessage(
    "o1,Foo;o2,Bar;m1,o1,o2,singleMessage()",
    "singleMessage()",
    -50,
    "o1,Foo;o2,Bar;m1,o1,o2,singleMessage()"
  )
);

test(
  "EDGE CASE: move a single message down",
  moveMessage(
    "o1,Foo;o2,Bar;m1,o1,o2,singleMessage()",
    "singleMessage()",
    50,
    "o1,Foo;o2,Bar;m1,o1,o2,singleMessage()"
  )
);

// two messsages

test(
  "move top message of two to the bottom",
  moveMessage(
    "o1,Foo;o2,Bar;m1,o1,o2,first();m2,o2,o1,second()",
    "first()",
    150,
    "o1,Foo;o2,Bar;m2,o2,o1,second();m1,o1,o2,first()"
  )
);

test(
  "move bottom message of two to the top",
  moveMessage(
    "o1,Foo;o2,Bar;m1,o1,o2,first();m2,o2,o1,second()",
    "second()",
    -150,
    "o1,Foo;o2,Bar;m2,o2,o1,second();m1,o1,o2,first()"
  )
);

test(
  "EDGE CASE: move top message of two to top again",
  moveMessage(
    "o1,Foo;o2,Bar;m1,o1,o2,first();m2,o2,o1,second()",
    "first()",
    -100,
    "o1,Foo;o2,Bar;m1,o1,o2,first();m2,o2,o1,second()"
  )
);

test(
  "EDGE CASE: move bottom message of two to bottom again",
  moveMessage(
    "o1,Foo;o2,Bar;m1,o1,o2,first();m2,o2,o1,second()",
    "second()",
    100,
    "o1,Foo;o2,Bar;m1,o1,o2,first();m2,o2,o1,second()"
  )
);

// three messages, move top
// %3C is <
// %3E is >

test(
  "move top message to middle",
  moveMessage(
    "o1,A1;o2,A2;o3,A3;m1,o1,o2,A1-%3EA2;m2,o3,o2,A2%3C-A3;m3,o3,o1,A1%3C-A3",
    "A1->A2",
    150,
    "o1,A1;o2,A2;o3,A3;m2,o3,o2,A2%3C-A3;m1,o1,o2,A1-%3EA2;m3,o3,o1,A1%3C-A3"
  )
);

test(
  "move top message to bottom",
  moveMessage(
    "o1,A1;o2,A2;o3,A3;m1,o1,o2,A1-%3EA2;m2,o3,o2,A2%3C-A3;m3,o3,o1,A1%3C-A3",
    "A1->A2",
    300,
    "o1,A1;o2,A2;o3,A3;m2,o3,o2,A2%3C-A3;m3,o3,o1,A1%3C-A3;m1,o1,o2,A1-%3EA2"
  )
);

// three messages, move middle
// %3C is <
// %3E is >

test(
  "move middle message to top",
  moveMessage(
    "o1,A1;o2,A2;o3,A3;m1,o1,o2,A1-%3EA2;m2,o3,o2,A2%3C-A3;m3,o3,o1,A1%3C-A3",
    "A2<-A3",
    -150,
    "o1,A1;o2,A2;o3,A3;m2,o3,o2,A2%3C-A3;m1,o1,o2,A1-%3EA2;m3,o3,o1,A1%3C-A3"
  )
);

test(
  "move middle message to bottom",
  moveMessage(
    "o1,A1;o2,A2;o3,A3;m1,o1,o2,A1-%3EA2;m2,o3,o2,A2%3C-A3;m3,o3,o1,A1%3C-A3",
    "A2<-A3",
    150,
    "o1,A1;o2,A2;o3,A3;m1,o1,o2,A1-%3EA2;m3,o3,o1,A1%3C-A3;m2,o3,o2,A2%3C-A3"
  )
);

// three messages, move bottom
// %3C is <
// %3E is >

test(
  "move bottom message to top",
  moveMessage(
    "o1,A1;o2,A2;o3,A3;m1,o1,o2,A1-%3EA2;m2,o3,o2,A2%3C-A3;m3,o3,o1,A1%3C-A3",
    "A1<-A3",
    -300,
    "o1,A1;o2,A2;o3,A3;m3,o3,o1,A1%3C-A3;m1,o1,o2,A1-%3EA2;m2,o3,o2,A2%3C-A3"
  )
);

test(
  "move bottom message to middle",
  moveMessage(
    "o1,A1;o2,A2;o3,A3;m1,o1,o2,A1-%3EA2;m2,o3,o2,A2%3C-A3;m3,o3,o1,A1%3C-A3",
    "A1<-A3",
    -150,
    "o1,A1;o2,A2;o3,A3;m1,o1,o2,A1-%3EA2;m3,o3,o1,A1%3C-A3;m2,o3,o2,A2%3C-A3"
  )
);

// Move anchorpoints

test("move anchorpoints", async () => {
  await goTo(
    "o1,o1;o2,o2;o3,o3;m1,o2,o3,m1%20start%20to%20o1;m2,o1,o3,m2%20start%20to%20o2;m3,o2,o2,m3%20start%20to%20o3;m4,o2,o3,m4%20end%20to%20o1;m5,o1,o3,m5%20end%20to%20o2;m6,o2,o3,m6%20end%20to%20o2"
  );

  // m1 sender to o1
  await moveAnchorPointToActor("m1", "sender", "o1");
  await assertFragment(
    "o1,o1;o2,o2;o3,o3;m1,o1,o3,m1%20start%20to%20o1;m2,o1,o3,m2%20start%20to%20o2;m3,o2,o2,m3%20start%20to%20o3;m4,o2,o3,m4%20end%20to%20o1;m5,o1,o3,m5%20end%20to%20o2;m6,o2,o3,m6%20end%20to%20o2"
  );

  // m2 sender to o2
  await moveAnchorPointToActor("m2", "sender", "o2");
  await assertFragment(
    "o1,o1;o2,o2;o3,o3;m1,o1,o3,m1%20start%20to%20o1;m2,o2,o3,m2%20start%20to%20o2;m3,o2,o2,m3%20start%20to%20o3;m4,o2,o3,m4%20end%20to%20o1;m5,o1,o3,m5%20end%20to%20o2;m6,o2,o3,m6%20end%20to%20o2"
  );

  // m3 sender to o3
  await moveAnchorPointToActor("m3", "sender", "o3");
  await assertFragment(
    "o1,o1;o2,o2;o3,o3;m1,o1,o3,m1%20start%20to%20o1;m2,o2,o3,m2%20start%20to%20o2;m3,o3,o2,m3%20start%20to%20o3;m4,o2,o3,m4%20end%20to%20o1;m5,o1,o3,m5%20end%20to%20o2;m6,o2,o3,m6%20end%20to%20o2"
  );

  // m4 receiver to o1
  await moveAnchorPointToActor("m4", "receiver", "o1");
  await assertFragment(
    "o1,o1;o2,o2;o3,o3;m1,o1,o3,m1%20start%20to%20o1;m2,o2,o3,m2%20start%20to%20o2;m3,o3,o2,m3%20start%20to%20o3;m4,o2,o1,m4%20end%20to%20o1;m5,o1,o3,m5%20end%20to%20o2;m6,o2,o3,m6%20end%20to%20o2"
  );

  // m5 receiver to o2
  await moveAnchorPointToActor("m5", "receiver", "o2");
  await assertFragment(
    "o1,o1;o2,o2;o3,o3;m1,o1,o3,m1%20start%20to%20o1;m2,o2,o3,m2%20start%20to%20o2;m3,o3,o2,m3%20start%20to%20o3;m4,o2,o1,m4%20end%20to%20o1;m5,o1,o2,m5%20end%20to%20o2;m6,o2,o3,m6%20end%20to%20o2"
  );

  // m6 receiver to o2
  await moveAnchorPointToActor("m6", "receiver", "o2");
  return assertFragment(
    "o1,o1;o2,o2;o3,o3;m1,o1,o3,m1%20start%20to%20o1;m2,o2,o3,m2%20start%20to%20o2;m3,o3,o2,m3%20start%20to%20o3;m4,o2,o1,m4%20end%20to%20o1;m5,o1,o2,m5%20end%20to%20o2;m6,o2,o2,m6%20end%20to%20o2"
  );
});
