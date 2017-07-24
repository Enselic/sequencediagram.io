function ctrlZ() {
    driver.actions().sendKeys([ Key.CONTROL, 'z', Key.NULL ]).perform();
    waitForCssTransitions();
    sleepIfHumanObserver(0.7);
}

function ctrlShiftZ() {
    driver.actions().sendKeys([ Key.CONTROL, Key.SHIFT, 'z', Key.NULL ]).perform();
    waitForCssTransitions();
    sleepIfHumanObserver(0.7);
}

function ctrlZOrUndo(i) {
    if (i % 2 > 0) {
        ctrlZ();
    } else {
        click('Undo');
    }
}
function ctrlShiftZOrRedo(i) {
    if (i % 2 > 0) {
        ctrlShiftZ();
    } else {
        click('Redo');
    }
}

test('use all features, then undo all, then redo all', async () => {
    class UndoRedoAsserter {
        constructor() {
            this.fragments = [];
        }

        assertFragmentAndPush(expectedFragment) {
            assertFragment(expectedFragment);
            this.fragments.push(expectedFragment);
        }

        undoRedoAll() {
            // Deterministically mix Ctrl-[Shift-]Z and Undo/Redo menu items
            const len = this.fragments.length;
            let assertPromises = [];
            for (let i = len - 1; i >= 0; i--) {
                assertPromises.push(assertFragment(this.fragments[i]));
                ctrlZOrUndo(i);
            }
            for (let i = 0; i < len; i++) {
                ctrlShiftZOrRedo(i);
                assertPromises.push(assertFragment(this.fragments[i]));
            }
            // We want to return a Promise to block tests from completing
            return Promise.all(assertPromises);
        }
    }

    let asserter = new UndoRedoAsserter();

    goTo('empty');

    clickAddObject();
    asserter.assertFragmentAndPush('o1,NewObject');

    clickAndType('NewObject', 'Undoer');
    asserter.assertFragmentAndPush('o1,Undoer');

    clickAddObject();
    asserter.assertFragmentAndPush('o1,Undoer;o2,NewObject');

    clickAndType('NewObject', 'Redoer');
    asserter.assertFragmentAndPush('o1,Undoer;o2,Redoer');

    await addMessage('Undoer', 'Redoer');
    asserter.assertFragmentAndPush('o1,Undoer;o2,Redoer;m1,o1,o2,sendMessage()');

    clickAndType('sendMessage()', 'invoke()');
    asserter.assertFragmentAndPush('o1,Undoer;o2,Redoer;m1,o1,o2,invoke()');

    flip('m1');
    asserter.assertFragmentAndPush('o1,Undoer;o2,Redoer;m1,o2,o1,invoke()');

    clickAddObject();
    asserter.assertFragmentAndPush('o1,Undoer;o2,Redoer;o3,NewObject;m1,o2,o1,invoke()');

    clickAndType('NewObject', 'User');
    asserter.assertFragmentAndPush('o1,Undoer;o2,Redoer;o3,User;m1,o2,o1,invoke()');

    return asserter.undoRedoAll();
})
