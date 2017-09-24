import React from "react";
import Message from "./Message";
import { layoutMessageLeftAndWidth } from "./../layouter";

/**
 * When the user hovers a lifeline, this is what gets shown
 * to hint about that if they click, they will begin
 * constructing a new message.
 */
export default class NewMessageMarker extends React.PureComponent {
  render() {
    const width = 10;
    const height = 10;
    const { left, top, isStart, direction } = this.props;
    const tmpMessage = {
      key: "newMessageMarker",
      start: null,
      end: null,
      name: "",
    };
    const messageHeight = 20;
    const msgLayout = {
      ...layoutMessageLeftAndWidth(
        null,
        tmpMessage,
        left,
        left + direction * width
      ),
      top: top - messageHeight / 2,
    };

    return isStart ? (
      <Message message={tmpMessage} msgLayout={msgLayout} isPending={true} />
    ) : (
      <div
        style={{
          border: "1px dotted black",
          width: width,
          height: height,
          borderRadius: 15,
          left: left - width / 2,
          top: top - height / 2,
          position: "relative",
          pointerEvents: "none",
          background: "#000",
        }}
      />
    );
  }
}
