test("remove single object", async () => {
  await goTo("o1,Remove%20me");
  await removeComponentWithKey("o1");
  return assertFragment("");
});

test("remove two objects of two", async () => {
  await goTo("o1,Remove%20me;o2,Remove%20me%20too");
  await removeComponentWithKey("o1");
  await waitForCssTransitions();
  await removeComponentWithKey("o2");
  return assertFragment("");
});

test("remove middle object also removes messages attached to it", async () => {
  await goTo("o1,A1;o2,A2;o3,A3;m1,o1,o2,M1;m2,o3,o2,M2;m3,o3,o1,M3");
  await removeComponentWithKey("o2");
  return assertFragment("o1,A1;o3,A3;m3,o3,o1,M3");
});

test("remove object does not trigger name change", async () => {
  // Since the remove object button is within the name div, clicking the
  // remove button might trigger a name change state change unless the code
  // is careful
  await goTo("o100,SameNameUsedTwiceForIdenticalSizes");
  await removeComponentWithKey("o100");
  await goTo("o100,SameNameUsedTwiceForIdenticalSizes");

  // If o100 text is selected (which it should not), typing text and pressing enter will change the text
  await typeAndConfirmm("This-text-should-not-end-up-anywhere");

  return assertFragment("o100,SameNameUsedTwiceForIdenticalSizes");
});
