export function find<T>(
  arr: readonly T[],
  predicate: (
    this: unknown,
    elem: T,
    index: number,
    arr: readonly T[]
  ) => unknown,
  ctx?: unknown
): T | undefined {
  for (let i = 0, len = arr.length; i < len; i++) {
    if (predicate.call(ctx, arr[i], i, arr)) {
      return arr[i];
    }
  }
  return undefined;
}
