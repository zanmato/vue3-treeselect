import sleep from "yaku/lib/sleep";
import Option from "@/components/Option.vue";
import { INPUT_DEBOUNCE_DELAY } from "@/constants";

export function $(selector, context = document) {
  return context.querySelector(selector);
}

function createArray(len, fn) {
  const arr = [];
  let i = 0;
  while (i < len) {
    arr.push(fn(i++));
  }
  return arr;
}

export function generateOptions(maxLevel) {
  const generate = (i, level) => {
    const id = String.fromCharCode(97 + i).repeat(level);
    const option = { id, label: id.toUpperCase() };
    if (level < maxLevel) {
      option.children = [generate(i, level + 1)];
    }
    return option;
  };

  return createArray(maxLevel, (i) => generate(i, 1));
}

function createKeyObject(keyCode) {
  const obj = {};
  Object.defineProperties(obj, {
    which: { value: keyCode },
    keyCode: { value: keyCode }
  });
  return obj;
}

export async function leftClick(wrapper) {
  const MOUSE_BUTTON_LEFT = { button: 0 };
  await wrapper.trigger("mousedown", MOUSE_BUTTON_LEFT);
}

export async function pressBackspaceKey(wrapper) {
  const input = findInput(wrapper);
  const KEY_BACKSPACE = createKeyObject(8);
  await input.trigger("keydown", KEY_BACKSPACE);
}

export async function pressEnterKey(wrapper) {
  const input = findInput(wrapper);
  const KEY_ENTER = createKeyObject(13);
  await input.trigger("keydown", KEY_ENTER);
}

export async function pressEscapeKey(wrapper, modifierKey) {
  const input = findInput(wrapper);
  const KEY_ESCAPE = createKeyObject(27);
  let eventData = KEY_ESCAPE;
  if (modifierKey) {
    eventData = { ...KEY_ESCAPE, [modifierKey]: true };
  }
  await input.trigger("keydown", eventData);
}

export async function pressEndKey(wrapper) {
  const input = findInput(wrapper);
  const KEY_END = createKeyObject(35);
  await input.trigger("keydown", KEY_END);
}

export async function pressHomeKey(wrapper) {
  const input = findInput(wrapper);
  const KEY_HOME = createKeyObject(36);
  await input.trigger("keydown", KEY_HOME);
}

export async function pressArrowLeft(wrapper) {
  const input = findInput(wrapper);
  const ARROW_LEFT = createKeyObject(37);
  await input.trigger("keydown", ARROW_LEFT);
}

export async function pressArrowUp(wrapper) {
  const input = findInput(wrapper);
  const ARROW_UP = createKeyObject(38);
  await input.trigger("keydown", ARROW_UP);
}

export async function pressArrowRight(wrapper) {
  const input = findInput(wrapper);
  const ARROW_RIGHT = createKeyObject(39);
  await input.trigger("keydown", ARROW_RIGHT);
}

export async function pressArrowDown(wrapper) {
  const input = findInput(wrapper);
  const ARROW_DOWN = createKeyObject(40);
  await input.trigger("keydown", ARROW_DOWN);
}

export async function pressDeleteKey(wrapper) {
  const input = findInput(wrapper);
  const KEY_DELETE = createKeyObject(46);
  await input.trigger("keydown", KEY_DELETE);
}

export async function pressAKey(wrapper) {
  const input = findInput(wrapper);
  const KEY_A = createKeyObject(65);
  await input.trigger("keydown", KEY_A);
}

export async function typeSearchText(wrapper, text) {
  const $input = findInput(wrapper);
  $input.element.value = text;
  await $input.trigger("input");
  expect(
    wrapper.vm.$refs.control.$refs["value-container"].$refs.input.value
  ).toBe(text);
  await sleep(INPUT_DEBOUNCE_DELAY + 1);
  expect(wrapper.vm.trigger.searchQuery).toBe(text);
}

export function findInputContainer(wrapper) {
  return wrapper.find(".vue3-treeselect__input-container");
}

export function findInput(wrapper) {
  return wrapper.find(".vue3-treeselect__input");
}

export function findMenuContainer(wrapper) {
  return wrapper.find(".vue3-treeselect__menu-container");
}

export function findMenu(wrapper) {
  return wrapper.find(".vue3-treeselect__menu");
}

export function findVisibleOptions(wrapper) {
  return wrapper.findAll(
    ".vue3-treeselect__option:not(.vue3-treeselect__option--hide)"
  );
}

export function findOptionByNodeId(wrapper, nodeId) {
  return wrapper.find(`.vue3-treeselect__option[data-id="${nodeId}"]`);
}

export function findOptionArrowContainerByNodeId(wrapper, nodeId) {
  return findOptionByNodeId(wrapper, nodeId).find(
    ".vue3-treeselect__option-arrow-container"
  );
}

export function findOptionArrowByNodeId(wrapper, nodeId) {
  return findOptionByNodeId(wrapper, nodeId).find(
    ".vue3-treeselect__option-arrow"
  );
}

export function findCheckboxByNodeId(wrapper, nodeId) {
  return findOptionByNodeId(wrapper, nodeId).find(".vue3-treeselect__checkbox");
}

export function findLabelContainerByNodeId(wrapper, nodeId) {
  return findOptionByNodeId(wrapper, nodeId).find(
    ".vue3-treeselect__label-container"
  );
}

export function findLabelByNodeId(wrapper, nodeId) {
  return findOptionByNodeId(wrapper, nodeId).find(".vue3-treeselect__label");
}

export function findChildrenOptionListByNodeId(wrapper, nodeId) {
  return wrapper
    .findAllComponents(Option)
    .find((optionWrapper) => optionWrapper.vm.node.id === nodeId)
    .find(".vue3-treeselect__list");
}
