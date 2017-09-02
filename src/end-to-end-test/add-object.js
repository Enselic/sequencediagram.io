test("add object to empty diagram", async () => {
  await goTo("empty");
  await clickAddObject();
  return assertFragment("o1,NewObject");
});

test("add object to non-empty diagram", async () => {
  await goTo("o1,Foo");
  await clickAddObject();
  return assertFragment("o1,Foo;o2,NewObject");
});

test("add object uses lowest available id", async () => {
  await goTo("o10,10;o100,100;o1000,1000");
  await clickAddObject();
  return assertFragment("o10,10;o100,100;o1000,1000;o1001,NewObject");
});

test("add object to non-empty diagram with message", async () => {
  await goTo("o1,Foo;o10,Bar;m10,o10,o1,Heeeeej");
  await clickAddObject();
  return assertFragment("o1,Foo;o10,Bar;o11,NewObject;m10,o10,o1,Heeeeej");
});
