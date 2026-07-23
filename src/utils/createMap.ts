export const createMap = <T = unknown>(): Record<string | number, T> =>
  Object.create(null) as Record<string | number, T>;
