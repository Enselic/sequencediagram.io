import * as ac from "./../../reducers";
import layouter, { layoutMessageLeftAndWidth } from "./../../layouter";
import { transferPropsToStyle, transferStyleToProps, isJsonDifferent } from ".";

/* To get high FPS while moving things around, manipulate DOM objects directly */
export default function(
  objects,
  messages,
  movedComponent,
  eventToPos,
  elementToPos,
  beginComponentMove,
  endComponentMove,
  rearrangeComponents,
  dispatch,
  pending
) {
  // The move helper eats mouse events, causing e.g. "click in text to place cursor" to break, so
  // disable the move helper if this object is being renamed
  const beingRenamed =
    pending.componentRenamed &&
    pending.componentRenamed.id === movedComponent.id;

  return beingRenamed
    ? null
    : e => {
        const downPos = eventToPos(e);
        let grabOffset = 0;
        let movedAwayFromClick = false;

        function getUiComponents(component) {
          const el = document.getElementById(component.id);

          if (component.id === movedComponent.id) {
            grabOffset = eventToPos(e) - parseInt(elementToPos(el), 10);
          }

          const style = el.style;
          return {
            component: component,
            el: el,
            oldStyle: transferStyleToProps(style),
          };
        }

        const uiObjects = objects.map(getUiComponents);
        const uiMessages = messages.map(getUiComponents);

        const isMovingObject = movedComponent.id[0] === "o";

        const uiComponents = isMovingObject ? uiObjects : uiMessages;
        const components = isMovingObject ? objects : messages;

        function updatePositions(e) {
          const offsettedPos = eventToPos(e) - grabOffset;

          const newPos = eventToPos(e);
          if (Math.abs(newPos - downPos) > 20) {
            movedAwayFromClick = true;
          }

          uiComponents.sort(function(o1, o2) {
            function toX(uiComponent) {
              if (uiComponent.component.id === movedComponent.id) {
                return offsettedPos;
              } else {
                return parseInt(elementToPos(uiComponent.el), 10);
              }
            }

            return toX(o1) - toX(o2);
          });
          const layout = layouter(
            name => name.length * 7 /* TODO: hack */,
            uiObjects.map(uiComponent => uiComponent.component),
            uiMessages.map(uiComponent => uiComponent.component)
          );

          uiObjects.forEach((uiObject, index) => {
            let pos;
            let transition;
            if (uiObject.component.id === movedComponent.id) {
              pos = offsettedPos;
              transition = undefined;
            } else {
              pos = layout[uiObject.component.id].lifelineX;
              transition = uiObject.oldStyle.transition;
            }
            const style = uiObject.el.style;
            uiObject.el.style.left = pos + "px";
            style.transition = transition;
          });
          uiMessages.forEach((uiMessage, index) => {
            const l = layout[uiMessage.component.id];
            let pos = l.top;
            let left = l.left;
            let width = l.width;
            let borderWidth = l.borderWidth;
            let borderImage = l.borderImage;
            let transition = uiMessage.oldStyle.transition;
            const o = uiMessage.component;
            if (o.id === movedComponent.id) {
              pos = offsettedPos;
              transition = undefined;
            }
            if (
              (o.sender && o.sender === movedComponent.id) ||
              (o.receiver && o.receiver === movedComponent.id)
            ) {
              transition = undefined;
            }

            const movingSender = o.sender === movedComponent.id;
            const movingReceiver = o.receiver === movedComponent.id;
            if (isMovingObject && (movingSender || movingReceiver)) {
              const tmpLayout = layoutMessageLeftAndWidth(
                layout,
                uiMessage.component,
                movingSender ? offsettedPos : undefined,
                movingReceiver ? offsettedPos : undefined
              );
              left = tmpLayout.left;
              width = tmpLayout.width;
              borderWidth = tmpLayout.borderWidth;
              borderImage = tmpLayout.borderImage;
            }
            const style = uiMessage.el.style;
            style.transition = transition;
            style.top = pos + "px";
            style.left = left + "px";
            style.width = width + "px";
            style.borderWidth = borderWidth;
            style.borderImage = borderImage;
          });
        }

        function mousemove(e) {
          e.preventDefault();

          updatePositions(e);
        }
        window.addEventListener("mousemove", mousemove);

        function mouseup(e) {
          e.preventDefault();

          // Reset CSS and collect new arrays of domain components
          function reduceAndReset(newComponents, uiComponent) {
            transferPropsToStyle(uiComponent.oldStyle, uiComponent.el.style);

            newComponents.push(uiComponent.component);
            return newComponents;
          }
          let newObjects = uiObjects.reduce(reduceAndReset, []);
          let newMessages = uiMessages.reduce(reduceAndReset, []);
          const newComponents = isMovingObject ? newObjects : newMessages;

          if (isJsonDifferent(newComponents, components)) {
            dispatch(rearrangeComponents(newComponents));
          }

          window.removeEventListener("mousemove", mousemove);
          dispatch(endComponentMove());

          if (!movedAwayFromClick) {
            dispatch(
              ac.editComponentName(movedComponent.id, movedComponent.name, true)
            );
          }
        }
        window.addEventListener("mouseup", mouseup, { once: true });

        updatePositions(e);

        dispatch(beginComponentMove(movedComponent.id));
      };
}
