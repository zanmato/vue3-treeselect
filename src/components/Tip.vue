<script lang="jsx">
import { defineComponent } from "vue";
export default defineComponent({
  name: "vue3-treeselect--tip",
  functional: true,

  props: {
    type: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    }
  },

  render() {
    const { type, icon } = this;

    return (
      <div class={`vue3-treeselect__tip vue3-treeselect__${type}-tip`}>
        <div class="vue3-treeselect__icon-container">
          <span class={`vue3-treeselect__icon-${icon}`} />
        </div>
        <span
          class={`vue3-treeselect__tip-text vue3-treeselect__${type}-tip-text`}>
          {this.$slots.default()}
        </span>
      </div>
    );
  }
});
</script>
