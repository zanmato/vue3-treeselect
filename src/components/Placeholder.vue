<script lang="jsx">
export default {
  name: "vue3-treeselect--placeholder",
  inject: ["instance"],

  render() {
    const { instance } = this;
    const placeholderClass = {
      "vue3-treeselect__placeholder": true,
      "vue3-treeselect-helper-zoom-effect-off": true,
      "vue3-treeselect__placeholder-icon": instance.$slots["control-icon"],
      "vue3-treeselect-helper-hide":
        instance.hasValue || instance.trigger.searchQuery
    };

    return <div class={placeholderClass}>{instance.placeholder}</div>;
  }
};
</script>
