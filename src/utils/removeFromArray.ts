export function removeFromArray<T>(arr: T[], elem: T): void {
  const idx = arr.indexOf(elem);
  if (idx !== -1) {
    arr.splice(idx, 1);
  }
}
