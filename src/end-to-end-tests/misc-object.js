import {
  waitForCssTransitions,
  sleepIfHumanObserver,
  getTextCenterPos,
  waitForElement,
  findElementByText,
  mouseMoveInSteps,
  dragAndDrop,
  clickText,
  typeTextAndPressReturn,
  typeText,
  clickAndType,
  assertFragment,
  goTo,
  clickLifelineForObjectWithText,
  clickAddObject,
  addMessage,
  moveAnchorPointToActor,
  flip,
  toggleArrowStyle,
  toggleLineStyle,
  removeComponentWithKey,
} from './lib';

it('change object name', async () => {
  await goTo(driver, 'o1,ChangeMyName');
  await clickAndType(driver, 'ChangeMyName', 'NewText');
  return assertFragment(driver, 'o1,NewText');
});
