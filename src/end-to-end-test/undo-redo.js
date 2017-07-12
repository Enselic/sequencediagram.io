
test('undo redo non-trivial diagram', () => {
    goTo('empty');

    clickAddObject();
    assertFragment('o1,NewObject');

    clickAndType('NewObject', 'Undoer');
    assertFragment('o1,Undoer');

    clickAddObject();
    assertFragment('o1,Undoer;o2,NewObject');

    clickAndType('NewObject', 'Redoer');
    assertFragment('o1,Undoer;o2,Redoer');

    // TODO: Add new messages too

    click('Undo');
    assertFragment('o1,Undoer;o2,NewObject');

    click('Undo');
    assertFragment('o1,Undoer');

    ctrlZ();
    assertFragment('o1,NewObject');

    ctrlZ();
    return assertFragment('');
})
