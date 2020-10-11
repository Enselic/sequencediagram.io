export function initMouseOverlay() {
  const div = document.createElement("div");
  div.style.backgroundColor = "#f0f";
  div.style.pointerEvents = "none";
  div.style.position = "absolute";

  let scale = 1;
  function update(action) {
    return (e) => {
      if (action) {
        action();
      }

      const pxSize = scale * 16;
      const pxSizeHalf = pxSize / 2;

      div.style.left = e.pageX - pxSizeHalf + "px";
      div.style.top = e.pageY - pxSizeHalf + "px";
      div.style.borderRadius = pxSizeHalf + "px";
      div.style.width = pxSize + "px";
      div.style.height = pxSize + "px";
    };
  }

  const opts = { capture: true };
  document.addEventListener("mousemove", update(), opts);
  document.addEventListener(
    "mousedown",
    update(() => (scale = 0.5)),
    opts
  );
  document.addEventListener(
    "mouseup",
    update(() => (scale = 1)),
    opts
  );

  document.body.appendChild(div);
}
