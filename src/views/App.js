import React from "react";
import layouter from "./../layouter";
import Objekt from "./Object";
import Message from "./Message";
import Header from "./Header";
import Menu from "./Menu";
import NewMessageMarker from "./NewMessageMarker";
import { eventToDiagramCoords, mapWithSameDomOrder } from "./utils";
import * as ac from "./../reducers";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.objectsMemory = [];
    this.messagesMemory = [];

    this.state = {
      messageAnchorMoved: undefined,
    };

    this.handleOnAnchorClick = (message, type, newX) => {
      this.setState({ messageAnchorMoved: { message, type, newX } });
    };

    this.handleKeyDown = e => {
      if (e.keyCode === 27) {
        this.setState({ messageAnchorMoved: undefined });
      }
    };
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown, false);
  }
  render() {
    const { state, dispatch } = this.props;
    const { core, pending } = state;
    const { objects, messages } = core.present;
    const thiz = this;

    // We want to perform the layout as if the pending names were commited, so that
    // the diagram layout adapts to the pending names which we show as part of the
    // diagram
    function withPendingNewName(component) {
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
      } else {
        return component;
      }
    }
    const objectsWithPendingNames = objects.map(withPendingNewName);
    const messagesWithPendingNames = messages.map(withPendingNewName);
    const layout = layouter(
      name => name.length * 7 /* TODO: hack */,
      objectsWithPendingNames,
      messagesWithPendingNames,
      pending.message
    );
    const usefulProps = { objects, messages, pending, dispatch, layout };

    let pendingMessageLayout;
    let handleMouseMove;
    if (pending.message) {
      handleMouseMove = e => {
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
      handleMouseMove = e => {
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
      return e => {
        let action;
        if (thiz.state.messageAnchorMoved) {
          const newMessage = {
            ...messages.find(
              message => message.id === thiz.state.messageAnchorMoved.message.id
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
            "newMessage()"
          );
        } else {
          action = ac.addMessage(
            pending.message.sender,
            object.id,
            pending.message.name,
            layout[pending.message.id].index
          );
        }
        dispatch(action);
      };
    }

    const showControls =
      !pending.message &&
      !(pending.componentMoved && pending.componentMoved.part) &&
      !thiz.state.messageAnchorMoved;

    return (
      <div
        onTouchEnd={() => dispatch(ac.touchWarn())}
        onKeyDown={this.handleKeyDown}
        style={{
          minWidth: layout.width,
          position: "relative",
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
          style={{ position: "relative", height: layout.height + 50 }}
          id="diagram-root"
        >
          {mapWithSameDomOrder(objects, this.objectsMemory, object => (
            <Objekt
              key={object.id}
              object={object}
              onLifelineClick={handleLifelineClick(object)}
              onRemove={() => dispatch(ac.removeComponent(object.id))}
              showControls={showControls}
              {...usefulProps}
            />
          ))}

          {mapWithSameDomOrder(messages, this.messagesMemory, message => {
            const msgLayout = layout[message.id];
            return msgLayout ? (
              <Message
                key={message.id}
                message={message}
                msgLayout={msgLayout}
                onAnchorClick={this.handleOnAnchorClick}
                onRemove={() => dispatch(ac.removeComponent(message.id))}
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

          {pending.lifelineHoveredKey &&
          (!pending.componentMoved ||
            pending.componentMoved.part ||
            this.state.messageAnchorMoved) && (
            <NewMessageMarker
              left={layout[pending.lifelineHoveredKey].lifelineX}
              top={
                pendingMessageLayout ? (
                  pendingMessageLayout.top + 39
                ) : (
                  pending.lifelineHoveredY
                )
              }
              isStart={
                !!!pending.message &&
                !(pending.componentMoved && pending.componentMoved.part) &&
                !this.state.messageAnchorMoved
              }
              direction={
                layout[pending.lifelineHoveredKey].lifelineX >
                pending.lifelineHoveredX ? (
                  -1
                ) : (
                  1
                )
              }
            />
          )}
        </div>
      </div>
    );
  }
}
