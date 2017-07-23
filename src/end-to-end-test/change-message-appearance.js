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

// TODO: Add more tests, such as toggling message type, parsing edge cases etc
