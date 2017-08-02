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

    clickAddObject();
    asserter.assertFragmentAndPush('o1,Undoer;o2,Redoer;o3,NewObject;m1,o1,o2,invoke()');

    clickAndType('NewObject', 'User');
    asserter.assertFragmentAndPush('o1,Undoer;o2,Redoer;o3,User;m1,o1,o2,invoke()');

    await moveEndPointToActor('m1', 'start', 'User');
    asserter.assertFragmentAndPush('o1,Undoer;o2,Redoer;o3,User;m1,o3,o2,invoke()');

    await addMessage('Redoer', 'User', 'invoke()');
    asserter.assertFragmentAndPush('o1,Undoer;o2,Redoer;o3,User;m2,o2,o3,sendMessage();m1,o3,o2,invoke()');

    flip('m2');
    asserter.assertFragmentAndPush('o1,Undoer;o2,Redoer;o3,User;m2,o3,o2,sendMessage();m1,o3,o2,invoke()');

    clickAndType('sendMessage()', 'call()'); // Use a different term so we can search by text uniquely
    asserter.assertFragmentAndPush('o1,Undoer;o2,Redoer;o3,User;m2,o3,o2,call();m1,o3,o2,invoke()');

    toggleArrowStyle('m2');
    asserter.assertFragmentAndPush('o1,Undoer;o2,Redoer;o3,User;m2,o3,o2,call(),a;m1,o3,o2,invoke()');

    toggleLineStyle('m1');
    asserter.assertFragmentAndPush('o1,Undoer;o2,Redoer;o3,User;m2,o3,o2,call(),a;m1,o3,o2,invoke(),r');

    dragAndDrop('User', { x: -500, y: 0 });
    asserter.assertFragmentAndPush('o3,User;o1,Undoer;o2,Redoer;m2,o3,o2,call(),a;m1,o3,o2,invoke(),r');

    dragAndDrop('call()', { x: 0, y: 500 });
    asserter.assertFragmentAndPush('o3,User;o1,Undoer;o2,Redoer;m1,o3,o2,invoke(),r;m2,o3,o2,call(),a');

    return asserter.undoRedoAll();
}, 80 * 1000)
