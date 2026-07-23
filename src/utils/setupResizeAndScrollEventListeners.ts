function findScrollParents($el: HTMLElement): (HTMLElement | Window)[] {
  const $scrollParents: (HTMLElement | Window)[] = [];
  let $parent: Node | null = $el.parentNode;

  while (
    $parent &&
    $parent.nodeName !== "BODY" &&
    $parent.nodeType === document.ELEMENT_NODE
  ) {
    if (isScrollElment($parent as HTMLElement)) {
      $scrollParents.push($parent as HTMLElement);
    }
    $parent = $parent.parentNode;
  }
  $scrollParents.push(window);

  return $scrollParents;
}

function isScrollElment($el: HTMLElement): boolean {
  // Firefox wants us to check `-x` and `-y` variations as well
  const { overflow, overflowX, overflowY } = getComputedStyle($el);
  return /(auto|scroll|overlay)/.test(overflow + overflowY + overflowX);
}

export function setupResizeAndScrollEventListeners(
  $el: HTMLElement,
  listener: EventListener
): () => void {
  const $scrollParents = findScrollParents($el);

  window.addEventListener("resize", listener, { passive: true });
  for (const scrollParent of $scrollParents) {
    scrollParent.addEventListener("scroll", listener, { passive: true });
  }

  return function removeEventListeners() {
    window.removeEventListener("resize", listener);
    for (const $scrollParent of $scrollParents) {
      $scrollParent.removeEventListener("scroll", listener);
    }
  };
}
