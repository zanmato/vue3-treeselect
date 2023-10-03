import { mount } from "@vue/test-utils";
import Treeselect from "@/components/Treeselect.vue";

describe("Hidden Fields", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Treeselect, {
      props: {
        options: []
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  const getHiddenFields = () => wrapper.findAll('input[type="hidden"]');

  it("must have value & name", async () => {
    await wrapper.setProps({ modelValue: "value" });
    expect(getHiddenFields().length).toBe(0);
    await wrapper.setProps({ modelValue: null, name: "test" });
    expect(getHiddenFields().length).toBe(0);
    await wrapper.setProps({ modelValue: "value", name: "test" });
    expect(getHiddenFields().length).not.toBe(0);
  });

  it("single-select mode", async () => {
    await wrapper.setProps({ name: "single", modelValue: "value" });
    const hiddenFields = getHiddenFields();
    expect(hiddenFields.length).toBe(1);
    expect(hiddenFields.at(0).html()).toBe(
      '<input type="hidden" name="single" value="value">'
    );
  });

  it("multi-select mode", async () => {
    await wrapper.setProps({
      name: "multiple",
      multiple: true,
      modelValue: [1, 2, 3]
    });
    const hiddenFields = getHiddenFields();
    expect(hiddenFields.length).toBe(3);
    expect(hiddenFields.map((hf) => hf.html())).toEqual([
      '<input type="hidden" name="multiple" value="1">',
      '<input type="hidden" name="multiple" value="2">',
      '<input type="hidden" name="multiple" value="3">'
    ]);
  });

  it("join values", async () => {
    await wrapper.setProps({
      name: "join-values",
      multiple: true,
      modelValue: ["a", "b", "c"],
      joinValues: true
    });
    const hiddenFields = getHiddenFields();
    expect(hiddenFields.length).toBe(1);
    expect(hiddenFields.at(0).html()).toBe(
      '<input type="hidden" name="join-values" value="a,b,c">'
    );
  });

  it("delimiter", async () => {
    await wrapper.setProps({
      name: "delimiter",
      multiple: true,
      modelValue: [1, 2, 3],
      joinValues: true,
      delimiter: ";"
    });
    const hiddenFields = getHiddenFields();
    expect(hiddenFields.length).toBe(1);
    expect(hiddenFields.at(0).html()).toBe(
      '<input type="hidden" name="delimiter" value="1;2;3">'
    );
  });

  it("disabled", async () => {
    await wrapper.setProps({
      name: "disabled",
      modelValue: "value",
      disabled: true
    });
    const hiddenFields = getHiddenFields();
    expect(hiddenFields.length).toBe(0);
  });
});
