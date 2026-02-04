import { nextTick } from "vue";
import { mount } from "@vue/test-utils";
import {
  generateOptions,
  leftClick,
  typeSearchText,
  findMenu,
  findOptionByNodeId
} from "./shared";
import Treeselect from "@/components/Treeselect.vue";
import Input from "@/components/Input.vue";

describe("Menu", () => {
  it("should blur the input & close the menu after clicking anywhere outside the component", async () => {
    const wrapper = mount(Treeselect, {
      sync: false,
      attachTo: document.body,
      props: {
        options: []
      }
    });
    const { vm } = wrapper;

    vm.openMenu();
    await nextTick();

    const event = new Event("mousedown", { bubbles: true, cancelable: true });

    document.body.dispatchEvent(event);
    expect(vm.trigger.isFocused).toBe(false);
    expect(vm.menu.isOpen).toBe(false);
  });

  it("should open the menu after clicking the control when focused", () => {
    const wrapper = mount(Treeselect, {
      attachTo: document.body,
      props: {
        options: []
      }
    });
    wrapper.vm.trigger.isFocused = true;
    const valueContainer = wrapper.findComponent(
      ".vue3-treeselect__value-container"
    );

    leftClick(valueContainer);
    expect(wrapper.vm.menu.isOpen).toBe(true);
  });

  it("click on option arrow should toggle expanded", async () => {
    const wrapper = mount(Treeselect, {
      sync: false,
      attachTo: document.body,
      props: {
        options: [
          {
            id: "a",
            label: "a",
            children: []
          }
        ]
      }
    });
    const { vm } = wrapper;
    const { a } = vm.forest.nodeMap;

    vm.openMenu();
    await nextTick();

    expect(a.isExpanded).toBe(false);
    const optionArrow = findOptionByNodeId(wrapper, "a").find(
      ".vue3-treeselect__option-arrow-container"
    );
    leftClick(optionArrow);
    expect(a.isExpanded).toBe(true);
    leftClick(optionArrow);
    expect(a.isExpanded).toBe(false);
  });

  it("should highlight the option when the cursor hovering over it", async () => {
    const wrapper = mount(Treeselect, {
      props: {
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
      }
    });
    const { vm } = wrapper;

    vm.openMenu();
    await nextTick();

    expect(vm.menu.current).toBe("a");
    expect(vm.forest.nodeMap.a.isHighlighted).toBe(true);

    findOptionByNodeId(wrapper, "b").trigger("mouseenter");
    expect(vm.menu.current).toBe("b");
    expect(vm.forest.nodeMap.b.isHighlighted).toBe(true);

    findOptionByNodeId(wrapper, "a").trigger("mouseenter");
    expect(vm.menu.current).toBe("a");
    expect(vm.forest.nodeMap.a.isHighlighted).toBe(true);
  });

  it.skip("retain scroll position on menu reopen", async () => {
    const maxHeight = 100;
    const wrapper = mount(Treeselect, {
      props: {
        options: generateOptions(3),
        defaultExpandLevel: Infinity,
        maxHeight
      },
      attachTo: document.body
    });
    const { vm } = wrapper;

    let i = 3;
    let pos = 0;
    const step = 20;
    while (i--) {
      vm.openMenu();
      await nextTick();
      const menu = findMenu(wrapper);
      expect(menu.element.scrollHeight).toBeGreaterThan(maxHeight);
      expect(menu.element.scrollTop).toBe(pos);
      pos += step;
      menu.element.scrollTo(0, step); // scrollBy
      vm.closeMenu();
      await nextTick();
    }
  });

  it("should reset the search box after closing menu", async () => {
    const wrapper = mount(Treeselect, {
      sync: false,
      props: {
        options: []
      }
    });
    const { vm } = wrapper;
    const input = wrapper.findComponent(Input);

    const assertInputValue = (expected) => {
      expect(vm.trigger.searchQuery).toBe(expected);
      expect(input.vm.value).toBe(expected);
      expect(input.find('input[type="text"]').element.value).toBe(expected);
    };

    vm.openMenu();
    await nextTick();

    await typeSearchText(wrapper, "a");
    assertInputValue("a");

    vm.closeMenu();
    await nextTick();
    assertInputValue("");
  });

  it("set appendToBody to true when alwaysOpen=true should not throw error", async () => {
    const wrapper = mount(Treeselect, {
      attachTo: document.body,
      props: {
        options: [],
        alwaysOpen: true
      }
    });

    await wrapper.setProps({ appendToBody: true });
  });
});
