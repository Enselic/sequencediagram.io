
test('remove single message', () => {
    goTo('o1,A1;o2,A2;m1,o1,o2,m1');
    removeComponentWithKey('m1');
    return assertFragment('o1,A1;o2,A2');
})

test('remove last message of two', () => {
    goTo('o1,A1;o2,A2;m1,o1,o2,m1;m2,o2,o1,m2');
    removeComponentWithKey('m2');
    return assertFragment('o1,A1;o2,A2;m1,o1,o2,m1');
})

test('remove message does not trigger name change', () => {
    // Since the remove message button is within the name div, clicking the
    // remove button might trigger a name change state change unless the code
    // is careful
    goTo('o1,A1;o2,A2;m1,o1,o2,SameNameUsedTwiceForIdenticalSizes');
    removeComponentWithKey('m1');
    goTo('o1,A1;o2,A2;m1,o1,o2,SameNameUsedTwiceForIdenticalSizes');

    // If m1 text is selected (which it should not), typing text and pressing enter will change the text
    typeAndConfirmm('This text should not end up anywhere');

    return assertFragment('o1,A1;o2,A2;m1,o1,o2,SameNameUsedTwiceForIdenticalSizes');
})
