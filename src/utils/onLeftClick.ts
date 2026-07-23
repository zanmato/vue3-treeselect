export function onLeftClick<TArgs extends unknown[], TThis>(
  mouseDownHandler: (this: TThis, evt: MouseEvent, ...args: TArgs) => void
) {
  return function onMouseDown(
    this: TThis,
    evt: MouseEvent,
    ...args: TArgs
  ): void {
    if (evt.type === "mousedown" && evt.button === 0) {
      mouseDownHandler.call(this, evt, ...args);
    }
  };
}
