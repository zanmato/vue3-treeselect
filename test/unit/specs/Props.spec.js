import { nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { vi } from "vitest";
import sleep from "yaku/lib/sleep";
import {
  $,
  generateOptions,
  leftClick,
  typeSearchText,
  findInputContainer,
  findInput,
  findMenuContainer,
  findOptionByNodeId,
  findLabelContainerByNodeId
} from "./shared";
import Treeselect from "@/components/Treeselect.vue";
import Option from "@/components/Option.vue";
import MultiValueItem from "@/components/MultiValueItem.vue";
import {
  UNCHECKED,
  CHECKED,
  INDETERMINATE,
  ALL,
  BRANCH_PRIORITY,
  LEAF_PRIORITY,
  ALL_WITH_INDETERMINATE
} from "@/constants";

describe("Props", () => {
  describe("allowClearingDisabled", () => {
    let wrapper, vm;

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        props: {
          multiple: true,
          clearable: true,
          options: [
            {
              id: "a",
              label: "a",
              isDisabled: true
            },
            {
              id: "b",
              label: "b"
            },
            {
              id: "c",
              label: "c",
              isDisabled: true
            }
          ]
        }
      });
      vm = wrapper.vm;
    });

    describe("when allowClearingDisabled=false", () => {
      beforeEach(async () => {
        await wrapper.setProps({ allowClearingDisabled: false });
      });

      describe("when all selected nodes are disabled", () => {
        beforeEach(async () => {
          await wrapper.setProps({ modelValue: ["a", "c"] });
        });

        it('should hide "×" button', () => {
          expect(wrapper.find(".vue3-treeselect__x").exists()).toBe(false);
        });
      });

      describe("when not all selected nodes are disabled", () => {
        beforeEach(async () => {
          await wrapper.setProps({ modelValue: ["a", "b"] });
        });

        it('should show "×" button ', () => {
          expect(wrapper.find(".vue3-treeselect__x").exists()).toBe(true);
        });

        it("clear() should only remove undisabled value", async () => {
          vm.clear();
          await nextTick();
          expect(vm.internalValue).toEqual(["a"]);
          expect(wrapper.find(".vue3-treeselect__x").exists()).toBe(false);
        });
      });
    });

    describe("when allowClearingDisabled=true", () => {
      beforeEach(async () => {
        await wrapper.setProps({ allowClearingDisabled: true });
      });

      describe("when all selected nodes are disabled", () => {
        beforeEach(async () => {
          await wrapper.setProps({ modelValue: ["a", "c"] });
        });

        it('should show "×" button', () => {
          expect(wrapper.find(".vue3-treeselect__x").exists()).toBe(true);
        });

        it("clear() should completely reset value", async () => {
          vm.clear();
          await nextTick();
          expect(vm.internalValue).toEqual([]);
          expect(wrapper.find(".vue3-treeselect__x").exists()).toBe(false);
        });
      });
    });
  });

  describe("allowSelectingDisabledDescendants", () => {
    let wrapper, vm;

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        props: {
          multiple: true,
          options: [
            {
              id: "a",
              label: "a",
              children: [
                {
                  id: "aa",
                  label: "aa",
                  isDisabled: true,
                  children: [
                    {
                      id: "aaa",
                      label: "aaa"
                    }
                  ]
                },
                {
                  id: "ab",
                  label: "ab",
                  isDisabled: true
                },
                {
                  id: "ac",
                  label: "ac"
                }
              ]
            }
          ]
        }
      });
      vm = wrapper.vm;
    });

    describe("when allowSelectingDisabledDescendants=false", () => {
      beforeEach(async () => {
        await wrapper.setProps({ allowSelectingDisabledDescendants: false });
      });

      it("should not also select disabled descendants", async () => {
        await wrapper.setProps({ modelValue: [] });
        vm.select(vm.forest.nodeMap.a);
        expect(vm.internalValue).toEqual(["ac"]);
      });

      it("should not also deselect disabled descendants", async () => {
        await wrapper.setProps({ modelValue: ["a"] });
        vm.select(vm.forest.nodeMap.a);
        expect(vm.internalValue).toEqual(["aa", "ab"]);
      });
    });

    describe("when allowSelectingDisabledDescendants=true", () => {
      beforeEach(async () => {
        await wrapper.setProps({ allowSelectingDisabledDescendants: true });
      });

      it("should also select disabled descendants", async () => {
        await wrapper.setProps({ modelValue: [] });
        vm.select(vm.forest.nodeMap.a);
        expect(vm.internalValue).toEqual(["a"]);
      });

      it("should also deselect disabled descendants", async () => {
        await wrapper.setProps({ modelValue: ["a"] });
        vm.select(vm.forest.nodeMap.a);
        expect(vm.internalValue).toEqual([]);
      });

      it("disabled branch nodes are still unselectable", async () => {
        await wrapper.setProps({ modelValue: [] });
        vm.select(vm.forest.nodeMap.aa);
        expect(vm.internalValue).toEqual([]);
      });

      it("disabled branch nodes are still undeselectable", async () => {
        await wrapper.setProps({ modelValue: ["aa"] });
        vm.select(vm.forest.nodeMap.aa);
        expect(vm.internalValue).toEqual(["aa"]);
      });
    });
  });

  describe("alwaysOpen", () => {
    it("should auto open the menu on mount", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [],
          alwaysOpen: true
        }
      });
      const { vm } = wrapper;

      expect(vm.menu.isOpen).toBe(true);
    });

    it("should hide the arrow", async () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [],
          alwaysOpen: true
        }
      });

      await nextTick(); // the arrow exists on first render
      expect(
        wrapper.find(".vue3-treeselect__control-arrow-container").exists()
      ).toBe(false);
    });

    it("the menu should be unclosable", async () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [],
          alwaysOpen: true
        }
      });
      const { vm } = wrapper;

      vm.closeMenu();
      await nextTick();
      expect(vm.menu.isOpen).toBe(true);
    });

    it("when disabled=true, should not auto open the menu on mount", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [],
          alwaysOpen: true,
          disabled: true
        }
      });
      const { vm } = wrapper;

      expect(vm.menu.isOpen).toBe(false);
    });

    it("set disabled=true should close the already opened menu", async () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [],
          alwaysOpen: true,
          disabled: false
        }
      });
      const { vm } = wrapper;

      expect(vm.menu.isOpen).toBe(true);
      await wrapper.setProps({ disabled: true });
      expect(vm.menu.isOpen).toBe(false);
    });

    it("set `disabled` from true to false should open the menu", async () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [],
          alwaysOpen: true,
          disabled: true
        }
      });
      const { vm } = wrapper;

      expect(vm.menu.isOpen).toBe(false);
      await wrapper.setProps({ disabled: false });
      expect(vm.menu.isOpen).toBe(true);
    });

    it("should show the arrow when disabled", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [],
          alwaysOpen: true,
          disabled: true
        }
      });

      expect(
        wrapper.find(".vue3-treeselect__control-arrow-container").exists()
      ).toBe(true);
    });

    it("set `alwaysOpen` from `false` to `true` should open the menu and hide the arrow", async () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [],
          alwaysOpen: false
        }
      });
      const { vm } = wrapper;

      expect(vm.menu.isOpen).toBe(false);
      await wrapper.setProps({ alwaysOpen: true });
      expect(vm.menu.isOpen).toBe(true);
      expect(
        wrapper.find(".vue3-treeselect__control-arrow-container").exists()
      ).toBe(false);
    });

    it("set `alwaysOpen` from `true` to `false` should close the menu and show the arrow", async () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [],
          alwaysOpen: true
        }
      });
      const { vm } = wrapper;

      expect(vm.menu.isOpen).toBe(true);
      await wrapper.setProps({ alwaysOpen: false });
      expect(vm.menu.isOpen).toBe(false);
      expect(
        wrapper.find(".vue3-treeselect__control-arrow-container").exists()
      ).toBe(true);
    });
  });

  describe("appendToBody", () => {
    const findPortalTarget = (vm) =>
      $(
        `.vue3-treeselect__portal-target[data-instance-id="${vm.getInstanceId()}"]`
      );

    it("basic", async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        attachTo: document.body,
        props: {
          appendToBody: true,
          options: []
        }
      });
      const { vm } = wrapper;

      vm.openMenu();
      await nextTick();

      const portalTarget = findPortalTarget(vm);
      expect(portalTarget.classList).toContain("vue3-treeselect");
      expect(portalTarget.firstElementChild.classList).toContain(
        "vue3-treeselect__menu-container"
      );
    });

    it("should remove portal target when component gets unmounted", async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        attachTo: document.body,
        props: {
          appendToBody: true,
          options: []
        }
      });
      const { vm } = wrapper;

      vm.openMenu();
      await nextTick();

      expect(findPortalTarget(vm)).toBeTruthy();

      wrapper.unmount();
      await nextTick();

      expect(findPortalTarget(vm)).toBe(null);
    });

    it("should remove portal target when set back to `appendToBody: false`", async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        props: {
          appendToBody: false,
          options: []
        },
        attachTo: document.body
      });
      const { vm } = wrapper;

      expect(findPortalTarget(vm)).toBe(null);

      await wrapper.setProps({ appendToBody: true });
      expect(findPortalTarget(vm)).toBeTruthy();

      await wrapper.setProps({ appendToBody: false });
      expect(findPortalTarget(vm)).toBe(null);

      await wrapper.setProps({ appendToBody: true });
      expect(findPortalTarget(vm)).toBeTruthy();
    });

    it("portaled menu should be functional", async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        props: {
          appendToBody: true,
          options: [
            {
              id: "a",
              label: "a"
            }
          ]
        },
        attachTo: document.body
      });
      const { vm } = wrapper;

      vm.openMenu();
      await nextTick();

      const portalTarget = findPortalTarget(vm);
      const label = $(".vue3-treeselect__label", portalTarget);
      expect(label.textContent.trim()).toBe("a");

      const event = new Event("mousedown", { bubbles: true, cancelable: true });
      event.button = 0;
      label.dispatchEvent(event);
      expect(vm.internalValue).toEqual(["a"]);
    });

    it("should set `z-index` on menu container when appendToBody=false", async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        props: {
          zIndex: 1,
          appendToBody: false,
          options: []
        },
        attachTo: document.body
      });
      const { vm } = wrapper;

      vm.openMenu();
      await nextTick();

      const menuContainer = findMenuContainer(wrapper);
      expect(menuContainer.element.style.zIndex).toBe("1");
    });

    it("should set `z-index` on portal target when appendToBody=true", async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        props: {
          zIndex: 1,
          appendToBody: true,
          options: []
        },
        attachTo: document.body
      });
      const { vm } = wrapper;

      vm.openMenu();
      await nextTick();

      const portalTarget = findPortalTarget(vm);
      expect(portalTarget.style.zIndex).toBe("1");

      const $menuContainer = $(
        ".vue3-treeselect__menu-container",
        portalTarget
      );
      expect($menuContainer.style.zIndex).toBe("");
    });
  });

  describe("async", () => {
    it("must be with searchable=true", () => {
      vi.spyOn(console, "error");

      mount(Treeselect, {
        props: {
          async: true,
          searchable: false,
          loadOptions() {
            /* empty */
          }
        }
      });

      expect(console.error).toHaveBeenCalledWith(
        "[Vue3-Treeselect Warning]",
        'For async search mode, the value of "searchable" prop must be true.'
      );
    });
  });

  describe("autoFocus", () => {
    it("should focus the search input on mount", () => {
      const wrapper = mount(Treeselect, {
        attachTo: document.body,
        props: {
          options: [],
          autoFocus: true,
          searchable: true
        }
      });
      const input = findInput(wrapper);
      expect(document.activeElement).toBe(input.element);
    });
  });

  describe("auto(De)SelectX", () => {
    let wrapper, vm;

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        props: {
          multiple: true,
          flat: true,
          options: [
            {
              id: "a",
              label: "a",
              children: [
                {
                  id: "aa",
                  label: "aa",
                  children: [
                    {
                      id: "aaa",
                      label: "aaa"
                    },
                    {
                      id: "aab",
                      label: "aab"
                    }
                  ]
                },
                {
                  id: "ab",
                  label: "ab"
                }
              ]
            },
            {
              id: "b",
              label: "b",
              children: [
                {
                  id: "ba",
                  label: "ba",
                  isDisabled: true,
                  children: [
                    {
                      id: "baa",
                      label: "baa"
                    }
                  ]
                }
              ]
            },
            {
              id: "c",
              label: "c"
            }
          ]
        }
      });
      vm = wrapper.vm;
    });

    it("autoSelectAncestors", async () => {
      await wrapper.setProps({
        autoSelectAncestors: true,
        modelValue: ["aa"]
      });
      expect(vm.internalValue).toEqual(["aa"]);

      vm.select(vm.forest.nodeMap.aaa);
      expect(vm.internalValue).toEqual(["aa", "aaa", "a"]);
    });

    it("autoSelectAncestors + disabled nodes", async () => {
      await wrapper.setProps({
        autoSelectAncestors: true,
        modelValue: []
      });
      expect(vm.internalValue).toEqual([]);

      vm.select(vm.forest.nodeMap.baa);
      expect(vm.internalValue).toEqual(["baa", "b"]);
    });

    it("autoSelectDescendants", async () => {
      await wrapper.setProps({
        autoSelectDescendants: true,
        modelValue: ["aa"]
      });
      expect(vm.internalValue).toEqual(["aa"]);

      vm.select(vm.forest.nodeMap.a);
      expect(vm.internalValue).toEqual(["aa", "a", "ab", "aaa", "aab"]);
    });

    it("autoSelectDescendants + disabled nodes", async () => {
      await wrapper.setProps({
        autoSelectDescendants: true,
        modelValue: []
      });
      expect(vm.internalValue).toEqual([]);

      vm.select(vm.forest.nodeMap.b);
      expect(vm.internalValue).toEqual(["b", "baa"]);
    });

    it("autoDeselectAncestors", async () => {
      await wrapper.setProps({
        autoDeselectAncestors: true,
        modelValue: ["aa", "aaa", "aab"]
      });
      expect(vm.internalValue).toEqual(["aa", "aaa", "aab"]);

      vm.select(vm.forest.nodeMap.aaa);
      expect(vm.internalValue).toEqual(["aab"]);
    });

    it("autoDeselectAncestors + disabled nodes", async () => {
      await wrapper.setProps({
        autoDeselectAncestors: true,
        modelValue: ["b", "ba", "baa"]
      });
      expect(vm.internalValue).toEqual(["b", "ba", "baa"]);

      vm.select(vm.forest.nodeMap.baa);
      expect(vm.internalValue).toEqual(["ba"]);
    });

    it("autoDeselectDescendants", async () => {
      await wrapper.setProps({
        autoDeselectDescendants: true,
        modelValue: ["a", "aaa", "aab"]
      });
      expect(vm.internalValue).toEqual(["a", "aaa", "aab"]);

      vm.select(vm.forest.nodeMap.a);
      expect(vm.internalValue).toEqual([]);
    });

    it("autoDeselectDescendants + disabled nodes", async () => {
      await wrapper.setProps({
        autoDeselectDescendants: true,
        modelValue: ["b", "ba", "baa"]
      });
      expect(vm.internalValue).toEqual(["b", "ba", "baa"]);

      vm.select(vm.forest.nodeMap.b);
      expect(vm.internalValue).toEqual(["ba"]);
    });

    it("must be used in conjunction with `flat=true`", () => {
      vi.spyOn(console, "error");

      function test(propName) {
        mount(Treeselect, {
          props: {
            [propName]: true,
            multiple: true,
            options: []
          }
        });

        expect(console.error).toHaveBeenCalledWith(
          "[Vue3-Treeselect Warning]",
          `"${propName}" only applies to flat mode.`
        );
        console.error.mockClear();
      }

      test("autoSelectAncestors");
      test("autoSelectDescendants");
      test("autoDeselectAncestors");
      test("autoDeselectDescendants");
    });
  });

  describe("beforeClearAll", () => {
    async function clickOnX(wrapper) {
      const x = wrapper.find(".vue3-treeselect__x-container");
      leftClick(x);
      // the `beforeClearAll` callback is always called async
      // we have to wait here
      await sleep(0);
    }

    it("the returned value determines whether to clear values", async () => {
      let shouldClear;
      const wrapper = mount(Treeselect, {
        props: {
          options: [
            {
              id: "a",
              label: "a"
            }
          ],
          modelValue: "a",
          beforeClearAll: () => shouldClear
        }
      });
      const { vm } = wrapper;

      shouldClear = false;
      await clickOnX(wrapper);
      expect(vm.internalValue).toEqual(["a"]);

      shouldClear = true;
      await clickOnX(wrapper);
      expect(vm.internalValue).toBeEmptyArray();
    });

    it("should support the callback returning a promise", async () => {
      let shouldClear;
      const wrapper = mount(Treeselect, {
        props: {
          options: [
            {
              id: "a",
              label: "a"
            }
          ],
          modelValue: "a",
          beforeClearAll: () => Promise.resolve(shouldClear)
        }
      });
      const { vm } = wrapper;

      shouldClear = false;
      await clickOnX(wrapper);
      expect(vm.internalValue).toEqual(["a"]);

      shouldClear = true;
      await clickOnX(wrapper);
      expect(vm.internalValue).toBeEmptyArray();
    });
  });

  describe("branchNodesFirst", () => {
    it("should place branch nodes ahead of leaf nodes when branchNodesFirst=true", () => {
      const wrapper = mount(Treeselect, {
        props: {
          branchNodesFirst: true,
          options: [
            {
              id: "a",
              label: "a"
            },
            {
              id: "b",
              label: "b",
              children: [
                {
                  id: "ba",
                  label: "ba"
                },
                {
                  id: "bb",
                  label: "bb",
                  children: [
                    {
                      id: "bba",
                      label: "bba"
                    }
                  ]
                },
                {
                  id: "bc",
                  label: "bc"
                }
              ]
            },
            {
              id: "c",
              label: "c"
            }
          ]
        }
      });
      const { vm } = wrapper;

      expect(vm.forest.normalizedOptions.map((node) => node.id)).toEqual([
        "b",
        "a",
        "c"
      ]);
      expect(vm.forest.nodeMap.b.children.map((node) => node.id)).toEqual([
        "bb",
        "ba",
        "bc"
      ]);
    });

    it("index", async () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [
            {
              id: "a",
              label: "a"
            },
            {
              id: "b",
              label: "b",
              children: [
                {
                  id: "ba",
                  label: "ba"
                },
                {
                  id: "bb",
                  label: "bb",
                  children: []
                }
              ]
            }
          ]
        }
      });
      const { vm } = wrapper;

      // TODO
      // await wrapper.setProps({ branchNodesFirst: true })
      // expect(vm.forest.nodeMap).toEqual({
      //   a: expect.objectContaining({ index: [ 1 ] }),
      //   b: expect.objectContaining({ index: [ 0 ] }),
      //   ba: expect.objectContaining({ index: [ 0, 1 ] }),
      //   bb: expect.objectContaining({ index: [ 0, 0 ] }),
      // })

      await wrapper.setProps({ branchNodesFirst: false });
      expect(vm.forest.nodeMap).toEqual({
        a: expect.objectContaining({ index: [0] }),
        b: expect.objectContaining({ index: [1] }),
        ba: expect.objectContaining({ index: [1, 0] }),
        bb: expect.objectContaining({ index: [1, 1] })
      });
    });

    it("should resort nodes after value of `branchNodesFirst` changes", async () => {
      const wrapper = mount(Treeselect, {
        props: {
          branchNodesFirst: false,
          options: [
            {
              id: "a",
              label: "a"
            },
            {
              id: "b",
              label: "b",
              children: [
                {
                  id: "ba",
                  label: "ba"
                },
                {
                  id: "bb",
                  label: "bb",
                  children: []
                },
                {
                  id: "bc",
                  label: "bc"
                }
              ]
            },
            {
              id: "c",
              label: "c"
            }
          ]
        }
      });
      const { vm } = wrapper;

      expect(vm.forest.normalizedOptions.map((node) => node.id)).toEqual([
        "a",
        "b",
        "c"
      ]);
      expect(vm.forest.nodeMap.b.children.map((node) => node.id)).toEqual([
        "ba",
        "bb",
        "bc"
      ]);

      await wrapper.setProps({ branchNodesFirst: true });

      expect(vm.forest.normalizedOptions.map((node) => node.id)).toEqual([
        "b",
        "a",
        "c"
      ]);
      expect(vm.forest.nodeMap.b.children.map((node) => node.id)).toEqual([
        "bb",
        "ba",
        "bc"
      ]);
    });
  });

  describe("clearable", () => {
    let wrapper, vm;

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        props: {
          multiple: false,
          clearable: true,
          options: [{ id: "a", label: "a" }],
          modelValue: "a"
        }
      });
      vm = wrapper.vm;
    });

    it('should show "×" button', () => {
      expect(wrapper.find(".vue3-treeselect__x").exists()).toBe(true);
    });

    it("should reset value on mousedown", async () => {
      expect(vm.forest.selectedNodeIds).toEqual(["a"]);
      leftClick(wrapper.find(".vue3-treeselect__x-container"));
      await sleep(1);
      expect(vm.forest.selectedNodeIds).toEqual([]);
    });

    it("should hide when no options selected", async () => {
      await wrapper.setProps({ modelValue: null });
      expect(wrapper.find(".vue3-treeselect__x").exists()).toBe(false);
    });

    it("should hide when disabled=true", async () => {
      await wrapper.setProps({ disabled: true });
      expect(wrapper.find(".vue3-treeselect__x").exists()).toBe(false);
    });

    it("should hide when clearable=false", async () => {
      await wrapper.setProps({ clearable: false });
      expect(wrapper.find(".vue3-treeselect__x").exists()).toBe(false);
    });
  });

  describe("clearAllText", () => {
    it('should be the title of "×" button when multiple=true', () => {
      const wrapper = mount(Treeselect, {
        props: {
          clearable: true,
          multiple: true,
          clearAllText: "$MULTI_TITLE$",
          options: [{ id: "a", label: "a" }],
          modelValue: ["a"]
        }
      });

      expect(
        wrapper.find(".vue3-treeselect__x-container").attributes().title
      ).toBe("$MULTI_TITLE$");
    });
  });

  describe("clearOnSelect", () => {
    describe("when multiple=false", () => {
      it("clears the input after selecting when clearOnSelect=true", () => {
        const wrapper = mount(Treeselect, {
          props: {
            clearOnSelect: true,
            multiple: false,
            options: [{ id: "a", label: "a" }]
          }
        });
        const { vm } = wrapper;
        vm.localSearch.active = true;
        vm.trigger.searchQuery = "$SEARCH_QUERY$";

        vm.select(vm.forest.nodeMap.a);
        expect(vm.trigger.searchQuery).toBe("");
      });

      it("still clears the input after selecting even if clearOnSelect!=true", () => {
        const wrapper = mount(Treeselect, {
          props: {
            clearOnSelect: false,
            multiple: false,
            options: [{ id: "a", label: "a" }]
          }
        });
        const { vm } = wrapper;
        vm.localSearch.active = true;
        vm.trigger.searchQuery = "$SEARCH_QUERY$";

        vm.select(vm.forest.nodeMap.a);
        expect(vm.trigger.searchQuery).toBe("");
      });
    });

    describe("when multiple=true", () => {
      it("clears the input after selecting when clearOnSelect=true", () => {
        const wrapper = mount(Treeselect, {
          props: {
            clearOnSelect: true,
            multiple: true,
            options: [{ id: "a", label: "a" }]
          }
        });
        const { vm } = wrapper;
        vm.localSearch.active = true;
        vm.trigger.searchQuery = "$SEARCH_QUERY$";

        vm.select(vm.forest.nodeMap.a);
        expect(vm.trigger.searchQuery).toBe("");
      });

      it("won't clear the input after selecting when clearOnSelect!=true", () => {
        const wrapper = mount(Treeselect, {
          props: {
            clearOnSelect: false,
            multiple: true,
            options: [{ id: "a", label: "a" }]
          }
        });
        const { vm } = wrapper;
        vm.localSearch.active = true;
        vm.trigger.searchQuery = "$SEARCH_QUERY$";

        vm.select(vm.forest.nodeMap.a);
        expect(vm.trigger.searchQuery).toBe("$SEARCH_QUERY$");
      });
    });
  });

  describe("clearValueText", () => {
    it('should be the title of "×" button when multiple=false', () => {
      const wrapper = mount(Treeselect, {
        props: {
          clearable: true,
          multiple: false,
          clearValueText: "$SINGLE_TITLE$",
          options: [{ id: "a", label: "a" }],
          modelValue: "a"
        }
      });

      expect(
        wrapper.find(".vue3-treeselect__x-container").attributes().title
      ).toBe("$SINGLE_TITLE$");
    });
  });

  describe("closeOnSelect", () => {
    it("closes the menu after selecting when closeOnSelect=true", async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        props: {
          closeOnSelect: true,
          multiple: false,
          options: [{ id: "a", label: "a" }]
        }
      });
      const { vm } = wrapper;

      vm.openMenu();
      await nextTick();

      const labelContainer = findLabelContainerByNodeId(wrapper, "a");

      leftClick(labelContainer);
      expect(vm.forest.selectedNodeIds).toEqual(["a"]);
      expect(vm.menu.isOpen).toBe(false);
    });

    it("keeps the menu open after selecting when closeOnSelect=false", async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        props: {
          closeOnSelect: false,
          multiple: false,
          searchable: true,
          options: [{ id: "a", label: "a" }]
        }
      });
      const { vm } = wrapper;

      vm.openMenu();
      await nextTick();

      const labelContainer = findLabelContainerByNodeId(wrapper, "a");

      leftClick(labelContainer);
      expect(vm.forest.selectedNodeIds).toEqual(["a"]);
      expect(vm.menu.isOpen).toBe(true);
      expect(vm.trigger.isFocused).toBe(false); // auto blur
    });
  });

  describe("defaultExpandLevel", () => {
    it("when defaultExpandLevel=0", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [
            {
              id: "a",
              label: "a",
              children: []
            }
          ],
          defaultExpandLevel: 0
        }
      });
      const { vm } = wrapper;
      const { a } = vm.forest.nodeMap;

      expect(a.isExpanded).toBe(false);
    });

    it("when defaultExpandLevel=1", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [
            {
              id: "a",
              label: "a",
              children: [
                {
                  id: "aa",
                  label: "aa",
                  children: []
                }
              ]
            }
          ],
          defaultExpandLevel: 1
        }
      });
      const { vm } = wrapper;
      const { a, aa } = vm.forest.nodeMap;

      expect(a.isExpanded).toBe(true);
      expect(aa.isExpanded).toBe(false);
    });

    it("when defaultExpandLevel=Infinity", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [
            {
              id: "a",
              label: "a",
              children: [
                {
                  id: "aa",
                  label: "aa",
                  children: []
                }
              ]
            }
          ],
          defaultExpandLevel: Infinity
        }
      });
      const { vm } = wrapper;
      const { a, aa } = vm.forest.nodeMap;

      expect(a.isExpanded).toBe(true);
      expect(aa.isExpanded).toBe(true);
    });

    it("with `node.isDefaultExpanded`", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [
            {
              id: "a",
              label: "a",
              children: [
                {
                  id: "aa",
                  label: "aa",
                  children: []
                }
              ]
            },
            {
              id: "b",
              label: "b",
              isDefaultExpanded: false,
              children: [
                {
                  id: "bb",
                  label: "bb",
                  isDefaultExpanded: true,
                  children: []
                }
              ]
            }
          ],
          defaultExpandLevel: 1
        }
      });
      const { a, aa, b, bb } = wrapper.vm.forest.nodeMap;

      expect(a.isExpanded).toBe(true);
      expect(aa.isExpanded).toBe(false);
      expect(b.isExpanded).toBe(true);
      expect(bb.isExpanded).toBe(true);
    });

    it("should request children options loading when expanded", () => {
      // TODO: 需要考虑服务端渲染的情况
      const loadOptions = vi.fn();
      const wrapper = mount(Treeselect, {
        props: {
          instanceId: "test",
          options: [
            {
              id: "a",
              label: "a",
              children: null
            },
            {
              id: "b",
              label: "b",
              children: [
                {
                  id: "bb",
                  label: "bb",
                  children: null
                }
              ]
            }
          ],
          defaultExpandLevel: 1,
          loadOptions
        }
      });
      const { vm } = wrapper;
      const { a } = vm.forest.nodeMap;

      expect(loadOptions.mock.calls.length).toBe(1);
      expect(loadOptions).toHaveBeenCalledWith({
        id: "test",
        instanceId: "test",
        action: "LOAD_CHILDREN_OPTIONS",
        parentNode: a.raw,
        callback: expect.any(Function)
      });
    });
  });

  describe("disableBranchNodes", () => {
    let wrapper, vm;

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        sync: false,
        props: {
          defaultExpandLevel: Infinity,
          flat: false,
          options: [
            {
              id: "branch",
              label: "branch",
              children: [
                {
                  id: "leaf",
                  label: "leaf"
                }
              ]
            }
          ]
        }
      });
      vm = wrapper.vm;
    });

    const getLabelContainerOfBranchNode = async () => {
      vm.openMenu(); // ensure the menu is opened otherwise the options won't be displayed
      await nextTick();

      return findLabelContainerByNodeId(wrapper, "branch");
    };

    const getLabelContainerOfLeafNode = async () => {
      vm.openMenu(); // ensure the menu is opened otherwise the options won't be displayed
      await nextTick();

      return findLabelContainerByNodeId(wrapper, "leaf");
    };

    const clickOnLabelOfBranchNode = async () => {
      const labelContainerOfBranchNode = await getLabelContainerOfBranchNode();
      leftClick(labelContainerOfBranchNode);
    };

    describe("when disableBranchNodes=false", () => {
      beforeEach(async () => {
        await wrapper.setProps({ disableBranchNodes: false });
      });

      it("a branch node should have checkbox when multiple=true", async () => {
        await wrapper.setProps({ multiple: true });

        const labelContainerOfBranchNode =
          await getLabelContainerOfBranchNode();

        expect(
          labelContainerOfBranchNode.find(".vue3-treeselect__checkbox").exists()
        ).toBe(true);
      });

      it("a leaf node should have checkbox too when multiple=true", async () => {
        await wrapper.setProps({ multiple: true });

        const labelContainerOfLeafNode = await getLabelContainerOfLeafNode();

        expect(
          labelContainerOfLeafNode.find(".vue3-treeselect__checkbox").exists()
        ).toBe(true);
      });

      it("click on label of a branch node should toggle checking state when multiple=true", async () => {
        await wrapper.setProps({ multiple: true });

        expect(vm.isSelected(vm.forest.nodeMap.branch)).toBe(false);
        await clickOnLabelOfBranchNode();
        expect(vm.isSelected(vm.forest.nodeMap.branch)).toBe(true);
        await clickOnLabelOfBranchNode();
        expect(vm.isSelected(vm.forest.nodeMap.branch)).toBe(false);
      });

      it("click on label of a branch node should not toggle expanding state when multiple=true", async () => {
        await wrapper.setProps({ multiple: true });

        expect(vm.forest.nodeMap.branch.isExpanded).toBe(true);
        await clickOnLabelOfBranchNode();
        expect(vm.forest.nodeMap.branch.isExpanded).toBe(true);
      });

      it("click on label of a branch node should close the dropdown when multiple=false & closeOnSelect=true", async () => {
        await wrapper.setProps({ multiple: false, closeOnSelect: true });
        vm.openMenu();
        await nextTick();

        expect(vm.menu.isOpen).toBe(true);
        await clickOnLabelOfBranchNode();
        expect(vm.menu.isOpen).toBe(false);
      });
    });

    describe("when disableBranchNodes=true", () => {
      beforeEach(async () => {
        await wrapper.setProps({ disableBranchNodes: true });
      });

      it("a branch node should not have checkbox when multiple=true", async () => {
        await wrapper.setProps({ multiple: true });
        const labelContainerOfBranchNode =
          await getLabelContainerOfBranchNode();

        expect(
          labelContainerOfBranchNode.find(".vue3-treeselect__checkbox").exists()
        ).toBe(false);
      });

      it("a leaf node should have checkbox when multiple=true", async () => {
        await wrapper.setProps({ multiple: true });
        const labelContainerOfLeafNode = await getLabelContainerOfLeafNode();

        expect(
          labelContainerOfLeafNode.find(".vue3-treeselect__checkbox").exists()
        ).toBe(true);
      });

      it("click on label of a branch node should not toggle checking state when multiple=true", async () => {
        await wrapper.setProps({ multiple: true });

        expect(vm.isSelected(vm.forest.nodeMap.branch)).toBe(false);
        await clickOnLabelOfBranchNode();
        expect(vm.isSelected(vm.forest.nodeMap.branch)).toBe(false);
      });

      it("click on label of a branch node should toggle expanding state when multiple=true", async () => {
        await wrapper.setProps({ multiple: true });

        expect(vm.forest.nodeMap.branch.isExpanded).toBe(true);
        await clickOnLabelOfBranchNode();
        expect(vm.forest.nodeMap.branch.isExpanded).toBe(false);
        await clickOnLabelOfBranchNode();
        expect(vm.forest.nodeMap.branch.isExpanded).toBe(true);
      });

      it("click on label of a branch node should not close the dropdown when multiple=false & closeOnSelect=true", async () => {
        await wrapper.setProps({ multiple: false, closeOnSelect: true });
        vm.openMenu();
        await nextTick();

        expect(vm.menu.isOpen).toBe(true);
        await clickOnLabelOfBranchNode();
        expect(vm.menu.isOpen).toBe(true);
      });

      it("should not auto-select ancestor nodes like flat mode", async () => {
        await wrapper.setProps({ multiple: true });
        await nextTick();

        vm.select(vm.forest.nodeMap.leaf);
        expect(vm.forest.checkedStateMap).toEqual({
          branch: UNCHECKED,
          leaf: CHECKED
        });
        expect(vm.forest.selectedNodeMap).toEqual({ leaf: true });
        expect(vm.forest.selectedNodeIds).toEqual(["leaf"]);
        expect(vm.internalValue).toEqual(["leaf"]);
        vm.select(vm.forest.nodeMap.leaf);
        expect(vm.internalValue).toEqual([]);
      });

      describe("combined with valueConsistsOf (multi-select mode)", () => {
        const types = [
          "ALL",
          "BRANCH_PRIORITY",
          "LEAF_PRIORITY",
          "ALL_WITH_INDETERMINATE"
        ];

        for (let i = 0; i < types.length; ++i) {
          const valueConsistsOf = types[i];
          it(`when valueConsistsOf=${valueConsistsOf}`, async () => {
            await wrapper.setProps({
              multiple: true,
              valueConsistsOf,
              modelValue: ["leaf"]
            });
            expect(vm.forest.checkedStateMap).toEqual({
              branch: UNCHECKED,
              leaf: CHECKED
            });
            expect(vm.forest.selectedNodeMap).toEqual({ leaf: true });
            expect(vm.forest.selectedNodeIds).toEqual(["leaf"]);
            expect(vm.internalValue).toEqual(["leaf"]);
          });
        }
      });
    });
  });

  describe("disabled", () => {
    it("when disabled=false", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [],
          searchable: true,
          disabled: false
        }
      });

      expect(wrapper.find(".vue3-treeselect__input-container").exists()).toBe(
        true
      );
      expect(wrapper.find(".vue3-treeselect__input").exists()).toBe(true);
    });

    describe("when disabled=true", () => {
      it("should hide the input but keep the input wrapper", () => {
        const wrapper = mount(Treeselect, {
          props: {
            options: [],
            searchable: true,
            disabled: true
          }
        });

        expect(wrapper.find(".vue3-treeselect__input-container").exists()).toBe(
          true
        );
        expect(wrapper.find(".vue3-treeselect__input").exists()).toBe(false);
      });

      it("should close the menu when setting disabled from false to true", async () => {
        const wrapper = mount(Treeselect, {
          sync: false,
          props: {
            options: [],
            disabled: false
          }
        });
        const { vm } = wrapper;

        vm.openMenu();
        await nextTick();

        expect(wrapper.vm.menu.isOpen).toBe(true);

        await wrapper.setProps({ disabled: true });

        expect(wrapper.vm.menu.isOpen).toBe(false);
      });

      it("the control should reject all clicks", () => {
        const wrapper = mount(Treeselect, {
          attachTo: document.body,
          props: {
            options: [],
            disabled: true
          }
        });
        const { vm } = wrapper;
        const valeContainer = wrapper.findComponent(
          ".vue3-treeselect__value-container"
        );

        leftClick(valeContainer);
        expect(vm.trigger.isFocused).toBe(false);
        expect(vm.menu.isOpen).toBe(false);
      });

      it("the control should be non-focusable", () => {
        const wrapper = mount(Treeselect, {
          attachTo: document.body,
          props: {
            options: [],
            disabled: true
          }
        });
        const { vm } = wrapper;

        wrapper.vm.focusInput();
        expect(vm.trigger.isFocused).toBe(false);
      });

      it("should be unable to open the menu", async () => {
        const wrapper = mount(Treeselect, {
          props: {
            options: [],
            disabled: true
          }
        });
        const { vm } = wrapper;

        wrapper.vm.openMenu();
        await nextTick();
        expect(vm.menu.isOpen).toBe(false);
      });
    });
  });

  describe("disableFuzzyMatching", () => {
    let wrapper, vm;

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        props: {
          options: [
            {
              id: "jamesblunt",
              label: "James Blunt"
            }
          ]
        }
      });
      vm = wrapper.vm;
    });

    it("when disableFuzzyMatching=false", async () => {
      await wrapper.setProps({ disableFuzzyMatching: false });
      await typeSearchText(wrapper, "jb");
      expect(vm.forest.nodeMap.jamesblunt.isMatched).toBe(true);
    });

    it("when disableFuzzyMatching=true", async () => {
      await wrapper.setProps({ disableFuzzyMatching: true });
      await typeSearchText(wrapper, "jb");
      expect(vm.forest.nodeMap.jamesblunt.isMatched).toBe(false);
    });
  });

  describe("flat", () => {
    it("must be used in conjunction with `multiple=true`", () => {
      vi.spyOn(console, "error");

      mount(Treeselect, {
        props: {
          options: [],
          flat: true
        }
      });

      expect(console.error).toHaveBeenCalledWith(
        "[Vue3-Treeselect Warning]",
        'You are using flat mode. But you forgot to add "multiple=true"?'
      );
    });
  });

  describe("instanceId", () => {
    it("default value", () => {
      const createInstance = () => {
        const wrapper = mount(Treeselect, {
          props: {
            options: []
          }
        });
        return wrapper.vm;
      };
      const vm1 = createInstance();
      const vm2 = createInstance();

      expect(vm1.instanceId).toEndWith("$$");
      expect(vm2.instanceId).toEndWith("$$");
      expect(vm1.instanceId).not.toBe(vm2.instanceId);
    });
  });

  describe("limit", () => {
    it("when limit=Infinity", () => {
      const wrapper = mount(Treeselect, {
        props: {
          multiple: true,
          limit: Infinity,
          modelValue: ["a", "b", "c", "d"],
          options: [
            {
              id: "a",
              label: "a"
            },
            {
              id: "b",
              label: "b"
            },
            {
              id: "c",
              label: "c"
            },
            {
              id: "d",
              label: "d"
            }
          ]
        }
      });
      const { vm } = wrapper;

      expect(vm.forest.selectedNodeIds).toEqual(["a", "b", "c", "d"]);
      expect(wrapper.findAllComponents(MultiValueItem).length).toBe(4);
      expect(wrapper.find(".vue3-treeselect__limit-tip").exists()).toBe(false);
    });

    it("when limit=1", () => {
      const wrapper = mount(Treeselect, {
        props: {
          multiple: true,
          limit: 1,
          modelValue: ["a", "b", "c", "d"],
          options: [
            {
              id: "a",
              label: "a"
            },
            {
              id: "b",
              label: "b"
            },
            {
              id: "c",
              label: "c"
            },
            {
              id: "d",
              label: "d"
            }
          ]
        }
      });
      const { vm } = wrapper;

      expect(vm.forest.selectedNodeIds).toEqual(["a", "b", "c", "d"]);
      expect(wrapper.findAllComponents(MultiValueItem).length).toBe(1);
      expect(wrapper.find(".vue3-treeselect__limit-tip").exists()).toBe(true);
      expect(wrapper.find(".vue3-treeselect__limit-tip").text()).toBe(
        "and 3 more"
      );
    });
  });

  describe("normalizer", () => {
    it("customizing key names", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [
            {
              key: "a",
              name: "a"
            }
          ],
          normalizer(node) {
            return {
              id: node.key,
              label: node.name
            };
          }
        }
      });
      const { vm } = wrapper;

      expect(vm.forest.nodeMap.a).toEqual(
        expect.objectContaining({
          id: "a",
          label: "a",
          raw: {
            key: "a",
            name: "a"
          }
        })
      );
    });

    it("with fallback node", () => {
      const wrapper = mount(Treeselect, {
        props: {
          modelValue: {
            key: "a",
            name: "a"
          },
          options: [],
          valueFormat: "object",
          normalizer(node) {
            return {
              id: node.key,
              label: node.name
            };
          }
        }
      });
      const { vm } = wrapper;

      expect(vm.forest.selectedNodeIds).toEqual(["a"]);
      expect(vm.forest.nodeMap.a).toEqual(
        expect.objectContaining({
          id: "a",
          label: "a",
          isFallbackNode: true,
          raw: {
            key: "a",
            name: "a"
          }
        })
      );
    });

    it("multiple instances share the same `normalizer` function", () => {
      const normalizer = (node, instanceId) => ({
        id: instanceId + "-" + node.key,
        label: node.name
      });
      const { vm: vm1 } = mount(Treeselect, {
        props: {
          instanceId: 1,
          options: [
            {
              key: "a",
              name: "a"
            }
          ],
          normalizer
        }
      });
      const { vm: vm2 } = mount(Treeselect, {
        props: {
          instanceId: 2,
          options: [
            {
              key: "a",
              name: "a"
            }
          ],
          normalizer
        }
      });

      expect(Object.keys(vm1.forest.nodeMap)).toEqual(["1-a"]);
      expect(Object.keys(vm2.forest.nodeMap)).toEqual(["2-a"]);
    });

    it("provide only the keys that need to be customized", () => {
      const normalizer = (node) => ({ id: node.key });
      const wrapper = mount(Treeselect, {
        props: {
          normalizer,
          options: [
            {
              key: "a",
              label: "a",
              children: [
                {
                  key: "aa",
                  label: "aa"
                }
              ]
            }
          ]
        }
      });
      const { vm } = wrapper;

      expect(vm.forest.nodeMap.a).toEqual(
        expect.objectContaining({
          id: "a",
          label: "a"
        })
      );
      expect(vm.forest.nodeMap.aa).toEqual(
        expect.objectContaining({
          id: "aa",
          label: "aa"
        })
      );
    });

    it("with `loadOptions` prop", async () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [
            {
              key: "a", // customized key
              label: "a",
              subitems: null // customized key
            }
          ],
          normalizer(node) {
            return {
              id: node.key,
              children: node.subitems
            };
          },
          loadOptions({ action, parentNode, callback }) {
            expect(action).toBe("LOAD_CHILDREN_OPTIONS");
            expect(parentNode).toHaveMember("key");
            expect(parentNode).toHaveMember("subitems");

            parentNode.subitems = [
              {
                key: "aa", // customized key
                label: "aa"
              }
            ];
            callback();
          }
        }
      });
      const { vm } = wrapper;

      vm.toggleExpanded(vm.forest.nodeMap.a);
      await nextTick();
      expect(vm.forest.nodeMap.a.children).toBeNonEmptyArray();
    });
  });

  describe("openOnClick", () => {
    it("when openOnClick=false", () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        attachTo: document.body,
        props: {
          options: [],
          openOnClick: false
        }
      });
      const { vm } = wrapper;
      const valeContainer = wrapper.findComponent(
        ".vue3-treeselect__value-container"
      );

      expect(vm.trigger.isFocused).toBe(false);
      expect(vm.menu.isOpen).toBe(false);

      leftClick(valeContainer);
      expect(vm.trigger.isFocused).toBe(true);
      expect(vm.menu.isOpen).toBe(false);

      leftClick(valeContainer);
      expect(vm.trigger.isFocused).toBe(true);
      expect(vm.menu.isOpen).toBe(true);
    });

    it("when openOnClick=true", () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        attachTo: document.body,
        props: {
          options: [],
          openOnClick: true
        }
      });
      const { vm } = wrapper;
      const valeContainer = wrapper.findComponent(
        ".vue3-treeselect__value-container"
      );

      expect(vm.trigger.isFocused).toBe(false);
      expect(vm.menu.isOpen).toBe(false);

      leftClick(valeContainer);
      expect(vm.trigger.isFocused).toBe(true);
      expect(vm.menu.isOpen).toBe(true);
    });
  });

  describe("openOnFocus", () => {
    it("when openOnFocus=false", async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        attachTo: document.body,
        props: {
          options: [],
          openOnFocus: false
        }
      });
      const { vm } = wrapper;
      const valeContainer = wrapper.findComponent(
        ".vue3-treeselect__value-container"
      );

      expect(vm.trigger.isFocused).toBe(false);
      expect(vm.menu.isOpen).toBe(false);

      wrapper.vm.focusInput();
      await nextTick();
      expect(vm.trigger.isFocused).toBe(true);
      expect(vm.menu.isOpen).toBe(false);

      leftClick(valeContainer);
      expect(vm.trigger.isFocused).toBe(true);
      expect(vm.menu.isOpen).toBe(true);
    });

    it("when openOnFocus=true", () => {
      const wrapper = mount(Treeselect, {
        attachTo: document.body,
        props: {
          options: [],
          openOnFocus: true
        }
      });
      const { vm } = wrapper;

      expect(vm.trigger.isFocused).toBe(false);
      expect(vm.menu.isOpen).toBe(false);

      wrapper.vm.focusInput();
      expect(vm.trigger.isFocused).toBe(true);
      expect(vm.menu.isOpen).toBe(true);
    });

    describe("combined with autoFocus", () => {
      it("when openOnFocus=false", () => {
        const wrapper = mount(Treeselect, {
          sync: false,
          attachTo: document.body,
          props: {
            options: [],
            autoFocus: true,
            openOnFocus: false
          }
        });
        const { vm } = wrapper;

        expect(vm.trigger.isFocused).toBe(true);
        expect(vm.menu.isOpen).toBe(false);
      });

      it("when openOnFocus=true", () => {
        const wrapper = mount(Treeselect, {
          sync: false,
          attachTo: document.body,
          props: {
            options: [],
            autoFocus: true,
            openOnFocus: true
          }
        });
        const { vm } = wrapper;

        expect(vm.trigger.isFocused).toBe(true);
        expect(vm.menu.isOpen).toBe(true);
      });
    });
  });

  describe("options", () => {
    it("show tip when `options` is an empty array", async () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: []
        }
      });

      await wrapper.vm.openMenu();

      const menu = wrapper.find(".vue3-treeselect__menu");
      const noOptionsTip = menu.findComponent(
        ".vue3-treeselect__no-options-tip"
      );
      expect(noOptionsTip.text().trim()).toBe("No options available.");
    });

    describe("should be reactive", () => {
      it("should override fallback node", async () => {
        const wrapper = mount(Treeselect, {
          props: {
            options: [],
            modelValue: "a" // this creates a fallback node
          }
        });
        const { vm } = wrapper;

        expect(vm.forest.nodeMap.a).toEqual(
          expect.objectContaining({
            isFallbackNode: true,
            label: "a (unknown)"
          })
        );

        await wrapper.setProps({
          options: [
            {
              id: "a",
              label: "a"
            }
          ]
        });
        expect(vm.forest.nodeMap.a.label).toBe("a");
      });

      it("directly modify `options` prop should trigger reinitializing", async () => {
        const wrapper = mount({
          components: { Treeselect },
          data() {
            return {
              options: [
                {
                  id: "a",
                  label: "a"
                }
              ]
            };
          },
          template: `<div><treeselect :options="options" /></div>`
        });
        const comp = wrapper.findComponent(Treeselect).vm;

        // note that, this is directly modifying the original `options` array,
        // not creating a new `options` array.
        comp.options[0].label = "xxx";
        await nextTick();
        expect(comp.forest.nodeMap.a.label).toBe("xxx");
      });

      it("should keep state", async () => {
        const wrapper = mount(Treeselect, {
          props: {
            multiple: true,
            options: [
              {
                id: "a",
                label: "a",
                children: [
                  {
                    id: "aa",
                    label: "aa"
                  }
                ]
              }
            ],
            modelValue: ["a"]
          }
        });
        const { vm } = wrapper;

        vm.toggleExpanded(vm.forest.nodeMap.a);
        expect(vm.isSelected(vm.forest.nodeMap.a)).toBe(true);
        expect(vm.forest.nodeMap.a.isExpanded).toBe(true);
        expect(vm.forest.checkedStateMap).toEqual({
          a: CHECKED,
          aa: CHECKED
        });

        await wrapper.setProps({
          options: [
            {
              id: "a",
              label: "a",
              children: [
                {
                  id: "aa",
                  label: "aa"
                },
                {
                  // add new option
                  id: "ab",
                  label: "ab"
                }
              ]
            },
            {
              // add new option
              id: "b",
              label: "b"
            }
          ]
        });
        expect(vm.isSelected(vm.forest.nodeMap.a)).toBe(true);
        expect(vm.forest.nodeMap.a.isExpanded).toBe(true);
        expect(vm.forest.checkedStateMap).toEqual({
          a: CHECKED,
          aa: CHECKED,
          ab: CHECKED,
          b: UNCHECKED
        });
      });

      it("should keep the state of selected nodes even if they are not present in `nodeMap`", async () => {
        const wrapper = mount(Treeselect, {
          props: {
            options: [
              {
                id: "a",
                label: "a"
              }
            ],
            modelValue: "a"
          }
        });
        const { vm } = wrapper;

        expect(vm.forest.nodeMap.a.label).toBe("a");

        await wrapper.setProps({
          options: [
            {
              id: "b",
              label: "b",
              children: []
            }
          ]
        });

        expect(vm.forest.nodeMap.a.label).toBe("a");
        expect(vm.forest.nodeMap.a.isFallbackNode).toBe(true);
      });
    });
  });

  describe("required", () => {
    let wrapper, input;

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        props: {
          options: [
            {
              id: "a",
              label: "a"
            }
          ],
          searchable: true
        }
      });
      input = findInput(wrapper);
    });

    describe("when required=true", () => {
      it("the input should have `required` attribute if having no value", async () => {
        await wrapper.setProps({ required: true });
        expect(input.element.required).toBe(true);
      });

      it("the input should not have `required` attribute if value is present", async () => {
        await wrapper.setProps({ modelValue: "a", required: true });
        expect(input.element.required).toBe(false);
      });
    });

    describe("when required=false", () => {
      it("the input should not have `required` attribute even if value is present", async () => {
        await wrapper.setProps({ modelValue: "a", required: false });
        expect(input.element.required).toBe(false);
      });
    });
  });

  describe("searchable", () => {
    describe("when searchable=true", () => {
      describe("when multiple=true", () => {
        it("should show input", () => {
          const wrapper = mount(Treeselect, {
            props: {
              multiple: true,
              searchable: true,
              options: []
            }
          });

          expect(
            wrapper
              .find(".vue3-treeselect__input-container .vue3-treeselect__input")
              .exists()
          ).toBe(true);
        });

        it("should auto resize when length of input value changes", () => {
          // This is currently impossible since both PhantomJS and Headless Chrome
          // always return 0 for `clientWidth`, `offsetWidth` and etc.
        });
      });

      describe("when multiple=false", () => {
        it("should show input", () => {
          const wrapper = mount(Treeselect, {
            props: {
              multiple: false,
              searchable: true,
              options: []
            }
          });

          expect(
            wrapper
              .find(".vue3-treeselect__input-container .vue3-treeselect__input")
              .exists()
          ).toBe(true);
        });
      });

      it("entering search query", async () => {
        const wrapper = mount(Treeselect, {
          props: {
            searchable: true,
            options: []
          }
        });
        const { vm } = wrapper;

        expect(vm.localSearch.active).toBe(false);
        expect(vm.trigger.searchQuery).toBe("");

        await typeSearchText(wrapper, "$SEARCH_QUERY$");
        expect(vm.localSearch.active).toBe(true);
        expect(vm.trigger.searchQuery).toBe("$SEARCH_QUERY$");

        await typeSearchText(wrapper, "");
        expect(vm.localSearch.active).toBe(false);
        expect(vm.trigger.searchQuery).toBe("");
      });

      it("filtering", async () => {
        const wrapper = mount(Treeselect, {
          props: {
            alwaysOpen: true,
            multiple: true,
            searchable: true,
            options: [
              {
                id: "a",
                label: "a",
                children: [
                  {
                    id: "aa",
                    label: "aa"
                  },
                  {
                    id: "ab",
                    label: "ab"
                  }
                ]
              },
              {
                id: "b",
                label: "b"
              }
            ]
          }
        });
        const { vm } = wrapper;

        await nextTick();

        expect(vm.localSearch.noResults).toBe(true);

        await typeSearchText(wrapper, "b");
        expect(vm.localSearch.noResults).toBe(false);

        const expectedMatchedNodeIds = ["ab", "b"];
        const options = wrapper.findAllComponents(Option);
        expect(options.length).toBe(4);
        options.forEach((option) => {
          const { node } = option.vm;
          expect(node.isMatched).toBe(expectedMatchedNodeIds.includes(node.id));
        });
      });
    });

    describe("when searchable=false", () => {
      describe("when multiple=true", () => {
        it("should not show input but a placeholder", () => {
          const wrapper = mount(Treeselect, {
            props: {
              multiple: true,
              searchable: false,
              options: []
            }
          });

          expect(
            wrapper.find(".vue3-treeselect__input-container").exists()
          ).toBe(true);
          expect(
            wrapper.find(".vue3-treeselect__input-container").element.innerHTML
          ).toBe("");
        });
      });

      describe("when multiple=false", () => {
        it("should not show input but a placeholder", () => {
          const wrapper = mount(Treeselect, {
            props: {
              multiple: false,
              searchable: false,
              options: []
            }
          });

          expect(
            wrapper.find(".vue3-treeselect__input-container").exists()
          ).toBe(true);
          expect(
            wrapper.find(".vue3-treeselect__input-container").element.innerHTML
          ).toBe("");
        });
      });
    });
  });

  it("showCount", () => {
    // TODO
  });

  describe("showCountOnSearch", () => {
    let wrapper;

    beforeEach(async () => {
      wrapper = mount(Treeselect, {
        props: {
          alwaysOpen: true,
          options: [
            {
              id: "a",
              label: "a",
              children: [
                {
                  id: "aa",
                  label: "aa"
                },
                {
                  id: "ab",
                  label: "ab"
                }
              ]
            },
            {
              id: "b",
              label: "b",
              children: [
                {
                  id: "ba",
                  label: "ba"
                },
                {
                  id: "bb",
                  label: "bb"
                }
              ]
            }
          ],
          showCount: true
        }
      });

      await nextTick();
    });

    it("when showCountOnSearch=false", async () => {
      await wrapper.setProps({ showCountOnSearch: false });

      await typeSearchText(wrapper, "a");
      expect(wrapper.find(".vue3-treeselect__count").exists()).toBe(false);
    });

    it("when showCountOnSearch=true", async () => {
      await wrapper.setProps({ showCountOnSearch: true });

      await typeSearchText(wrapper, "a");
      expect(wrapper.find(".vue3-treeselect__count").exists()).toBe(true);
    });

    it("when showCountOnSearch not specified", async () => {
      await typeSearchText(wrapper, "a");
      expect(wrapper.find(".vue3-treeselect__count").exists()).toBe(true);
    });

    it("should refresh count number after search changes", async () => {
      await wrapper.setProps({ showCountOnSearch: true });

      await typeSearchText(wrapper, "a");
      expect(
        findOptionByNodeId(wrapper, "a").find(".vue3-treeselect__count").text()
      ).toEqual("(2)");
      expect(
        findOptionByNodeId(wrapper, "b").find(".vue3-treeselect__count").text()
      ).toEqual("(1)");

      await typeSearchText(wrapper, "b");
      expect(
        findOptionByNodeId(wrapper, "a").find(".vue3-treeselect__count").text()
      ).toEqual("(1)");
      expect(
        findOptionByNodeId(wrapper, "b").find(".vue3-treeselect__count").text()
      ).toEqual("(2)");
    });
  });

  describe("sortValueBy", () => {
    let wrapper, vm;

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        props: {
          options: generateOptions(4),
          multiple: true,
          flat: true
        }
      });
      vm = wrapper.vm;
    });

    it('when sortValueBy="ORDER_SELECTED"', async () => {
      await wrapper.setProps({ sortValueBy: "ORDER_SELECTED" });

      vm.select(vm.forest.nodeMap.bb);
      expect(vm.internalValue).toEqual(["bb"]);
      vm.select(vm.forest.nodeMap.a);
      expect(vm.internalValue).toEqual(["bb", "a"]);
      vm.select(vm.forest.nodeMap.dddd);
      expect(vm.internalValue).toEqual(["bb", "a", "dddd"]);
      vm.select(vm.forest.nodeMap.ccc);
      expect(vm.internalValue).toEqual(["bb", "a", "dddd", "ccc"]);
    });

    it('when sortValueBy="LEVEL"', async () => {
      await wrapper.setProps({ sortValueBy: "LEVEL" });

      vm.select(vm.forest.nodeMap.bb);
      expect(vm.internalValue).toEqual(["bb"]);
      vm.select(vm.forest.nodeMap.aaa);
      expect(vm.internalValue).toEqual(["bb", "aaa"]);
      vm.select(vm.forest.nodeMap.dddd);
      expect(vm.internalValue).toEqual(["bb", "aaa", "dddd"]);
      vm.select(vm.forest.nodeMap.c);
      expect(vm.internalValue).toEqual(["c", "bb", "aaa", "dddd"]);
      vm.select(vm.forest.nodeMap.aa);
      expect(vm.internalValue).toEqual(["c", "aa", "bb", "aaa", "dddd"]);
    });

    it('when sortValueBy="INDEX"', async () => {
      await wrapper.setProps({ sortValueBy: "INDEX" });

      vm.select(vm.forest.nodeMap.d);
      expect(vm.internalValue).toEqual(["d"]);
      vm.select(vm.forest.nodeMap.bbb);
      expect(vm.internalValue).toEqual(["bbb", "d"]);
      vm.select(vm.forest.nodeMap.aaaa);
      expect(vm.internalValue).toEqual(["aaaa", "bbb", "d"]);
      vm.select(vm.forest.nodeMap.cc);
      expect(vm.internalValue).toEqual(["aaaa", "bbb", "cc", "d"]);
    });

    it("should re-sort value after prop value changes", async () => {
      await wrapper.setProps({
        sortValueBy: "ORDER_SELECTED",
        modelValue: ["bb", "c", "aaa"]
      });

      await wrapper.setProps({ sortValueBy: "INDEX" });
      expect(vm.internalValue).toEqual(["aaa", "bb", "c"]);
      await wrapper.setProps({ sortValueBy: "LEVEL" });
      expect(vm.internalValue).toEqual(["c", "bb", "aaa"]);
      await wrapper.setProps({ sortValueBy: "ORDER_SELECTED" });
      expect(vm.internalValue).toEqual(["bb", "c", "aaa"]);
    });

    it("more cases", async () => {
      await wrapper.setProps({
        sortValueBy: "INDEX",
        modelValue: ["aa", "aaa"]
      });
      expect(vm.internalValue).toEqual(["aa", "aaa"]);

      await wrapper.setProps({
        sortValueBy: "INDEX",
        modelValue: ["aaa", "aa"]
      });
      expect(vm.internalValue).toEqual(["aa", "aaa"]);

      await wrapper.setProps({
        sortValueBy: "INDEX",
        modelValue: ["aa", "bb"]
      });
      expect(vm.internalValue).toEqual(["aa", "bb"]);

      await wrapper.setProps({
        sortValueBy: "INDEX",
        modelValue: ["bb", "aa"]
      });
      expect(vm.internalValue).toEqual(["aa", "bb"]);
    });
  });

  describe("tabIndex", () => {
    it("when disabled=false & searchable=true", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [],
          searchable: true,
          disabled: false
        }
      });
      const inputContainer = findInputContainer(wrapper);
      const input = findInput(wrapper);

      expect(inputContainer.element.tabIndex).toBe(-1);
      expect(input.element.tabIndex).toBe(0);
    });

    it("when disabled=false & searchable=false", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [],
          searchable: false,
          disabled: false
        }
      });
      const inputContainer = findInputContainer(wrapper);

      expect(inputContainer.element.tabIndex).toBe(0);
    });

    it("when disabled=true", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [],
          disabled: true
        }
      });
      const inputContainer = findInputContainer(wrapper);

      expect(inputContainer.element.tabIndex).toBe(-1);
    });

    it("customized value", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [],
          searchable: true,
          disabled: false,
          tabIndex: 1
        }
      });
      const input = findInput(wrapper);

      expect(input.element.tabIndex).toBe(1);
    });
  });

  describe("valueConsistsOf", () => {
    let wrapper, vm;

    describe("get internalValue", () => {
      beforeEach(() => {
        wrapper = mount(Treeselect, {
          props: {
            multiple: true,
            options: [
              {
                id: "a",
                label: "a",
                children: [
                  {
                    id: "aa",
                    label: "aa",
                    children: [
                      {
                        id: "aaa",
                        label: "aaa"
                      },
                      {
                        id: "aab",
                        label: "aab"
                      }
                    ]
                  },
                  {
                    id: "ab",
                    label: "ab",
                    children: [
                      {
                        id: "aba",
                        label: "aba"
                      },
                      {
                        id: "abb",
                        label: "abb"
                      }
                    ]
                  },
                  {
                    id: "ac",
                    label: "ac"
                  }
                ]
              },
              {
                id: "b",
                label: "b",
                children: []
              }
            ],
            modelValue: ["aa"]
          }
        });
        vm = wrapper.vm;
      });

      it("when valueConsistsOf=ALL", async () => {
        await wrapper.setProps({ valueConsistsOf: ALL });

        expect(vm.internalValue).toEqual(["aa", "aaa", "aab"]);
        vm.select(vm.forest.nodeMap.ab);
        expect(vm.internalValue).toEqual([
          "aa",
          "aaa",
          "aab",
          "ab",
          "aba",
          "abb"
        ]);
        vm.select(vm.forest.nodeMap.b);
        expect(vm.internalValue).toEqual([
          "aa",
          "aaa",
          "aab",
          "ab",
          "aba",
          "abb",
          "b"
        ]);
        vm.select(vm.forest.nodeMap.ac);
        expect(vm.internalValue).toEqual([
          "aa",
          "aaa",
          "aab",
          "ab",
          "aba",
          "abb",
          "b",
          "ac",
          "a"
        ]);
      });

      it("when valueConsistsOf=BRANCH_PRIORITY", async () => {
        await wrapper.setProps({ valueConsistsOf: BRANCH_PRIORITY });

        expect(vm.internalValue).toEqual(["aa"]);
        vm.select(vm.forest.nodeMap.ab);
        expect(vm.internalValue).toEqual(["aa", "ab"]);
        vm.select(vm.forest.nodeMap.b);
        expect(vm.internalValue).toEqual(["aa", "ab", "b"]);
        vm.select(vm.forest.nodeMap.ac);
        expect(vm.internalValue).toEqual(["b", "a"]);
      });

      it("when valueConsistsOf=LEAF_PRIORITY", async () => {
        await wrapper.setProps({ valueConsistsOf: LEAF_PRIORITY });

        expect(vm.internalValue).toEqual(["aaa", "aab"]);
        vm.select(vm.forest.nodeMap.ab);
        expect(vm.internalValue).toEqual(["aaa", "aab", "aba", "abb"]);
        vm.select(vm.forest.nodeMap.b);
        expect(vm.internalValue).toEqual(["aaa", "aab", "aba", "abb", "b"]);
        vm.select(vm.forest.nodeMap.ac);
        expect(vm.internalValue).toEqual([
          "aaa",
          "aab",
          "aba",
          "abb",
          "b",
          "ac"
        ]);
      });

      it("when valueConsistsOf=ALL_WITH_INDETERMINATE", async () => {
        await wrapper.setProps({ valueConsistsOf: ALL_WITH_INDETERMINATE });

        expect(vm.internalValue).toEqual(["aa", "aaa", "aab", "a"]);
        vm.select(vm.forest.nodeMap.ab);
        expect(vm.internalValue).toEqual([
          "aa",
          "aaa",
          "aab",
          "ab",
          "aba",
          "abb",
          "a"
        ]);
        vm.select(vm.forest.nodeMap.b);
        expect(vm.internalValue).toEqual([
          "aa",
          "aaa",
          "aab",
          "ab",
          "aba",
          "abb",
          "b",
          "a"
        ]);
        vm.select(vm.forest.nodeMap.ac);
        expect(vm.internalValue).toEqual([
          "aa",
          "aaa",
          "aab",
          "ab",
          "aba",
          "abb",
          "b",
          "ac",
          "a"
        ]);
      });
    });

    describe("set value", () => {
      beforeEach(() => {
        wrapper = mount(Treeselect, {
          props: {
            options: [
              {
                id: "a",
                label: "a",
                children: [
                  {
                    id: "aa",
                    label: "aa",
                    children: [
                      {
                        id: "aaa",
                        label: "aaa"
                      },
                      {
                        id: "aab",
                        label: "aab"
                      }
                    ]
                  },
                  {
                    id: "ab",
                    label: "ab"
                  }
                ]
              },
              {
                id: "b",
                label: "b"
              },
              {
                id: "c",
                label: "c",
                children: []
              }
            ]
          }
        });
        vm = wrapper.vm;
      });

      afterEach(() => {
        wrapper.unmount();
      });

      describe("when multiple=false", () => {
        const types = [
          ALL,
          BRANCH_PRIORITY,
          LEAF_PRIORITY,
          ALL_WITH_INDETERMINATE
        ];
        for (let i = 0; i < types.length; ++i) {
          const type = types[i];
          it(`when valueConsistsOf=${type}`, async () => {
            await wrapper.setProps({ multiple: false });
            const values = ["aaa", "aa", "ab", "a", "b", "c"];
            for (let i = 0; i < values.length; ++i) {
              await wrapper.setProps({ modelValue: values[i] });
              expect(vm.internalValue).toEqual([values[i]]);
              expect(vm.forest.selectedNodeIds).toEqual([values[i]]);
            }
          });
        }
      });

      describe("when multiple=true", () => {
        beforeEach(async () => {
          await wrapper.setProps({ multiple: true });
        });

        it("when valueConsistsOf=ALL", async () => {
          await wrapper.setProps({ valueConsistsOf: ALL });

          await wrapper.setProps({ modelValue: [] });
          expect(vm.internalValue).toEqual([]);
          expect(vm.forest.selectedNodeIds).toEqual([]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: UNCHECKED,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["ab"] });
          expect(vm.internalValue).toEqual(["ab"]);
          expect(vm.forest.selectedNodeIds).toEqual(["ab"]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: CHECKED,
            b: UNCHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["aa", "aaa", "aab"] });
          expect(vm.internalValue).toEqual(["aa", "aaa", "aab"]);
          expect(vm.forest.selectedNodeIds).toEqual(["aa", "aaa", "aab"]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: CHECKED,
            aaa: CHECKED,
            aab: CHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({
            modelValue: ["b", "aa", "aaa", "aab", "a", "ab"]
          });
          expect(vm.internalValue).toEqual([
            "b",
            "aa",
            "aaa",
            "aab",
            "a",
            "ab"
          ]);
          expect(vm.forest.selectedNodeIds).toEqual([
            "b",
            "aa",
            "aaa",
            "aab",
            "a",
            "ab"
          ]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: CHECKED,
            aa: CHECKED,
            aaa: CHECKED,
            aab: CHECKED,
            ab: CHECKED,
            b: CHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["c"] });
          expect(vm.internalValue).toEqual(["c"]);
          expect(vm.forest.selectedNodeIds).toEqual(["c"]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: UNCHECKED,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: CHECKED
          });
        });

        it("when valueConsistsOf=BRANCH_PRIORITY", async () => {
          await wrapper.setProps({ valueConsistsOf: BRANCH_PRIORITY });

          await wrapper.setProps({ modelValue: [] });
          expect(vm.internalValue).toEqual([]);
          expect(vm.forest.selectedNodeIds).toEqual([]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: UNCHECKED,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["ab"] });
          expect(vm.internalValue).toEqual(["ab"]);
          expect(vm.forest.selectedNodeIds).toEqual(["ab"]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: CHECKED,
            b: UNCHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["aaa"] });
          expect(vm.internalValue).toEqual(["aaa"]);
          expect(vm.forest.selectedNodeIds).toEqual(["aaa"]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: INDETERMINATE,
            aaa: CHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["aa"] });
          expect(vm.internalValue).toEqual(["aa"]);
          expect(vm.forest.selectedNodeIds).toEqual(["aa", "aaa", "aab"]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: CHECKED,
            aaa: CHECKED,
            aab: CHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["a"] });
          expect(vm.internalValue).toEqual(["a"]);
          expect(vm.forest.selectedNodeIds).toEqual([
            "a",
            "aa",
            "ab",
            "aaa",
            "aab"
          ]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: CHECKED,
            aa: CHECKED,
            aaa: CHECKED,
            aab: CHECKED,
            ab: CHECKED,
            b: UNCHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["aaa", "ab", "b"] });
          expect(vm.internalValue).toEqual(["aaa", "ab", "b"]);
          expect(vm.forest.selectedNodeIds).toEqual(["aaa", "ab", "b"]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: INDETERMINATE,
            aaa: CHECKED,
            aab: UNCHECKED,
            ab: CHECKED,
            b: CHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["b", "aa"] });
          expect(vm.internalValue).toEqual(["b", "aa"]);
          expect(vm.forest.selectedNodeIds).toEqual(["b", "aa", "aaa", "aab"]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: CHECKED,
            aaa: CHECKED,
            aab: CHECKED,
            ab: UNCHECKED,
            b: CHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["b", "aab"] });
          expect(vm.internalValue).toEqual(["b", "aab"]);
          expect(vm.forest.selectedNodeIds).toEqual(["b", "aab"]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: INDETERMINATE,
            aaa: UNCHECKED,
            aab: CHECKED,
            ab: UNCHECKED,
            b: CHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["c"] });
          expect(vm.internalValue).toEqual(["c"]);
          expect(vm.forest.selectedNodeIds).toEqual(["c"]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: UNCHECKED,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: CHECKED
          });
        });

        it("when valueConsistsOf=LEAF_PRIORITY", async () => {
          await wrapper.setProps({ valueConsistsOf: LEAF_PRIORITY });

          await wrapper.setProps({ modelValue: [] });
          expect(vm.internalValue).toEqual([]);
          expect(vm.forest.selectedNodeIds).toEqual([]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: UNCHECKED,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["ab"] });
          expect(vm.internalValue).toEqual(["ab"]);
          expect(vm.forest.selectedNodeIds).toEqual(["ab"]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: CHECKED,
            b: UNCHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["aab"] });
          expect(vm.internalValue).toEqual(["aab"]);
          expect(vm.forest.selectedNodeIds).toEqual(["aab"]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: INDETERMINATE,
            aaa: UNCHECKED,
            aab: CHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["aab", "aaa"] });
          expect(vm.internalValue).toEqual(["aab", "aaa"]);
          expect(vm.forest.selectedNodeIds).toEqual(["aab", "aaa", "aa"]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: CHECKED,
            aaa: CHECKED,
            aab: CHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["aaa", "ab", "aab"] });
          expect(vm.internalValue).toEqual(["aaa", "ab", "aab"]);
          expect(vm.forest.selectedNodeIds).toEqual([
            "aaa",
            "ab",
            "aab",
            "aa",
            "a"
          ]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: CHECKED,
            aa: CHECKED,
            aaa: CHECKED,
            aab: CHECKED,
            ab: CHECKED,
            b: UNCHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["c"] });
          expect(vm.internalValue).toEqual(["c"]);
          expect(vm.forest.selectedNodeIds).toEqual(["c"]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: UNCHECKED,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: CHECKED
          });
        });

        it("when valueConsistsOf=ALL_WITH_INDETERMINATE", async () => {
          await wrapper.setProps({ valueConsistsOf: ALL_WITH_INDETERMINATE });

          await wrapper.setProps({ modelValue: [] });
          expect(vm.internalValue).toEqual([]);
          expect(vm.forest.selectedNodeIds).toEqual([]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: UNCHECKED,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["ab"] });
          expect(vm.internalValue).toEqual(["ab", "a"]);
          expect(vm.forest.selectedNodeIds).toEqual(["ab"]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: CHECKED,
            b: UNCHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["aa", "aaa", "a"] });
          expect(vm.internalValue).toEqual(["aaa", "aa", "a"]);
          expect(vm.forest.selectedNodeIds).toEqual(["aaa"]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: INDETERMINATE,
            aaa: CHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["a", "aa", "aaa", "aab"] });
          expect(vm.internalValue).toEqual(["aaa", "aab", "aa", "a"]);
          expect(vm.forest.selectedNodeIds).toEqual(["aaa", "aab", "aa"]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: INDETERMINATE,
            aa: CHECKED,
            aaa: CHECKED,
            aab: CHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: UNCHECKED
          });

          await wrapper.setProps({ modelValue: ["c"] });
          expect(vm.internalValue).toEqual(["c"]);
          expect(vm.forest.selectedNodeIds).toEqual(["c"]);
          expect(vm.forest.checkedStateMap).toEqual({
            a: UNCHECKED,
            aa: UNCHECKED,
            aaa: UNCHECKED,
            aab: UNCHECKED,
            ab: UNCHECKED,
            b: UNCHECKED,
            c: CHECKED
          });
        });
      });
    });
  });

  describe("valueFormat", () => {
    describe("when valueFormat=id", () => {
      it("single-select", async () => {
        const wrapper = mount({
          components: { Treeselect },
          data() {
            return {
              value: "a",
              options: [
                {
                  id: "a",
                  label: "a"
                },
                {
                  id: "b",
                  label: "b"
                }
              ]
            };
          },
          template: `
            <div>
              <treeselect
                v-model="value"
                :options="options"
                value-format="id"
              />
            </div>
          `
        });
        const comp = wrapper.findComponent(Treeselect).vm;

        expect(comp.forest.selectedNodeIds).toEqual(["a"]);

        comp.select(comp.forest.nodeMap.b);
        await nextTick();
        expect(comp.forest.selectedNodeIds).toEqual(["b"]);
        expect(comp.modelValue).toEqual("b");
      });

      it("multi-select", async () => {
        const wrapper = mount({
          components: { Treeselect },
          data() {
            return {
              value: ["a"],
              options: [
                {
                  id: "a",
                  label: "a"
                },
                {
                  id: "b",
                  label: "b"
                }
              ]
            };
          },
          template: `
            <div>
              <treeselect
                v-model="value"
                :options="options"
                :multiple="true"
                value-format="id"
              />
            </div>
          `
        });
        const comp = wrapper.findComponent(Treeselect).vm;

        expect(comp.forest.selectedNodeIds).toEqual(["a"]);

        comp.select(comp.forest.nodeMap.b);
        await nextTick();
        expect(comp.forest.selectedNodeIds).toEqual(["a", "b"]);
        expect(comp.modelValue).toEqual(["a", "b"]);
      });
    });

    describe("when valueFormat=object", () => {
      it("single-select", async () => {
        const wrapper = mount({
          components: { Treeselect },
          data() {
            return {
              value: {
                id: "a",
                label: "a"
              },
              options: [
                {
                  id: "a",
                  label: "a"
                },
                {
                  id: "b",
                  label: "b"
                }
              ]
            };
          },
          template: `
            <div>
              <treeselect
                v-model="value"
                :options="options"
                value-format="object"
              />
            </div>
          `
        });
        const comp = wrapper.findComponent(Treeselect).vm;

        expect(comp.forest.selectedNodeIds).toEqual(["a"]);

        comp.select(comp.forest.nodeMap.b);
        await nextTick();
        expect(comp.forest.selectedNodeIds).toEqual(["b"]);
        expect(comp.modelValue).toEqual({
          id: "b",
          label: "b"
        });
      });

      it("multi-select", async () => {
        const wrapper = mount({
          components: { Treeselect },
          data() {
            return {
              value: [
                {
                  id: "a",
                  label: "a"
                }
              ],
              options: [
                {
                  id: "a",
                  label: "a"
                },
                {
                  id: "b",
                  label: "b"
                }
              ]
            };
          },
          template: `
            <div>
              <treeselect
                v-model="value"
                :options="options"
                :multiple="true"
                value-format="object"
              />
            </div>
          `
        });
        const comp = wrapper.findComponent(Treeselect).vm;

        expect(comp.forest.selectedNodeIds).toEqual(["a"]);

        comp.select(comp.forest.nodeMap.b);
        await nextTick();
        expect(comp.forest.selectedNodeIds).toEqual(["a", "b"]);
        expect(comp.modelValue).toEqual([
          {
            id: "a",
            label: "a"
          },
          {
            id: "b",
            label: "b"
          }
        ]);
      });

      it("should return raw node object", async () => {
        const wrapper = mount({
          components: { Treeselect },
          data() {
            return {
              value: {
                id: "a",
                label: "a"
              },
              options: [
                {
                  id: "a",
                  label: "a",
                  _extra: "a"
                },
                {
                  id: "b",
                  label: "b",
                  _extra: "b"
                }
              ]
            };
          },
          template: `
            <div>
              <treeselect
                v-model="value"
                :options="options"
                value-format="object"
              />
            </div>
          `
        });
        const comp = wrapper.findComponent(Treeselect).vm;

        expect(comp.forest.selectedNodeIds).toEqual(["a"]);

        comp.select(comp.forest.nodeMap.b);
        await nextTick();
        expect(comp.modelValue).toEqual({
          id: "b",
          label: "b",
          _extra: "b"
        });
      });
    });
  });

  it("zIndex", async () => {
    const wrapper = mount(Treeselect, {
      sync: false,
      props: {
        zIndex: 1,
        options: []
      },
      attachTo: document.body
    });
    const { vm } = wrapper;

    vm.openMenu();
    await nextTick();

    const menuContainer = findMenuContainer(wrapper);

    expect(menuContainer.element.style.zIndex).toBe("1");

    await wrapper.setProps({ zIndex: 2 });

    expect(menuContainer.element.style.zIndex).toBe("2");
  });
});
