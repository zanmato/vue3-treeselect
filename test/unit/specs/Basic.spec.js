import { nextTick } from "vue";
import { vi } from "vitest";
import { mount } from "@vue/test-utils";
import sleep from "yaku/lib/sleep";
import Treeselect from "@/components/Treeselect.vue";
import Option from "@/components/Option.vue";

describe("Basic", () => {
  describe("nodeMap", () => {
    it("should be able to obtain normalized node by id", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [
            {
              id: "id",
              label: "label"
            }
          ]
        }
      });
      const { vm } = wrapper;

      expect(vm.forest.nodeMap).toBeObject();
      expect(Object.getPrototypeOf(vm.forest.nodeMap)).toBe(null);
      expect(vm.forest.nodeMap.id).toBeObject();
    });
  });

  describe("normalized", () => {
    it("shape", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [
            {
              // branch node
              id: "a",
              label: "a",
              children: [
                {
                  // leaf node
                  id: "aa",
                  label: "aa"
                }
              ]
            }
          ]
        }
      });
      const leafNodeShape = {
        id: expect.any(String),
        label: expect.any(String),
        lowerCased: expect.any(Object),
        nestedSearchLabel: expect.any(String),
        isLeaf: expect.any(Boolean),
        isBranch: expect.any(Boolean),
        isRootNode: expect.any(Boolean),
        isMatched: expect.any(Boolean),
        isHighlighted: expect.any(Boolean),
        isDisabled: expect.any(Boolean),
        isNew: expect.any(Boolean),
        parentNode: expect.any(Object),
        ancestors: expect.any(Array),
        index: expect.any(Array),
        level: expect.any(Number),
        raw: expect.any(Object)
      };
      const branchNodeShape = {
        ...leafNodeShape,
        isExpanded: expect.any(Boolean),
        childrenStates: {
          isLoaded: expect.any(Boolean),
          isLoading: expect.any(Boolean),
          loadingError: expect.any(String)
        },
        hasMatchedDescendants: expect.any(Boolean),
        hasDisabledDescendants: expect.any(Boolean),
        isExpandedOnSearch: expect.any(Boolean),
        showAllChildrenOnSearch: expect.any(Boolean),
        parentNode: null,
        children: expect.any(Array),
        count: {
          ALL_CHILDREN: expect.any(Number),
          ALL_DESCENDANTS: expect.any(Number),
          LEAF_CHILDREN: expect.any(Number),
          LEAF_DESCENDANTS: expect.any(Number)
        }
      };

      expect(wrapper.vm.forest.nodeMap).toEqual({
        a: branchNodeShape,
        aa: leafNodeShape
      });
    });

    it("id & label", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [
            {
              id: "a",
              label: "a"
            }
          ]
        }
      });
      const { vm } = wrapper;

      expect(vm.forest.nodeMap.a.id).toBe("a");
      expect(vm.forest.nodeMap.a.label).toBe("a");
    });

    it("lowerCased", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [
            {
              id: "a",
              label: "A"
            }
          ]
        }
      });
      const { vm } = wrapper;

      expect(vm.forest.nodeMap.a.label).toBe("A");
      expect(vm.forest.nodeMap.a.lowerCased).toEqual({ label: "a" });
    });

    describe("isDisabled", () => {
      const options = [
        {
          id: "a",
          label: "a",
          isDisabled: true,
          children: [
            {
              id: "aa",
              label: "aa"
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
              isDisabled: true
            },
            {
              id: "bb",
              label: "bb"
            }
          ]
        },
        {
          id: "c",
          label: "c",
          children: [
            {
              id: "ca",
              label: "ca",
              isDisabled: true,
              children: [
                {
                  id: "caa",
                  label: "caa"
                }
              ]
            }
          ]
        }
      ];

      const whenNonFlatMode = (vm) => {
        const { a, aa, b, ba, bb, c, ca, caa } = vm.forest.nodeMap;

        expect(a.isDisabled).toBe(true);
        expect(aa.isDisabled).toBe(true);
        expect(b.isDisabled).toBe(false);
        expect(ba.isDisabled).toBe(true);
        expect(bb.isDisabled).toBe(false);
        expect(c.isDisabled).toBe(false);
        expect(ca.isDisabled).toBe(true);
        expect(caa.isDisabled).toBe(true);
      };

      const whenFlatMode = (vm) => {
        const { a, aa, b, ba, bb, c, ca, caa } = vm.forest.nodeMap;

        expect(a.isDisabled).toBe(true);
        expect(aa.isDisabled).toBe(false);
        expect(b.isDisabled).toBe(false);
        expect(ba.isDisabled).toBe(true);
        expect(bb.isDisabled).toBe(false);
        expect(c.isDisabled).toBe(false);
        expect(ca.isDisabled).toBe(true);
        expect(caa.isDisabled).toBe(false);
      };

      it("flat=false", () => {
        const wrapper = mount(Treeselect, {
          props: {
            flat: false,
            multiple: true,
            options
          }
        });
        const { vm } = wrapper;

        whenNonFlatMode(vm);
      });

      it("flat=true", () => {
        const wrapper = mount(Treeselect, {
          props: {
            flat: true,
            multiple: true,
            options
          }
        });
        const { vm } = wrapper;

        whenFlatMode(vm);
      });

      it("should reinitialize options after value of `flat` prop changes", async () => {
        const wrapper = mount(Treeselect, {
          props: {
            options
          }
        });
        const { vm } = wrapper;

        await wrapper.setProps({ flat: false });
        whenNonFlatMode(vm);

        await wrapper.setProps({ flat: true });
        whenFlatMode(vm);

        await wrapper.setProps({ flat: false });
        whenNonFlatMode(vm);
      });
    });

    it("hasDisabledDescendants", () => {
      const wrapper = mount(Treeselect, {
        props: {
          flat: true,
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
                }
              ]
            }
          ]
        }
      });
      const { vm } = wrapper;
      const { a, aa } = vm.forest.nodeMap;

      expect(a.hasDisabledDescendants).toBe(true);
      expect(aa.hasDisabledDescendants).toBe(false);
    });

    it("isLeaf & isBranch & childrenStates", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [
            {
              // leaf node
              id: "a",
              label: "a"
            },
            {
              // branch node with no children
              id: "b",
              label: "b",
              children: []
            },
            {
              // unloaded branch node
              id: "c",
              label: "c",
              children: null
            }
          ],
          loadOptions() {
            /* empty */
          }
        }
      });
      const { vm } = wrapper;
      const { a, b, c } = vm.forest.nodeMap;

      expect(a).toEqual(
        expect.objectContaining({
          isLeaf: true,
          isBranch: false
        })
      );

      expect(b).toEqual(
        expect.objectContaining({
          isLeaf: false,
          isBranch: true,
          children: [],
          childrenStates: {
            isLoaded: true,
            isLoading: false,
            loadingError: ""
          }
        })
      );

      expect(c).toEqual(
        expect.objectContaining({
          isLeaf: false,
          isBranch: true,
          children: [],
          childrenStates: {
            isLoaded: false,
            isLoading: false,
            loadingError: ""
          }
        })
      );
    });

    it("isDefaultExpanded", () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: [
            {
              id: "a",
              label: "a",
              isDefaultExpanded: true,
              children: []
            },
            {
              id: "b",
              label: "b",
              isDefaultExpanded: false,
              children: []
            },
            {
              id: "c",
              label: "c",
              children: [
                {
                  id: "ca",
                  label: "ca",
                  isDefaultExpanded: true,
                  children: []
                }
              ]
            }
          ]
        }
      });
      const { a, b, c, ca } = wrapper.vm.forest.nodeMap;

      expect(a.isExpanded).toBe(true);
      expect(b.isExpanded).toBe(false);
      expect(c.isExpanded).toBe(true);
      expect(ca.isExpanded).toBe(true);
    });

    it("isRootNode", () => {
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
                }
              ]
            }
          ]
        }
      });
      const { vm } = wrapper;
      const { a, aa } = vm.forest.nodeMap;

      expect(a.isRootNode).toBe(true);
      expect(aa.isRootNode).toBe(false);
    });

    it("parentNode & ancestors & level", () => {
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
                  children: [
                    {
                      id: "aaa",
                      label: "aaa"
                    }
                  ]
                }
              ]
            }
          ]
        }
      });
      const { vm } = wrapper;
      const { a, aa, aaa } = vm.forest.nodeMap;

      expect(a.parentNode).toBe(null);
      expect(aa.parentNode).toBe(a);
      expect(aaa.parentNode).toBe(aa);

      expect(a.ancestors).toEqual([]);
      expect(aa.ancestors).toEqual([a]);
      expect(aaa.ancestors).toEqual([aa, a]);

      expect(a.level).toBe(0);
      expect(aa.level).toBe(1);
      expect(aaa.level).toBe(2);
    });

    it("index", () => {
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
                  children: [
                    {
                      id: "aaa",
                      label: "aaa"
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
                }
              ]
            }
          ]
        }
      });
      const { vm } = wrapper;
      const { a, aa, aaa, ab, b, ba, bb, bba } = vm.forest.nodeMap;

      expect(a.index).toEqual([0]);
      expect(aa.index).toEqual([0, 0]);
      expect(aaa.index).toEqual([0, 0, 0]);
      expect(ab.index).toEqual([0, 1]);
      expect(b.index).toEqual([1]);
      expect(ba.index).toEqual([1, 0]);
      expect(bb.index).toEqual([1, 1]);
      expect(bba.index).toEqual([1, 1, 0]);
    });

    it("count", () => {
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
            }
          ]
        }
      });
      const { vm } = wrapper;
      const { a, b, aa, ab } = vm.forest.nodeMap;

      expect(a.count).toEqual({
        ALL_CHILDREN: 2,
        ALL_DESCENDANTS: 4,
        LEAF_CHILDREN: 1,
        LEAF_DESCENDANTS: 3
      });

      expect(b).not.toHaveMember("count");

      expect(aa.count).toEqual({
        ALL_CHILDREN: 2,
        ALL_DESCENDANTS: 2,
        LEAF_CHILDREN: 2,
        LEAF_DESCENDANTS: 2
      });

      expect(ab).not.toHaveMember("count");
    });

    it("raw", () => {
      const rawAa = {
        id: "aa",
        label: "aa"
      };
      const rawA = {
        id: "a",
        label: "a",
        children: [rawAa]
      };
      const wrapper = mount(Treeselect, {
        props: {
          options: [rawA]
        }
      });
      const { vm } = wrapper;
      const { a, aa } = vm.forest.nodeMap;

      expect(a.raw).toStrictEqual(rawA);
      expect(aa.raw).toStrictEqual(rawAa);
    });
  });

  it("rootOptions", () => {
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
    const { a, b } = vm.forest.nodeMap;

    expect(vm.forest.normalizedOptions).toEqual([a, b]);
    vm.forest.normalizedOptions.forEach((normalized) => {
      expect(normalized.isRootNode).toBe(true);
    });
  });

  describe("fallback node", () => {
    it("shape", async () => {
      const wrapper = mount(Treeselect, {
        props: {
          options: []
        }
      });
      const { vm } = wrapper;

      expect(vm.forest.nodeMap).toBeEmptyObject();
      await wrapper.setProps({ modelValue: "test" });
      expect(vm.forest.nodeMap.test).toEqual({
        id: expect.any(String),
        label: expect.any(String),
        ancestors: [],
        parentNode: null,
        isFallbackNode: true,
        isRootNode: true,
        isLeaf: true,
        isBranch: false,
        isDisabled: false,
        isNew: false,
        index: [-1],
        level: 0,
        raw: {
          id: "test"
        }
      });
    });

    describe("label", () => {
      it("extract label from value object", () => {
        const wrapper = mount(Treeselect, {
          props: {
            modelValue: {
              id: "id",
              label: "label"
            },
            options: [],
            valueFormat: "object"
          }
        });
        const { vm } = wrapper;

        expect(vm.forest.nodeMap.id).toEqual(
          expect.objectContaining({
            id: "id",
            label: "label",
            isFallbackNode: true
          })
        );
      });

      it("default label", () => {
        const wrapper = mount(Treeselect, {
          props: {
            modelValue: "a",
            options: []
          }
        });
        const { vm } = wrapper;

        expect(vm.forest.nodeMap.a).toEqual(
          expect.objectContaining({
            id: "a",
            label: "a (unknown)",
            isFallbackNode: true
          })
        );
      });
    });
  });

  it("should accept undefined/null as value", () => {
    [true, false].forEach((multiple) => {
      [undefined, null].forEach((value) => {
        const wrapper = mount(Treeselect, {
          props: {
            multiple,
            value,
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
              },
              {
                id: "b",
                label: "b"
              }
            ]
          }
        });
        const { vm } = wrapper;

        expect(vm.forest.selectedNodeIds).toBeEmptyArray();
      });
    });
  });

  it("declaring branch nodes by `isBranch: true` should raise a warning", () => {
    vi.spyOn(console, "error");

    mount(Treeselect, {
      props: {
        options: [
          {
            id: "branch",
            label: "branch",
            isBranch: true
          }
        ]
      }
    });

    expect(console.error).toHaveBeenCalledWith(
      "[Vue3-Treeselect Warning]",
      "Are you meant to declare an unloaded branch node? " +
        "`isBranch: true` is no longer supported, please use `children: null` instead."
    );
  });

  describe("should warn about duplicate node ids", () => {
    it("case #1", () => {
      vi.spyOn(console, "error");

      mount(Treeselect, {
        props: {
          options: [
            {
              id: "same_id",
              label: "a"
            },
            {
              id: "same_id",
              label: "b"
            }
          ]
        }
      });

      expect(console.error).toHaveBeenCalledWith(
        "[Vue3-Treeselect Warning]",
        'Detected duplicate presence of node id "same_id". ' +
          'Their labels are "a" and "b" respectively.'
      );
    });

    it("case #2", () => {
      vi.spyOn(console, "error");

      mount(Treeselect, {
        props: {
          options: [
            {
              id: "same_id",
              label: "a",
              children: [
                {
                  id: "same_id",
                  label: "b"
                }
              ]
            }
          ]
        }
      });

      expect(console.error).toHaveBeenCalledWith(
        "[Vue3-Treeselect Warning]",
        'Detected duplicate presence of node id "same_id". ' +
          'Their labels are "a" and "b" respectively.'
      );
    });
  });

  it("fallback nodes should not be considered duplicate", async () => {
    vi.spyOn(console, "error");

    const DELAY = 10;

    const AppComponent = {
      components: { Treeselect },
      data() {
        return {
          value: "a", // <- this creates a fallback node
          options: null,
          loadOptions: ({ callback }) => {
            setTimeout(() => {
              this.options = [
                {
                  id: "a",
                  label: "a"
                }
              ];
              callback();
            }, DELAY);
          }
        };
      },
      template: `
        <div>
          <treeselect
            v-model="value"
            :options="options"
            :load-options="loadOptions">
          </treeselect>
        </div>
      `
    };

    const wrapper = mount(AppComponent);
    const tree = wrapper.findComponent(".vue3-treeselect");
    expect(wrapper.findComponent(".vue3-treeselect").exists()).toBe(true);
    expect(tree.vm.forest.nodeMap.a.isFallbackNode).toBe(true);

    await sleep(DELAY + 1);
    expect(console.error).not.toHaveBeenCalled();
    expect(tree.vm.forest.nodeMap.a).not.toHaveMember("isFallbackNode");
  });

  it("should rebuild state after swithching from single to multiple", async () => {
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
              }
            ]
          }
        ],
        multiple: false,
        value: ["a"]
      }
    });
    const { vm } = wrapper;

    expect(vm.forest.checkedStateMap).toBeEmptyObject();
    await wrapper.setProps({ multiple: true });
    expect(vm.forest.checkedStateMap).toBeNonEmptyObject();
  });

  it("should rebuild state after value changed externally when multiple=true", async () => {
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
              }
            ]
          }
        ],
        multiple: true,
        value: []
      }
    });
    const { vm } = wrapper;

    expect(vm.forest.checkedStateMap).toEqual({
      a: 0,
      aa: 0
    });
    await wrapper.setProps({ modelValue: ["a"] });
    expect(vm.forest.checkedStateMap).toEqual({
      a: 2,
      aa: 2
    });
  });

  it("v-model support", async () => {
    const wrapper = mount(Treeselect, {
      props: {
        modelValue: [],
        options: [
          {
            id: "a",
            label: "a"
          },
          {
            id: "b",
            label: "b"
          }
        ],
        multiple: true,
        "onUpdate:modelValue": (e) => wrapper.setProps({ modelValue: e })
      }
    });

    const comp = wrapper.findComponent(".vue3-treeselect");

    comp.vm.select(comp.vm.forest.nodeMap.a);
    await nextTick();
    expect(wrapper.props("modelValue")).toEqual(["a"]);
    comp.vm.select(comp.vm.forest.nodeMap.a);
    await nextTick();
    expect(wrapper.props("modelValue")).toEqual([]);
  });

  it("an option should be rendered with its id in the markup", async () => {
    const wrapper = mount(Treeselect, {
      props: {
        modelValue: null,
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
        defaultExpandLevel: Infinity
      }
    });

    wrapper.vm.openMenu();
    await nextTick();

    const optionsWrappers = wrapper.findAllComponents(Option);

    expect(optionsWrappers.length).toEqual(2);

    const a = optionsWrappers
      .find((optionWrapper) => optionWrapper.vm.node.id === "a")
      .find(".vue3-treeselect__option");
    const aa = optionsWrappers
      .find((optionWrapper) => optionWrapper.vm.node.id === "aa")
      .find(".vue3-treeselect__option");

    expect(a.attributes()["data-id"]).toBe("a");
    expect(aa.attributes()["data-id"]).toBe("aa");
  });
});
