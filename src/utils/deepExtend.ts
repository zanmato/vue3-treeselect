type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
  if (value == null || typeof value !== "object") {
    return false;
  }
  return Object.getPrototypeOf(value) === Object.prototype;
}

function copy(obj: PlainObject, key: string, value: unknown): void {
  if (isPlainObject(value)) {
    if (!obj[key]) {
      obj[key] = {};
    }
    deepExtend(obj[key] as PlainObject, value);
  } else {
    obj[key] = value;
  }
}

export function deepExtend<T extends PlainObject>(
  target: T,
  source: unknown
): T {
  if (isPlainObject(source)) {
    const keys = Object.keys(source);

    for (let i = 0, len = keys.length; i < len; i++) {
      copy(target, keys[i], source[keys[i]]);
    }
  }

  return target;
}
