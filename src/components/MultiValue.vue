<script lang="jsx">
import { TransitionGroup } from "vue";
import MultiValueItem from "./MultiValueItem.vue";
import Input from "./Input.vue";
import Placeholder from "./Placeholder.vue";

export default {
  name: "vue3-treeselect--multi-value",
  inject: ["instance"],

  methods: {
    renderMultiValueItems() {
      const { instance } = this;

      return instance.internalValue
        .slice(0, instance.limit)
        .map(instance.getNode)
        .map((node) => (
          <MultiValueItem key={`multi-value-item-${node.id}`} node={node} />
        ));
    },

    renderExceedLimitTip() {
      const { instance } = this;
      const count = instance.internalValue.length - instance.limit;

      if (count <= 0) {
        return null;
      }

      return (
        <div
          class="vue3-treeselect__limit-tip vue3-treeselect-helper-zoom-effect-off"
          key="exceed-limit-tip">
          <span class="vue3-treeselect__limit-tip-text">
            {instance.limitText(count)}
          </span>
        </div>
      );
    }
  },

  render() {
    const { renderValueContainer } = this.$parent;

    return renderValueContainer(
      <TransitionGroup
        class="vue3-treeselect__multi-value"
        tag="div"
        name="vue3-treeselect__multi-value-item--transition"
        appear={true}>
        {this.renderMultiValueItems()}
        {this.renderExceedLimitTip()}
        <Placeholder key="placeholder" />
        <Input ref="input" key="input" />
      </TransitionGroup>
    );
  }
};
</script>
