import React from "react";
import { layoutMessageLeftAndWidth } from "./../layouter";
import {
  isJsonDifferent,
  transferPropsToStyle,
  transferStyleToProps,
} from "./utils";
import * as ac from "./../reducers";

export default function(props) {
  const {
    dispatch,
    message,
    layout,
    objects,
    type,
    msgLayout,
    controlsColor,
  } = props;

  function eventToPos(e) {
    return e.pageX;
  }

  function mousedown(part) {
    return e => {
      e.preventDefault();
      e.stopPropagation();

      const messageCopy = { ...message };

      const el = document.getElementById(message.key);
      const oldStyle = transferStyleToProps(el.style);
      el.style.transition = "none";

      function updatePositions(e) {
        let shortestDist = 10000000;
        objects.forEach(object => {
          const dist = Math.abs(eventToPos(e) - layout[object.key].lifelineX);
          if (dist < shortestDist) {
            shortestDist = dist;
            messageCopy[part] = object.key;
          }
        });

        const l = layoutMessageLeftAndWidth(
          layout,
          messageCopy,
          part === "start" ? e.pageX : undefined,
          part === "end" ? e.pageX : undefined
        );
        const style = el.style;
        style.left = l.left + "px";
        style.width = l.width + "px";
        style.borderWidth = l.borderWidth;
        style.borderImage = l.borderImage;
      }

      function mousemove(e) {
        e.preventDefault();

        updatePositions(e);
      }
      window.addEventListener("mousemove", mousemove);

      function mouseup(e) {
        e.preventDefault();

        transferPropsToStyle(oldStyle, el.style);

        if (isJsonDifferent(messageCopy, message)) {
          dispatch(ac.replaceMessage(messageCopy));
        }

        window.removeEventListener("mousemove", mousemove);
        dispatch(ac.endComponentMove());
      }
      window.addEventListener("mouseup", mouseup, { once: true });

      updatePositions(e);

      dispatch(ac.beginComponentMove(message.key, part));
    };
  }

  const padding = 15;
  let right, left;
  if (msgLayout.direction < 0) {
    if (type === "start") {
      right = -26;
    } else {
      left = -26;
    }
  } else {
    if (type === "start") {
      left = -26;
    } else {
      right = -26;
    }
  }
  const margin = 15;
  if (left) {
    left -= padding + margin;
  }
  if (right) {
    right -= padding + margin;
  }
  const showControls = controlsColor !== "transparent" ? true : undefined;
  const style = {
    cursor: "default",
    position: "absolute",
    right,
    left,
    bottom: -25,
    padding,
    background: showControls && "#f8f8f8",
    zIndex: 999,
    fontWeight: "bold",
    boxShadow: showControls && "0 3px 3px 0 rgba(0,0,0,.33)",
    color: showControls ? "#888" : "transparent",
  };

  return (
    <span
      id={message.key + "-" + type}
      style={style}
      className="message-end"
      onMouseDown={mousedown(type)}
    >
      ⇆
    </span>
  );
}
