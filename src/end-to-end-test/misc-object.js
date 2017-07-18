test('change object name', () => {
    goTo('o1,ChangeMyName');
    clickAndType('ChangeMyName', 'NewText');
    return assertFragment('o1,NewText');
});


const tipText = "Click to start";

test('tip shown for default diagram', () => {
    goTo('none');
    sleepIfHumanObserver(2);
    return waitForElement(tipText);
});

test('tip not shown for non-default diagram (one extra object)', () => {
    goTo('o1,Foo;o3,NewObject;o4,NewObject;m1,o1,o3,sendMessage()');
    sleepIfHumanObserver(2);
    return reversePromise(waitForElement(tipText));
});

test('tip not shown for non-default diagram (one extra message)', () => {
    goTo('o1,Foo;o2,Bar;m1,o1,o2,Baz;m2,o1,o2,sendMessage()');
    sleepIfHumanObserver(2);
    return reversePromise(waitForElement(tipText));
});
