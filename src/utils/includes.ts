export function includes(arrOrStr: string, elem: string): boolean;
export function includes<T>(arrOrStr: readonly T[], elem: unknown): boolean;
export function includes(
  arrOrStr: string | readonly unknown[],
  elem: unknown
): boolean {
  return (arrOrStr as readonly unknown[]).includes(elem);
}
