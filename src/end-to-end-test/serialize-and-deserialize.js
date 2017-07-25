// Parsing edge cases

test('extra semicolons are handled', () => {
    goTo(';o1,Foo;;;;;;;o2,Bar;;m1,o1,o2,baz();;');
    return assertFragment('o1,Foo;o2,Bar;m1,o1,o2,baz()');
})

test('random garbage is handled', () => {
    goTo('sdkfj haiw3h rp9yefIUAFGO/A#Ryq8o37ry eöiHF FHP)F(YWP)¤r8yDF');
    return assertFragment('');
})

test('missing components are handled', () => {
    goTo('o1;o2,;m1;m2,;m3,a;m3,o1;m4,o1,a;m5,o1,o2,;o100,Valid;o3Invalid;o101,Alsovalid;m6,o100,o101,Valid;m10,o101,o100,');
    return assertFragment('o100,Valid;o101,Alsovalid;m6,o100,o101,Valid');
})

test('messages with invalid references are not included in deserialization', () => {
    goTo("'o1,Foo;o2,Bar;m1,o1,o2,Baz'");
    click('Bar');
    typeAndConfirmm('Boom');
    return assertFragment('o2,Boom');
})

// TODO special chars are handled
// TODO: double ids handled, first only is used
// TODO: negative ids are handled i.e. ignored
// TODO: Reject components with too many parts to avoid future problems with compatibility