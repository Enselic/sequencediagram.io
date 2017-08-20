test("remove single object", () => {
  goTo("o1,Remove%20me");
  removeComponentWithKey("o1");
  return assertFragment("");
});

test("remove two objects of two", () => {
  goTo("o1,Remove%20me;o2,Remove%20me%20too");
  removeComponentWithKey("o1");
  waitForCssTransitions();
  removeComponentWithKey("o2");
  return assertFragment("");
});

test("remove middle object also removes messages attached to it", () => {
  goTo("o1,A1;o2,A2;o3,A3;m1,o1,o2,M1;m2,o3,o2,M2;m3,o3,o1,M3");
  removeComponentWithKey("o2");
  return assertFragment("o1,A1;o3,A3;m3,o3,o1,M3");
});

test("remove object does not trigger name change", () => {
  // Since the remove object button is within the name div, clicking the
  // remove button might trigger a name change state change unless the code
  // is careful
  goTo("o100,SameNameUsedTwiceForIdenticalSizes");
  removeComponentWithKey("o100");
  goTo("o100,SameNameUsedTwiceForIdenticalSizes");

  // If o100 text is selected (which it should not), typing text and pressing enter will change the text
  typeAndConfirmm("This-text-should-not-end-up-anywhere");

  return assertFragment("o100,SameNameUsedTwiceForIdenticalSizes");
});
