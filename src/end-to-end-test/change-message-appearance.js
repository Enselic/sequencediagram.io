test('make sure reply messages are not lost during parsing', () => {
    const fragment = goTo('o1,Foo;o2,Replier;m1,o1,o2,saySomething();m2,o2,o1,%5Breply%5D,r');
    return assertFragment(fragment);
})

// TODO: Add more tests, such as toggling message type, parsing edge cases etc
