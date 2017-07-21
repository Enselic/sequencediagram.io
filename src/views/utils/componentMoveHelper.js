import * as ac from './../../reducers'
import layouter, { layoutMessageLeftAndWidth } from './../../layouter'
import { transferPropsToStyle } from '.'

/* To get high FPS while moving things around, manipulate DOM objects directly */
export default function(objects, messages, movedComponent, eventToPos, elementToPos, beginComponentMove, endComponentMove, rearrangeComponents, dispatch, pending) {
    // The move helper eats mouse events, causing e.g. "click in text to place cursor" to break, so
    // disable the move helper if this object is being renamed
    const beingRenamed = pending.componentRenamed && pending.componentRenamed.key === movedComponent.key;

    return beingRenamed ? null : e => {
        const downPos = eventToPos(e);
        let grabOffset = 0;
        let movedAwayFromClick = false;

        function getUiComponents(component) {
            const el = document.getElementById(component.key);

            if (component.key === movedComponent.key) {
                grabOffset = eventToPos(e) - parseInt(elementToPos(el), 10);
            }

            const style = el.style;
            return {
                component: component,
                el: el,
                oldStyle: {
                    transition: style.transition,
                    left: style.left,
                    width: style.width,
                    top: style.top,
                    height: style.height,
                },
            };
        }

        const uiObjects = objects.map(getUiComponents);
        const uiMessages = messages.map(getUiComponents);

        const isMovingObject = movedComponent.key[0] === 'o';

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
                    if (uiComponent.component.key === movedComponent.key) {
                        return offsettedPos;
                    } else {
                        return parseInt(elementToPos(uiComponent.el), 10);
                    }
                }

                return toX(o1) - toX(o2)
            });
            const layout = layouter(name => name.length * 7 /* TODO: hack */,
                uiObjects.map(uiComponent => uiComponent.component),
                uiMessages.map(uiComponent => uiComponent.component));


            uiObjects.forEach((uiObject, index) => {
                let pos;
                let transition;
                if (uiObject.component.key === movedComponent.key) {
                    pos = offsettedPos;
                    transition = undefined;
                } else {
                    pos = layout[uiObject.component.key].lifelineX;
                    transition = uiObject.oldStyle.transition;
                }
                const style = uiObject.el.style;
                uiObject.el.style.left = pos + 'px';
                style.transition = transition;

            });
            uiMessages.forEach((uiMessage, index) => {
                const l = layout[uiMessage.component.key];
                let pos = l.top;
                let left = l.left;
                let width = l.width;
                let borderWidth = l.borderWidth;
                let borderImage = l.borderImage;
                let transition = uiMessage.oldStyle.transition;
                const o = uiMessage.component;
                if (o.key === movedComponent.key) {
                    pos = offsettedPos;
                    transition = undefined;
                }
                if ((o.start && o.start === movedComponent.key) ||
                        (o.end && o.end === movedComponent.key)) {
                    transition = undefined;
                }

                const movingStart = o.start === movedComponent.key;
                const movingEnd = o.end === movedComponent.key;
                if (isMovingObject && (movingStart || movingEnd)) {
                    const tmpLayout = layoutMessageLeftAndWidth(
                        layout,
                        uiMessage.component,
                        movingStart ? offsettedPos : undefined,
                        movingEnd ? offsettedPos : undefined);
                    left = tmpLayout.left;
                    width = tmpLayout.width;
                    borderWidth = tmpLayout.borderWidth;
                    borderImage = tmpLayout.borderImage;
                }
                const style = uiMessage.el.style;
                style.transition = transition;
                style.top = pos + 'px';
                style.left = left + 'px';
                style.width = width + 'px';
                style.borderWidth = borderWidth;
                style.borderImage = borderImage;
            });
        }

        function mousemove(e) {
            e.preventDefault();

            updatePositions(e);
        }
        window.addEventListener('mousemove', mousemove);

        function mouseup(e) {
            e.preventDefault();

            // Reset CSS and collect new arrays of domain components
            function reduceAndReset(newComponents, uiComponent) {
                transferPropsToStyle(uiComponent.oldStyle, uiComponent.el.style)

                newComponents.push(uiComponent.component);
                return newComponents;
            }
            let newObjects = uiObjects.reduce(reduceAndReset, []);
            let newMessages = uiMessages.reduce(reduceAndReset, []);
            const newComponents = isMovingObject ? newObjects : newMessages;

            if (JSON.stringify(newComponents) !== JSON.stringify(components)) {
                dispatch(rearrangeComponents(newComponents));
            }

            window.removeEventListener('mousemove', mousemove);
            dispatch(endComponentMove());

            if (!movedAwayFromClick) {
                dispatch(ac.editComponentName(movedComponent.key, movedComponent.name, true));
            }

        }
        window.addEventListener('mouseup', mouseup, { once: true });

        updatePositions(e);

        dispatch(beginComponentMove(movedComponent.key));
    }
}
