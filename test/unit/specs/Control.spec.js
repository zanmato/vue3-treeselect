import { mount } from "@vue/test-utils";
import { leftClick } from "./shared";
import Treeselect from "@/components/Treeselect.vue";

describe("Control", () => {
  it("should toggle the menu when the arrow is clicked", () => {
    const wrapper = mount(Treeselect, {
      sync: false,
      attachTo: document.body,
      props: {
        options: []
      }
    });
    const arrow = wrapper.find(".vue3-treeselect__control-arrow-container");

    leftClick(arrow);
    expect(wrapper.vm.menu.isOpen).toBe(true);
    leftClick(arrow);
    expect(wrapper.vm.menu.isOpen).toBe(false);
  });
});
