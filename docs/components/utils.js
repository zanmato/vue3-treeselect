import { encodeHTML } from "entities";

export const code = (str) => `<code>${encodeHTML(str)}</code>`;

export const strong = (str) => `<strong>${str}</strong>`;

export const link = (target, text = "here") =>
  `<a href="${target}">${text}</a>`;

export const makeNameList = (names) => {
  names = names.map(code);
  const tail = names.pop();
  if (names.length < 2) {
    return tail;
  }
  return names.join(", ") + " & " + tail;
};

export const makePropList = (propNames) => {
  return "{" + propNames.map(code).join(", ") + "}";
};

export const makeArgNameList = (argNames) => {
  return "(" + argNames.map(code).join(", ") + ")";
};

function createArray(len, valueMaker) {
  const arr = [];
  let i = 0;
  while (i < len) {
    arr.push(valueMaker(i++));
  }
  return arr;
}

export function generateOptions(maxLevel, itemsPerLevel = maxLevel) {
  const generate = (parentId) =>
    createArray(itemsPerLevel, (i) => {
      const id = parentId + String.fromCharCode(97 + i);
      const option = { id, label: id.toUpperCase() };
      if (id.length < maxLevel) {
        option.children = generate(id);
      }
      return option;
    });

  return generate("");
}

export function kebabCase(path) {
  return path
    .replace(/ & /g, " And ")
    .replace(/[A-Z]+/, (x) => x[0] + x.slice(1).toLowerCase())
    .replace(/^[A-Z]/, (x) => x.toLowerCase())
    .replace(/[A-Z ]/g, (x) => "-" + x.toLowerCase())
    .replace(/[^A-Za-z]/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .replace(/-{2,}/g, "-");
}
