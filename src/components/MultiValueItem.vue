<script lang="jsx">
import { onLeftClick } from "../utils";
import DeleteIcon from "./icons/Delete.vue";

export default {
  name: "vue3-treeselect--multi-value-item",
  inject: ["instance"],

  props: {
    node: {
      type: Object,
      required: true
    }
  },

  methods: {
    handleMouseDown: onLeftClick(function handleMouseDown() {
      const { instance, node } = this;

      // Deselect this node.
      instance.select(node);
    })
  },

  render() {
    const { instance, node } = this;
    const itemClass = {
      "vue3-treeselect__multi-value-item": true,
      "vue3-treeselect__multi-value-item-disabled": node.isDisabled,
      "vue3-treeselect__multi-value-item-new": node.isNew
    };
    const customValueLabelRenderer = instance.$slots["value-label"];
    const labelRenderer = customValueLabelRenderer
      ? customValueLabelRenderer({ node })
      : node.label;

    return (
      <div class="vue3-treeselect__multi-value-item-container">
        <div class={itemClass}>
          <span class="vue3-treeselect__multi-value-label">
            {labelRenderer}
          </span>
          <span
            class="vue3-treeselect__icon vue3-treeselect__value-remove"
            onMousedown={this.handleMouseDown}>
            <DeleteIcon />
          </span>
        </div>
      </div>
    );
  }
};
</script>
