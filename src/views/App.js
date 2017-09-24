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
  }

  render() {
    const { state, dispatch } = this.props;
    const { core, pending } = state;
    const { objects, messages } = core.present;

    // We want to perform the layout as if the pending names were commited, so that
    // the diagram layout adapts to the pending names which we show as part of the
    // diagram
    function withPendingNewName(component) {
      if (
        pending.componentRenamed &&
        pending.componentRenamed.key === component.key
      ) {
        return { ...component, name: pending.componentRenamed.newName };
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
            pending.message.start,
            eventToDiagramCoords(e)[0],
            pending.message.y,
            pending.message.name
          )
        );
      };
      pendingMessageLayout = layout[pending.message.key];
    }

    function controlsColorProp(componentKey) {
      const show =
        pending.hoveredComponentKey === componentKey &&
        !pending.componentMoved &&
        !pending.componentRenamed;
      return {
        controlsColor: show ? "black" : "transparent",
      };
    }

    return (
      <div
        onTouchEnd={() => dispatch(ac.touchWarn())}
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
              key={object.key}
              object={object}
              {...usefulProps}
              {...controlsColorProp(object.key)}
            />
          ))}

          {mapWithSameDomOrder(messages, this.messagesMemory, message => {
            const msgLayout = layout[message.key];
            return msgLayout ? (
              <Message
                key={message.key}
                message={message}
                msgLayout={msgLayout}
                {...usefulProps}
                {...controlsColorProp(message.key)}
              />
            ) : null;
          })}

          {pending.message && (
            <Message
              key={pending.message.key}
              message={pending.message}
              msgLayout={pendingMessageLayout}
              {...usefulProps}
              isPending={true}
            />
          )}

          {pending.lifelineHoveredKey &&
          (!pending.componentMoved || pending.componentMoved.part) && (
            <NewMessageMarker
              left={layout[pending.lifelineHoveredKey].lifelineX}
              top={
                pending.message ? (
                  pendingMessageLayout.top + 25
                ) : (
                  pending.lifelineHoveredY
                )
              }
              isStart={
                !!!pending.message &&
                !(pending.componentMoved && pending.componentMoved.part)
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
