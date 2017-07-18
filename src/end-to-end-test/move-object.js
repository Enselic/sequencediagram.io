function moveObject(startState, grabbedText, xToMove, expectedEndState) {
    return move(startState, grabbedText, { x: xToMove, y: 0 }, expectedEndState);
}


// One object

test('EDGE CASE: move single object left', moveObject(
    'o1234,SingleObject',
    'SingleObject', -100,
    'o1234,SingleObject'));

test('EDGE CASE: move single object right', moveObject(
    'o1234,SingleObject',
    'SingleObject', 100,
    'o1234,SingleObject'));


// Two objects:

test('move first object of two objects', moveObject(
    'o1,First;o2,Second',
    'First', 500,
    'o2,Second;o1,First'));

test('move second object of two objects', moveObject(
    'o100,Foo;o200,Bar',
    'Bar', -500,
    'o200,Bar;o100,Foo'));

test('EDGE CASE: move first object left of two objects', moveObject(
    'o1,First;o2,Second',
    'First', -500,
    'o1,First;o2,Second'));

test('EDGE CASE: move second object right of two objects', moveObject(
    'o1,First;o2,Second',
    'Second', 500,
    'o1,First;o2,Second'));


// Three objects, moving first

test('make first object of three second', moveObject(
    'o11,Emma;o22,Alvin;o33,Saga',
    'Emma', 200,
    'o22,Alvin;o11,Emma;o33,Saga'));

test('make first object of three last', moveObject(
    'o11,Emma;o22,Alvin;o33,Saga',
    'Emma', 1000,
    'o22,Alvin;o33,Saga;o11,Emma'));


// Three objects, moving second

test('make second object of three first', moveObject(
    'o2,Banana;o4,Apple;o7,Orange',
    'Apple', -500,
    'o4,Apple;o2,Banana;o7,Orange'));

test('make second object of three last', moveObject(
    'o2,Banana;o4,Apple;o7,Orange',
    'Apple', 200,
    'o2,Banana;o7,Orange;o4,Apple'));


// Three objects, moving third

test('make third object of three first', moveObject(
    'o9,CCC;o8,BBB;o7,Martin',
    'Martin', -500,
    'o7,Martin;o9,CCC;o8,BBB'));

test('make third object of three second', moveObject(
    'o9,CCC;o8,BBB;o7,Martin',
    'Martin', -200,
    'o9,CCC;o7,Martin;o8,BBB'));
