<script lang="jsx">
import { isNaN } from "../utils";
import { defineComponent, inject } from "vue";

function stringifyValue(value) {
  if (typeof value === "string") {
    return value;
  }
  // istanbul ignore else
  if (value != null && !isNaN(value)) {
    return JSON.stringify(value);
  }
  // istanbul ignore next
  return "";
}

export default defineComponent({
  name: "vue3-treeselect--hidden-fields",

  setup() {
    const instance = inject("instance");

    return () => {
      if (!instance.name || instance.disabled || !instance.hasValue) {
        return null;
      }

      let stringifiedValues = instance.internalValue.map(stringifyValue);

      if (instance.multiple && instance.joinValues) {
        stringifiedValues = [stringifiedValues.join(instance.delimiter)];
      }

      return stringifiedValues.map((stringifiedValue, index) => (
        <input
          type="hidden"
          name={instance.name}
          value={stringifiedValue}
          key={"hidden-field-" + index}
        />
      ));
    };
  }
});
</script>
