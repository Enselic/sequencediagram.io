
test('change to state without messages after state with messages', () => {
    goTo('o1,Foo;o2,Bar;m1,o1,o2,baz()');
    goTo('o100,Hello');
    // The code might crash if it doesnt transition atomically to the new
    // app state. For example, if there is an intermediate state where the new
    // object o100 lives along the old message m1, m1 will reference objects
    // not present any longer, which can cause an app crash if not handled
    // carefully
    return assertFragment('o100,Hello');
});

test('hints shown when clicking "Share"', () => {
    goTo('empty');
    click('Add object'); // To make Share button appear
    click('Share');
    return Promise.all([
            waitForElement('Share by PNG'),
            waitForElement('Share by URL'),
            ]);
})

test('hints hide when clicking "Hide share info"', () => {
    goTo('empty');
    click('Add object'); // To make Share button appear
    click('Share');
    click('Hide share info');
    return reversePromise(Promise.all([
            waitForElement('Share by PNG'),
            waitForElement('Share by URL'),
            ]));
})

const tipText = 'Click "Add object" to start';

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

// TODO: http://localhost:3000/#o1,Foo;o3,Baz;m2,o2,o3,bar()   should not crash
