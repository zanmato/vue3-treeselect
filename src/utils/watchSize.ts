import watchSizeForBrowsersOtherThanIE9 from "watch-size";

export function watchSize(
  $el: HTMLElement,
  listener: (...args: unknown[]) => void
): () => void {
  // watch-size will call the listener on initialization.
  // Disable this behavior with a lock to achieve a clearer code logic.
  let locked = true;
  const wrappedListener = (...args: unknown[]) =>
    locked || listener(...args);
  const removeSizeWatcher = watchSizeForBrowsersOtherThanIE9(
    $el,
    wrappedListener
  );
  locked = false; // unlock after initialization

  return removeSizeWatcher;
}
