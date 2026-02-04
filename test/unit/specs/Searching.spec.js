import { nextTick } from "vue";
import { mount } from "@vue/test-utils";
import sleep from "yaku/lib/sleep";
import {
  typeSearchText,
  findMenu,
  findVisibleOptions,
  findOptionByNodeId,
  findOptionArrowByNodeId,
  leftClick,
  findCheckboxByNodeId
} from "./shared";
import Treeselect from "@/components/Treeselect.vue";
import { INPUT_DEBOUNCE_DELAY } from "@/constants";

describe("Searching", () => {
  describe("local search", () => {
    it("exactly matching", async () => {
      const wrapper = mount(Treeselect, {
        props: {
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

      await typeSearchText(wrapper, "a");
      expect(vm.forest.nodeMap.a.isMatched).toBe(true);
      expect(vm.forest.nodeMap.a.isExpandedOnSearch).toBe(true);
      expect(vm.forest.nodeMap.aa.isMatched).toBe(true);
      expect(vm.forest.nodeMap.ab.isMatched).toBe(true);
      expect(vm.forest.nodeMap.b.isMatched).toBe(false);

      await typeSearchText(wrapper, "b");
      expect(vm.forest.nodeMap.a.isMatched).toBe(false);
      expect(vm.forest.nodeMap.a.isExpandedOnSearch).toBe(true);
      expect(vm.forest.nodeMap.aa.isMatched).toBe(false);
      expect(vm.forest.nodeMap.ab.isMatched).toBe(true);
      expect(vm.forest.nodeMap.b.isMatched).toBe(true);
    });

    it("should be case insensitive", async () => {
      const wrapper = mount(Treeselect, {
        props: {
          searchable: true,
          options: [
            {
              id: "a",
              label: "James Blunt"
            },
            {
              id: "b",
              label: "Cheer Chen"
            }
          ]
        }
      });
      const { vm } = wrapper;

      await typeSearchText(wrapper, "james");
      expect(vm.forest.nodeMap.a.isMatched).toBe(true);
      expect(vm.forest.nodeMap.b.isMatched).toBe(false);

      await typeSearchText(wrapper, "chen");
      expect(vm.forest.nodeMap.a.isMatched).toBe(false);
      expect(vm.forest.nodeMap.b.isMatched).toBe(true);
    });

    it("toggle expanded", async () => {
      function expectArrowToBeRotatedOrNot(expected) {
        const optionArrow = findOptionArrowByNodeId(wrapper, "a");
        const isRotated = optionArrow
          .classes()
          .includes("vue3-treeselect__option-arrow--rotated");
        expect(isRotated).toBe(expected);
      }

      const wrapper = mount(Treeselect, {
        props: {
          searchable: true,
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
          ]
        }
      });
      const { vm } = wrapper;

      vm.openMenu();
      await nextTick();

      // not rotated by default
      expectArrowToBeRotatedOrNot(false);

      // enter keyword and search
      await typeSearchText(wrapper, "a");
      expectArrowToBeRotatedOrNot(true);

      // clear keyword and exit search mode
      await typeSearchText(wrapper, "");
      // should recover state
      expectArrowToBeRotatedOrNot(false);

      // manually toggle
      vm.toggleExpanded(vm.forest.nodeMap.a);
      await nextTick();
      expectArrowToBeRotatedOrNot(true);

      // search again
      await typeSearchText(wrapper, "a");
      expectArrowToBeRotatedOrNot(true);

      // manually toggle
      vm.toggleExpanded(vm.forest.nodeMap.a);
      await nextTick();
      expectArrowToBeRotatedOrNot(false);

      // exit search mode again
      await typeSearchText(wrapper, "");
      // should recover state
      expectArrowToBeRotatedOrNot(true);

      // search again
      await typeSearchText(wrapper, "a");
      expectArrowToBeRotatedOrNot(true);
    });

    describe("matching branch nodes", () => {
      const wrapper = mount(Treeselect, {
        props: {
          searchable: true,
          options: [
            {
              id: "branch",
              label: "branch",
              children: [
                {
                  id: "aa",
                  label: "aa"
                },
                {
                  id: "ab",
                  label: "ab"
                },
                {
                  id: "ac",
                  label: "ac",
                  children: [
                    {
                      id: "aca",
                      label: "aca"
                    }
                  ]
                }
              ]
            }
          ]
        }
      });
      const { vm } = wrapper;

      it("preparation", async () => {
        vm.openMenu();
        await nextTick();
        expect(vm.menu.isOpen).toBe(true);
      });

      it("if no children are matched, the branch node should be collapsed", async () => {
        await typeSearchText(wrapper, "branch");
        expect(vm.forest.nodeMap.branch.isMatched).toBe(true);
        expect(vm.forest.nodeMap.branch.isExpandedOnSearch).toBe(false);
        expect(vm.forest.nodeMap.aa.isMatched).toBe(false);
        expect(vm.forest.nodeMap.ab.isMatched).toBe(false);
        expect(vm.forest.nodeMap.ac.isMatched).toBe(false);
        expect(vm.forest.nodeMap.aca.isMatched).toBe(false);
      });

      it("expand a branch node should show all its children", async () => {
        expect(vm.menu.isOpen).toBe(true);
        vm.toggleExpanded(vm.forest.nodeMap.branch);
        expect(vm.forest.nodeMap.branch.isExpandedOnSearch).toBe(true);
        await nextTick();
        expect(
          wrapper.find('.vue3-treeselect__option[data-id="aa"]').exists()
        ).toBe(true);
        expect(
          wrapper.find('.vue3-treeselect__option[data-id="ab"]').exists()
        ).toBe(true);
        expect(
          wrapper.find('.vue3-treeselect__option[data-id="ac"]').exists()
        ).toBe(true);
        expect(vm.forest.nodeMap.ac.isExpandedOnSearch).toBe(false);
        vm.toggleExpanded(vm.forest.nodeMap.ac);
        await nextTick();
        expect(
          wrapper.find('.vue3-treeselect__option[data-id="aca"]').exists()
        ).toBe(true);
      });
    });

    it("should highlight first option after search query changes", async () => {
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
                  label: "bb"
                }
              ]
            }
          ]
        }
      });
      const { vm } = wrapper;

      vm.openMenu();
      await nextTick();

      expect(vm.menu.current).toBe("a");

      await typeSearchText(wrapper, "b");
      expect(vm.menu.current).toBe("b");

      await typeSearchText(wrapper, "a");
      expect(vm.menu.current).toBe("a");

      await typeSearchText(wrapper, "bb");
      expect(vm.menu.current).toBe("b");

      await typeSearchText(wrapper, "");
      expect(vm.menu.current).toBe("a");
    });
  });

  describe("fuzzy search", () => {
    it("fuzzy matching", () => {
      // TODO
    });

    it("should be case insensitive", async () => {
      // TODO
    });
  });

  describe("nested search", () => {
    it("when searchNested=false", async () => {
      const wrapper = mount(Treeselect, {
        props: {
          searchable: true,
          searchNested: false,
          options: [
            {
              id: "a",
              label: "a",
              children: [
                {
                  id: "aa",
                  label: "x"
                },
                {
                  id: "ab",
                  label: "a x"
                }
              ]
            }
          ]
        }
      });
      const { vm } = wrapper;

      await typeSearchText(wrapper, "a x");
      expect(vm.forest.nodeMap.aa.isMatched).toBe(false);
      expect(vm.forest.nodeMap.ab.isMatched).toBe(true);
    });

    describe("when searchNested=true", () => {
      let wrapper, vm;

      beforeEach(() => {
        wrapper = mount(Treeselect, {
          props: {
            searchable: true,
            searchNested: true,
            disableFuzzyMatching: false,
            options: [
              {
                id: "a",
                label: "abc",
                children: [
                  {
                    id: "aa",
                    label: "xyz"
                  }
                ]
              }
            ]
          }
        });
        vm = wrapper.vm;
      });

      it("should also search ancestor nodes", async () => {
        await typeSearchText(wrapper, "ab yz");
        expect(vm.forest.nodeMap.aa.isMatched).toBe(true);
      });

      it("should disable fuzzy search", async () => {
        await typeSearchText(wrapper, "ac yz");
        expect(vm.forest.nodeMap.aa.isMatched).toBe(false);
      });

      it("when search query not contains whitespaces, search in a normal manner", async () => {
        await typeSearchText(wrapper, "xz"); // fuzzy search
        expect(vm.forest.nodeMap.aa.isMatched).toBe(true);
      });

      it("should be case insensitive", async () => {
        // TODO
      });
    });
  });

  describe("match more properties", () => {
    async function typeAndAssert(
      wrapper,
      searchText,
      idListOfNodesThatShouldBeMatched
    ) {
      await typeSearchText(wrapper, searchText);
      const { nodeMap } = wrapper.vm.forest;
      expect(nodeMap).toEqual(
        Object.keys(nodeMap).reduce(
          (prev, id) => ({
            ...prev,
            [id]: expect.objectContaining({
              isMatched: idListOfNodesThatShouldBeMatched.includes(id)
            })
          }),
          {}
        )
      );
    }

    it("match more properties than only `label`", async () => {
      const wrapper = mount(Treeselect, {
        props: {
          matchKeys: ["label", "value"],
          searchable: true,
          options: [
            {
              id: "a",
              label: "a",
              value: "1",
              extra: "x"
            },
            {
              id: "b",
              label: "b",
              value: "2",
              extra: "y"
            }
          ]
        }
      });

      await typeAndAssert(wrapper, "a", ["a"]);
      await typeAndAssert(wrapper, "b", ["b"]);
      await typeAndAssert(wrapper, "1", ["a"]);
      await typeAndAssert(wrapper, "2", ["b"]);
      await typeAndAssert(wrapper, "x", []);
      await typeAndAssert(wrapper, "y", []);
    });

    it("should keep parent node visible when child node is selected during search", async () => {
      const wrapper = mount(Treeselect, {
        props: {
          searchable: true,
          matchKeys: ["label", "id"],
          multiple: true,
          options: [
            {
              id: "fruits",
              label: "Fruits",
              children: [
                { id: "apple", label: "Apple" },
                { id: "banana", label: "Banana" }
              ]
            }
          ]
        }
      });
      const { vm } = wrapper;

      vm.openMenu();
      await nextTick();

      // Initially only parent is visible (branch node collapsed by default)
      expect(findVisibleOptions(wrapper).length).toBe(1);

      // Search for "apple" - should show parent and matched child
      await typeSearchText(wrapper, "apple");
      await sleep(50);
      await nextTick();

      // Check that search matched child and parent has matched descendants
      expect(vm.forest.nodeMap.apple.isMatched).toBe(true);
      expect(vm.forest.nodeMap.fruits.hasMatchedDescendants).toBe(true);
      expect(vm.forest.nodeMap.fruits.isExpandedOnSearch).toBe(true);

      const visibleOptions = findVisibleOptions(wrapper);
      expect(visibleOptions.length).toBe(2); // parent and matched child
      const visibleOptionIds = visibleOptions.map((o) => o.element.dataset.id);
      expect(visibleOptionIds).toContain("fruits");
      expect(visibleOptionIds).toContain("apple");

      // Select the child node
      await leftClick(findCheckboxByNodeId(wrapper, "apple"));
      await nextTick();

      // THIS IS THE BUG: parent node disappears after selection
      // Check the internal state after selection
      expect(vm.forest.nodeMap.apple.isMatched).toBe(true);
      expect(vm.forest.nodeMap.fruits.hasMatchedDescendants).toBe(true);
      expect(vm.forest.nodeMap.fruits.isExpandedOnSearch).toBe(true);

      const visibleOptionsAfter = findVisibleOptions(wrapper);
      expect(visibleOptionsAfter.length).toBe(2); // Should still show parent and child
      const visibleOptionIdsAfter = visibleOptionsAfter.map(
        (o) => o.element.dataset.id
      );
      expect(visibleOptionIdsAfter).toContain("fruits");
      expect(visibleOptionIdsAfter).toContain("apple");

      // The child should be selected
      expect(vm.forest.selectedNodeIds).toEqual(["apple"]);
    });

    it("should properly handle value of types other than string", async () => {
      const specialValues = [
        1,
        NaN,
        null,
        undefined,
        {},
        [],
        () => {
          /* empty */
        }
      ];
      const wrapper = mount(Treeselect, {
        props: {
          matchKeys: ["value"],
          searchable: true,
          options: specialValues.map((value, index) => ({
            id: String(index),
            label: String(index),
            value
          }))
        }
      });

      await typeAndAssert(wrapper, "1", ["0"]);
      await typeAndAssert(wrapper, "NaN", []);
      await typeAndAssert(wrapper, "null", []);
      await typeAndAssert(wrapper, "undefined", []);
      await typeAndAssert(wrapper, "object", []);
      await typeAndAssert(wrapper, "{}", []);
      await typeAndAssert(wrapper, "[]", []);
      await typeAndAssert(wrapper, "function", []);
    });

    it("with `normalizer` prop", async () => {
      const wrapper = mount(Treeselect, {
        props: {
          // here we leave the `matchKeys` prop to its default value `[ 'label' ]`
          searchable: true,
          normalizer: (node) => ({
            id: node.key,
            label: node.name
          }),
          options: [
            {
              key: "a",
              name: "a"
            },
            {
              key: "b",
              name: "b"
            }
          ]
        }
      });

      await typeAndAssert(wrapper, "a", ["a"]);
      await typeAndAssert(wrapper, "b", ["b"]);
    });

    it("should reinitialize options after the value of `matchKeys` prop changes", async () => {
      const wrapper = mount(Treeselect, {
        props: {
          searchable: true,
          matchKeys: ["label"],
          options: [
            {
              id: "A",
              label: "x"
            },
            {
              id: "b",
              label: "Y"
            }
          ]
        }
      });
      const { vm } = wrapper;

      expect(vm.forest.nodeMap).toEqual({
        A: expect.objectContaining({
          lowerCased: { label: "x" }
        }),
        b: expect.objectContaining({
          lowerCased: { label: "y" }
        })
      });

      await wrapper.setProps({ matchKeys: ["id"] });
      expect(vm.forest.nodeMap).toEqual({
        A: expect.objectContaining({
          lowerCased: { id: "a" }
        }),
        b: expect.objectContaining({
          lowerCased: { id: "b" }
        })
      });
    });
  });

  it("flatten search results", async () => {
    async function typeAndAssert(searchText, idListOfNodesThatShouldBeVisible) {
      await typeSearchText(wrapper, searchText);
      const visibleOptionWrappers = findVisibleOptions(wrapper);
      const visibleOptionIds = visibleOptionWrappers.map((optionWrapper) => {
        return optionWrapper.element.dataset.id;
      });
      visibleOptionWrappers.forEach((visibleOption) => {
        const isLevel0 = visibleOption.element.parentElement.classList.contains(
          "vue3-treeselect__indent-level-0"
        );
        expect(isLevel0).toBe(true);
      });
      expect(visibleOptionIds).toEqual(idListOfNodesThatShouldBeVisible);
    }

    const wrapper = mount(Treeselect, {
      props: {
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
        ],
        flattenSearchResults: true
      }
    });

    wrapper.vm.openMenu();
    await nextTick();
    await typeAndAssert("a", ["a", "aa", "ab"]);
    await typeAndAssert("ab", ["ab"]);
    await typeAndAssert("b", ["ab", "b"]);
  });

  describe("async search", () => {
    it("basic", async () => {
      let id = 0;
      const DELAY = 50;
      const wrapper = mount(Treeselect, {
        sync: false,
        props: {
          async: true,
          loadOptions({ action, searchQuery, callback }) {
            if (action === "ASYNC_SEARCH") {
              setTimeout(() => {
                callback(null, [
                  {
                    id: id++,
                    label: searchQuery
                  }
                ]);
              }, DELAY);
            } else if (action === "LOAD_ROOT_OPTIONS") {
              // For async search mode, there are no root options to load
              callback(null, []);
            }
          }
        }
      });
      const { vm } = wrapper;

      vm.openMenu();
      await nextTick();
      let menu = findMenu(wrapper);

      expect(menu.text().trim()).toBe("Type to search...");

      await typeSearchText(wrapper, "abcd");
      expect(menu.text().trim()).toBe("Loading...");
      await sleep(DELAY + 20);
      await nextTick();

      // Check if the remote search completed
      const entryA = vm.getRemoteSearchEntry();
      expect(entryA.isLoaded).toBe(true);
      expect(entryA.isLoading).toBe(false);
      // expect(menu.text().trim()).toBe("abcd");
      expect(vm.forest.normalizedOptions).toEqual([
        expect.objectContaining({
          id: 0,
          label: "abcd"
        })
      ]);

      // Wait for the menu to fully update before clearing search
      await sleep(50);
      await nextTick();

      await typeSearchText(wrapper, "");
      await sleep(100);
      await nextTick();

      // Refresh menu after renderKey change
      menu = findMenu(wrapper);

      expect(menu.text().trim()).toBe("Type to search...");

      // For bcde, check loading state BEFORE refreshing menu
      await typeSearchText(wrapper, "bcde");
      // Use the old menu wrapper to check for Loading (before refresh)
      const oldMenu = menu;
      expect(oldMenu.text().trim()).toBe("Loading...");
      await sleep(DELAY + 20);
      await nextTick();
      // Now refresh to get the updated menu
      menu = findMenu(wrapper);

      expect(menu.text().trim()).toBe("bcde");
      expect(vm.forest.normalizedOptions).toEqual([
        expect.objectContaining({
          id: 1,
          label: "bcde"
        })
      ]);
    });

    describe("error handling", () => {
      it("handle loading error & recover from it", async () => {
        const called = {};
        const wrapper = mount(Treeselect, {
          sync: false,
          props: {
            async: true,
            loadOptions({ action, searchQuery, callback }) {
              if (action === "ASYNC_SEARCH") {
                if (called[searchQuery]) {
                  callback(null, [
                    {
                      id: searchQuery,
                      label: searchQuery
                    }
                  ]);
                } else {
                  called[searchQuery] = true;
                  // Simulate error on first call, success on retry
                  setTimeout(() => {
                    callback(new Error("test error"));
                  }, 10);
                }
              } else if (action === "LOAD_ROOT_OPTIONS") {
                callback(null, []);
              }
            }
          }
        });
        const { vm } = wrapper;

        vm.openMenu();
        await nextTick();
        let menu = findMenu(wrapper);

        // This should trigger an error
        await typeSearchText(wrapper, "keyword");
        await sleep(20);
        await nextTick();
        menu = findMenu(wrapper);

        // Should show error message
        expect(menu.text().trim()).toContain("test error");

        // Click retry button
        menu.find(".vue3-treeselect__retry").trigger("click");
        await nextTick();
        await sleep(20);
        await nextTick();
        menu = findMenu(wrapper);

        // Should show the result after retry
        expect(menu.text().trim()).toContain("keyword");
        expect(vm.remoteSearch.keyword.isLoaded).toBe(true);
      });

      it("should handle multiple sequential searches", async () => {
        const wrapper = mount(Treeselect, {
          sync: false,
          props: {
            async: true,
            loadOptions({ action, searchQuery, callback }) {
              if (action === "ASYNC_SEARCH") {
                setTimeout(() => {
                  callback(null, [
                    {
                      id: searchQuery,
                      label: searchQuery
                    }
                  ]);
                }, 20);
              } else if (action === "LOAD_ROOT_OPTIONS") {
                callback(null, []);
              }
            }
          }
        });
        const { vm } = wrapper;

        vm.openMenu();
        await nextTick();
        let menu = findMenu(wrapper);

        // Type first search
        await typeSearchText(wrapper, "a");
        await sleep(30);
        await nextTick();
        menu = findMenu(wrapper);

        expect(vm.remoteSearch.a.isLoaded).toBe(true);
        expect(menu.text().trim()).toBe("a");

        // Type second search
        await typeSearchText(wrapper, "b");
        await sleep(30);
        await nextTick();
        menu = findMenu(wrapper);

        expect(vm.remoteSearch.b.isLoaded).toBe(true);
        expect(vm.remoteSearch.a.isLoaded).toBe(true); // First search should still be cached
        expect(menu.text().trim()).toBe("b");
      });
    });

    it("should preserve information of selected options after search query changes (old options will not be in the list)", async () => {
      const wrapper = mount(Treeselect, {
        sync: false,
        props: {
          async: true,
          multiple: true,
          loadOptions({ action, searchQuery, callback }) {
            if (action === "ASYNC_SEARCH") {
              callback(null, [
                {
                  id: searchQuery,
                  label: searchQuery
                }
              ]);
            }
          }
        }
      });
      const { vm } = wrapper;
      const assertMultiValueItemLabels = (labels) => {
        const actualLabels = wrapper
          .findAll(".vue3-treeselect__multi-value-label")
          .map((labelWrapper) => labelWrapper.text().trim());
        expect(actualLabels).toEqual(labels);
      };

      await typeSearchText(wrapper, "a");
      expect(vm.remoteSearch.a.isLoaded).toBe(true);

      vm.select(vm.forest.nodeMap.a);
      expect(vm.forest.selectedNodeIds).toEqual(["a"]);

      await typeSearchText(wrapper, "b");
      expect(vm.remoteSearch.b.isLoaded).toBe(true);

      vm.select(vm.forest.nodeMap.b);
      await nextTick();
      expect(vm.forest.selectedNodeIds).toEqual(["a", "b"]);
      expect(vm.forest.nodeMap.a).toEqual(
        expect.objectContaining({
          id: "a",
          label: "a",
          isFallbackNode: true
        })
      );
      assertMultiValueItemLabels(["a", "b"]);

      await typeSearchText(wrapper, "a");
      expect(vm.forest.nodeMap.b).toEqual(
        expect.objectContaining({
          id: "b",
          label: "b",
          isFallbackNode: true
        })
      );
      assertMultiValueItemLabels(["a", "b"]);
    });

    describe("cache options", () => {
      let calls, expectedCalls, wrapper;
      const typeAndAssert = async (searchText, shouldHit) => {
        await typeSearchText(wrapper, searchText);
        if (!shouldHit) {
          expectedCalls.push(searchText);
        }
        expect(calls).toEqual(expectedCalls);
      };

      beforeEach(() => {
        calls = [];
        expectedCalls = [];
        wrapper = mount(Treeselect, {
          sync: false,
          props: {
            async: true,
            loadOptions({ action, searchQuery, callback }) {
              if (action === "ASYNC_SEARCH") {
                calls.push(searchQuery);
                callback(null, [
                  {
                    id: searchQuery,
                    label: searchQuery
                  }
                ]);
              }
            }
          }
        });
        expect(calls).toEqual([]);
      });

      it("when cacheOptions=false", async () => {
        await wrapper.setProps({ cacheOptions: false });
        await typeAndAssert("a", false);
        await typeAndAssert("b", false);
        await typeAndAssert("a", false);
        await typeAndAssert("b", false);
      });

      it("when cacheOptions=true", async () => {
        await wrapper.setProps({ cacheOptions: true });
        await typeAndAssert("a", false);
        await typeAndAssert("b", false);
        await typeAndAssert("a", true);
        await typeAndAssert("b", true);
      });

      it("change value of cacheOptions", async () => {
        await wrapper.setProps({ cacheOptions: true });
        await typeAndAssert("a", false);
        await typeAndAssert("b", false);
        await typeAndAssert("a", true);
        await typeAndAssert("b", true);

        await wrapper.setProps({ cacheOptions: false });
        await typeAndAssert("a", false);
        await typeAndAssert("b", false);
        await typeAndAssert("a", false);
        await typeAndAssert("b", false);

        await wrapper.setProps({ cacheOptions: true });
        await typeAndAssert("a", true);
        await typeAndAssert("b", true);
        await typeAndAssert("a", true);
        await typeAndAssert("b", true);
      });
    });

    it("should not create new one if there is an ongoing request even with cacheOptions=false", async () => {
      const DELAY = INPUT_DEBOUNCE_DELAY * 10;
      const run = async (schedules) => {
        const start = Date.now();
        const d = 4;
        schedules.forEach((s) => (s[0] *= DELAY));

        while (schedules.length) {
          const [t, fn] = schedules.shift();
          const [next] = schedules[0] || [];
          while (Date.now() - start <= t) {
            await sleep(d);
          }
          if (next && Date.now() - start >= next) {
            throw new Error(`time error @ ${t}`);
          }
          await fn();
        }
      };
      const calls = [];
      const wrapper = mount(Treeselect, {
        sync: false,
        props: {
          async: true,
          cacheOptions: false,
          loadOptions({ action, searchQuery, callback }) {
            if (action === "ASYNC_SEARCH") {
              calls.push(searchQuery);
              setTimeout(() => {
                callback(null, []);
              }, DELAY * 0.9);
            }
          }
        }
      });
      const { vm } = wrapper;

      await run([
        [
          0,
          async () => {
            const p = typeSearchText(wrapper, "a");
            await nextTick();
            expect(calls).toEqual(["a"]);
            return p;
          }
        ],
        [
          1 / 3,
          async () => {
            const p = typeSearchText(wrapper, "b");
            await nextTick();
            expect(calls).toEqual(["a", "b"]);
            return p;
          }
        ],
        [
          2 / 3,
          async () => {
            expect(vm.remoteSearch.a.isLoading).toBe(true);
            const p = typeSearchText(wrapper, "a");
            await nextTick();
            expect(calls).toEqual(["a", "b"]);
            return p;
          }
        ],
        [
          1,
          async () => {
            expect(vm.remoteSearch.a.isLoaded).toBe(true);
            expect(vm.remoteSearch.b.isLoading).toBe(true);
            const p = typeSearchText(wrapper, "b");
            await nextTick();
            expect(calls).toEqual(["a", "b"]);
            return p;
          }
        ],
        [
          4 / 3,
          async () => {
            expect(vm.remoteSearch.b.isLoaded).toBe(true);
            const p = typeSearchText(wrapper, "a");
            await nextTick();
            expect(calls).toEqual(["a", "b", "a"]);
            return p;
          }
        ],
        [
          5 / 3,
          async () => {
            const p = typeSearchText(wrapper, "b");
            await nextTick();
            expect(calls).toEqual(["a", "b", "a", "b"]);
            return p;
          }
        ],
        [2, () => "done"]
      ]);
    });

    it("should highlight first option after search query changes", async () => {
      const DELAY = 10;
      const keywords = ["a", "b", "c"];
      const wrapper = mount(Treeselect, {
        sync: false,
        props: {
          async: true,
          loadOptions({ action, searchQuery, callback }) {
            if (action === "ASYNC_SEARCH") {
              setTimeout(() => {
                callback(
                  null,
                  [1, 2, 3].map((i) => {
                    const option = searchQuery + "-" + i;
                    return { id: option, label: option };
                  })
                );
              }, DELAY);
            }
          }
        }
      });
      const { vm } = wrapper;

      vm.openMenu();
      await nextTick();

      for (const keyword of keywords) {
        await typeSearchText(wrapper, keyword);
        await sleep(DELAY);
        expect(vm.menu.current).toBe(keyword + "-1");
      }
    });

    it("combined with delayed children options loading", async () => {
      const DELAY = 10;
      const wrapper = mount(Treeselect, {
        sync: false,
        props: {
          async: true,
          loadOptions({ action, parentNode, /*searchQuery, */ callback }) {
            if (action === "ASYNC_SEARCH") {
              setTimeout(() => {
                callback(null, [
                  {
                    id: "a",
                    label: "a"
                  },
                  {
                    id: "b",
                    label: "b",
                    children: null
                  }
                ]);
              }, DELAY);
            } else if (action === "LOAD_CHILDREN_OPTIONS") {
              setTimeout(() => {
                parentNode.children = [
                  {
                    id: "ba",
                    label: "ba"
                  }
                ];
                callback();
              }, DELAY);
            }
          }
        }
      });
      const { vm } = wrapper;

      vm.openMenu();
      await nextTick();

      await typeSearchText(wrapper, "random search query");
      await sleep(DELAY);

      expect(vm.menu.current).toBe("a");

      vm.highlightNextOption();
      expect(vm.menu.current).toBe("b");

      vm.toggleExpanded(vm.forest.nodeMap.b);
      await sleep(DELAY);

      // should not reset highlighted item
      expect(vm.menu.current).toBe("b");
      expect(findOptionByNodeId(wrapper, "ba")).toBeTruthy();
    });
  });
});
