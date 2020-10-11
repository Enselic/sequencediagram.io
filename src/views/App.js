import React from 'react';
import { ActionCreators } from 'redux-undo';
import { layouter } from './../layouter';
import Objekt from './Object';
import Message from './Message';
import Header from './Header';
import Menu from './Menu';
import NewMessageMarker from './NewMessageMarker';
import { eventToDiagramCoords, mapWithSameDomOrder } from './utils';
import * as ac from './../reducers';
import isEqual from 'lodash.isequal';
import { getNextId } from './../reducers';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.objectsMemory = [];
    this.messagesMemory = [];

    this.state = {
      messageAnchorMoved: undefined,
      componentMoved: undefined,
    };

    this.handleOnAnchorClick = (message, type, newX) => {
      this.setState({ messageAnchorMoved: { message, type, newX } });
    };

    this.handleKeyDown = (e) => {
      const z = 90;
      const Esc = 27;

      if (e.ctrlKey && e.keyCode === z) {
        props.dispatch(
          e.shiftKey ? ActionCreators.redo() : ActionCreators.undo()
        );
      } else if (e.keyCode === Esc) {
        this.setState({ messageAnchorMoved: undefined });
        props.dispatch(ac.escapePendingOperation());
      }
    };

    this.handleComponentMouseDown = (e, movedComponent) => {
      if (
        this.props.state.pending.componentRenamed &&
        this.props.state.pending.componentRenamed.key === movedComponent.key
      ) {
        // The move helper eats mouse events, causing e.g. "click in text to place cursor" to break, so
        // disable the move helper if this object is being renamed
        return;
      }

      if (this.props.state.backend.fixedRevision) {
        // No changes allowed; bail
        return;
      }

      const thiz = this;
      const isMovingObject = movedComponent.id[0] === 'o';

      const eventToPos = isMovingObject ? (e) => e.pageX : (e) => e.pageY;

      const downPos = eventToPos(e);
      let movedAwayFromClick = false;

      const idToStylePos = (id) => {
        const style = document.getElementById(id).style;
        return parseInt(isMovingObject ? style.left : style.top, 10);
      };
      let grabOffset = isMovingObject
        ? downPos - idToStylePos(movedComponent.id)
        : e.nativeEvent.offsetY + 10; /* message name background border */

      const { objects, messages } = this.props.state.core.present;
      const components = isMovingObject ? objects : messages;
      let pendingComponents = components.map((value) => {
        return { ...value };
      });

      function updatePositions(e) {
        const diagramCoords = eventToDiagramCoords(e);
        const offsettedPos =
          (isMovingObject ? diagramCoords[0] : diagramCoords[1]) - grabOffset;

        pendingComponents.sort(function (o1, o2) {
          function toX(component) {
            if (component.id === movedComponent.id) {
              return offsettedPos;
            } else {
              return idToStylePos(component.id);
            }
          }

          return toX(o1) - toX(o2);
        });

        thiz.setState({
          componentMoved: { component: movedComponent, newPos: offsettedPos },
          pendingComponents,
        });

        const newPos = eventToPos(e);
        if (Math.abs(newPos - downPos) > 20) {
          movedAwayFromClick = true;
        }
      }

      function mousemove(e) {
        e.preventDefault();

        updatePositions(e);
      }
      window.addEventListener('mousemove', mousemove);

      function mouseup(e) {
        e.preventDefault();

        if (!isEqual(pendingComponents, components)) {
          const fn = isMovingObject
            ? ac.rearrangeObjects
            : ac.rearrangeMessages;
          thiz.props.dispatch(fn(pendingComponents));
        }

        window.removeEventListener('mousemove', mousemove);

        thiz.setState({
          componentMoved: undefined,
          pendingComponents: undefined,
        });

        if (!movedAwayFromClick) {
          thiz.props.dispatch(
            ac.editComponentName(movedComponent.id, movedComponent.name, true)
          );
        }
      }
      window.addEventListener('mouseup', mouseup, { once: true });
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown, false);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown, false);
  }
  render() {
    const { state, dispatch } = this.props;
    const { core, pending } = state;
    const { objects, messages } = core.present;
    const thiz = this;

    // We want to perform the layout as if the pending names were commited, so that
    // the diagram layout adapts to the pending names which we show as part of the
    // diagram
    function withPendingChanges(component) {
      if (
        pending.componentRenamed &&
        pending.componentRenamed.id === component.id
      ) {
        return { ...component, name: pending.componentRenamed.newName };
      } else if (
        thiz.state.messageAnchorMoved &&
        thiz.state.messageAnchorMoved.message.id === component.id
      ) {
        const newComponent = { ...component };
        newComponent[thiz.state.messageAnchorMoved.type] =
          thiz.state.messageAnchorMoved.newX;
        return newComponent;
      } else if (thiz.state.componentMoved) {
        const theMovedComponent = thiz.state.componentMoved.component;
        const newComponent = { ...component };
        const newPos = thiz.state.componentMoved.newPos;
        if (theMovedComponent.id === component.id) {
          if (component.id[0] === 'o') {
            newComponent.overrideLifelineX = newPos;
          } else {
            newComponent.overrideNoTransition = true;
            newComponent.overrideTop = newPos;
          }
        } else if (
          theMovedComponent.id === component.sender ||
          theMovedComponent.id === component.receiver
        ) {
          newComponent.overrideNoTransition = true;
        }

        return newComponent;
      } else {
        return component;
      }
    }
    let objectsToUse = objects;
    let messagesToUse = messages;
    if (this.state.componentMoved) {
      if (this.state.componentMoved.component.id[0] === 'o') {
        objectsToUse = this.state.pendingComponents;
      } else {
        messagesToUse = this.state.pendingComponents;
      }
    }
    const objectsWithPendingChanges = objectsToUse.map(withPendingChanges);
    const messagesWithPendingChanges = messagesToUse.map(withPendingChanges);
    const layout = layouter(
      objectsWithPendingChanges,
      messagesWithPendingChanges,
      pending.message
    );
    const usefulProps = {
      objects,
      messages,
      pending,
      dispatch,
      layout,
      reduxState: state,
    };

    let pendingMessageLayout;
    let handleMouseMove;
    if (pending.message) {
      handleMouseMove = (e) => {
        dispatch(
          ac.pendingAddMessage(
            pending.message.sender,
            eventToDiagramCoords(e)[0],
            pending.message.y,
            pending.message.name
          )
        );
      };
      pendingMessageLayout = layout[pending.message.id];
    } else if (this.state.messageAnchorMoved) {
      handleMouseMove = (e) => {
        this.setState({
          messageAnchorMoved: {
            ...this.state.messageAnchorMoved,
            newX: e.pageX,
          },
        });
      };
      pendingMessageLayout = layout[this.state.messageAnchorMoved.message.id];
    }

    function handleLifelineClick(object) {
      return (e) => {
        if (usefulProps.reduxState.backend.fixedRevision) {
          // Don't allow changes
          return;
        }
        let action;
        let addedId;
        let addedName;
        if (thiz.state.messageAnchorMoved) {
          const newMessage = {
            ...messages.find(
              (message) =>
                message.id === thiz.state.messageAnchorMoved.message.id
            ),
          };
          newMessage[thiz.state.messageAnchorMoved.type] = object.id;
          action = ac.replaceMessage(newMessage);
          thiz.setState({
            messageAnchorMoved: undefined,
          });
        } else if (!pending.message || !pending.message.sender) {
          action = ac.pendingAddMessage(
            object.id,
            ...eventToDiagramCoords(e),
            'newMessage()'
          );
        } else {
          addedId = 'm' + getNextId(messages);
          addedName = pending.message.name;
          action = ac.addMessage(
            addedId,
            pending.message.sender,
            object.id,
            addedName,
            layout[pending.message.id].index
          );
        }
        dispatch(action);
        if (addedId && addedName) {
          dispatch(
            ac.editComponentName(addedId, addedName, true /*preselect*/)
          );
        }
      };
    }

    const showControls =
      !pending.message &&
      !this.state.componentMoved &&
      !this.state.messageAnchorMoved &&
      !state.backend.fixedRevision;

    const hoveredLifelineX = layout[pending.lifelineHoveredKey]
      ? layout[pending.lifelineHoveredKey].lifelineX
      : 0;

    return (
      <div
        onTouchEnd={() => dispatch(ac.touchWarn())}
        onKeyDown={this.handleKeyDown}
        style={{
          minWidth: layout.width,
          position: 'relative',
        }}
      >
        <Header {...usefulProps} />

        <Menu
          {...usefulProps}
          showUndo={core.past.length > 0}
          showRedo={core.future.length > 0}
          showTipIfSpace={objects.length < 3 && messages.length < 2}
        />

        <div
          onMouseMove={handleMouseMove}
          style={{ position: 'relative', height: layout.height + 50 }}
          id="diagram-root"
        >
          {mapWithSameDomOrder(objects, this.objectsMemory, (object) => (
            <Objekt
              key={object.id}
              object={object}
              onLifelineClick={handleLifelineClick(object)}
              onRemove={() => dispatch(ac.removeComponent(object.id))}
              onComponentMouseDown={this.handleComponentMouseDown}
              showControls={showControls}
              {...usefulProps}
            />
          ))}

          {mapWithSameDomOrder(messages, this.messagesMemory, (message) => {
            const msgLayout = layout[message.id];
            return msgLayout ? (
              <Message
                key={message.id}
                message={message}
                msgLayout={msgLayout}
                onAnchorClick={this.handleOnAnchorClick}
                onRemove={() => dispatch(ac.removeComponent(message.id))}
                onComponentMouseDown={this.handleComponentMouseDown}
                showControls={showControls}
                isPending={
                  this.state.messageAnchorMoved &&
                  this.state.messageAnchorMoved.message.id === message.id
                }
                {...usefulProps}
              />
            ) : null;
          })}

          {pending.message && (
            <Message
              key={pending.message.id}
              message={pending.message}
              msgLayout={pendingMessageLayout}
              {...usefulProps}
              isPending={true}
            />
          )}

          {!state.backend.fixedRevision &&
            pending.lifelineHoveredKey &&
            (!this.state.componentMoved ||
              this.state.componentMoved.component.part ||
              this.state.messageAnchorMoved) && (
              <NewMessageMarker
                left={hoveredLifelineX}
                top={
                  pendingMessageLayout
                    ? pendingMessageLayout.top
                    : pending.lifelineHoveredY
                }
                isStart={
                  !!!pending.message &&
                  !(
                    this.state.componentMoved &&
                    this.state.componentMoved.component.part
                  ) &&
                  !this.state.messageAnchorMoved
                }
                direction={hoveredLifelineX > pending.lifelineHoveredX ? -1 : 1}
              />
            )}
        </div>
      </div>
    );
  }
}
