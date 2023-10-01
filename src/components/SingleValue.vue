<script lang="jsx">
import Input from "./Input.vue";
import Placeholder from "./Placeholder.vue";

export default {
  name: "vue3-treeselect--single-value",
  inject: ["instance"],
  methods: {
    renderSingleValueLabel() {
      const { instance } = this;
      const node = instance.selectedNodes[0];

      const customValueLabelRenderer = instance.$slots["value-label"];
      return customValueLabelRenderer
        ? customValueLabelRenderer({ node })
        : node.label;
    }
  },
  render() {
    const {
      instance,
      $parent: { renderValueContainer }
    } = this;
    const shouldShowValue = instance.hasValue && !instance.trigger.searchQuery;

    return renderValueContainer([
      shouldShowValue && (
        <div class="vue3-treeselect__single-value">
          {this.renderSingleValueLabel()}
        </div>
      ),
      <Placeholder />,
      <Input ref="input" />
    ]);
  }
};
</script>
