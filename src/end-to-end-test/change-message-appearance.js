test('make sure reply messages are not lost during parsing', urlParsing(
    'o1,Foo;o2,Replier;m1,o1,o2,saySomething();m2,o2,o1,%5Breply%5D,r'));

test('make sure async messages are not lost during parsing', urlParsing(
    'o1,Foo;o2,Replier;m1,o1,o2,saySomething();m2,o2,o1,%5Breply%5D,a'));

test('make sure async replies are not lost during parsing', urlParsing(
    'o1,Foo;o2,Replier;m1,o1,o2,saySomething();m2,o2,o1,%5Breply%5D,ra'));

test('make sure extra chars are discarted', urlParsing(
    'o1,Foo;o2,Replier;m1,o1,o2,saySomething();m2,o2,o1,%5Breply%5D,grad',
    'o1,Foo;o2,Replier;m1,o1,o2,saySomething();m2,o2,o1,%5Breply%5D,ra'));

test('make sure extra chars are discarted', urlParsing(
    'o1,Foo;o2,Replier;m1,o1,o2,saySomething();m2,o2,o1,%5Breply%5D,grad',
    'o1,Foo;o2,Replier;m1,o1,o2,saySomething();m2,o2,o1,%5Breply%5D,ra'));

test('MANUAL: Inspect all message appearances', () => {
    const url = goTo('o4,Recieve;o1,Sender;o2,Recieve;o3,Self%20sender;m1,o1,o4,sync%20left;m9,o1,o4,async%20left%20async%20left%20async%20left%20async%20left,a;m2,o1,o4,sync%20reply%20left,ra;m7,o1,o4,async%20reply%20left,ra;m5,o1,o2,sync;m6,o1,o2,async%20async%20async%20async%20async%20async,a;m10,o1,o2,sync%20reply,r;m8,o1,o2,async%20reply,ra;m11,o3,o3,sync;m12,o3,o3,async%20async,a;m13,o3,o3,sync%20reply%20sync%20reply%20sync%20reply%20sync%20reply%20,r;m14,o3,o3,async%20reply%20async%20reply%20async%20reply%20async%20reply%20async%20reply%20async%20reply%20async,ra');
    sleepIfHumanObserver(15);
    return assertFragment(url);
});

// TODO: Add more tests, such as toggling message type, parsing edge cases etc
