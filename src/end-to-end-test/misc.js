
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

// TODO: http://localhost:3000/#o1,Foo;o3,Baz;m2,o2,o3,bar()   should not crash