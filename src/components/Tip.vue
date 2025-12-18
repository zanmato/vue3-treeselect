<script lang="jsx">
import { defineComponent } from "vue";
export default defineComponent({
  name: "vue3-treeselect--tip",

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

  setup(props, { slots }) {
    return () => (
      <div class={`vue3-treeselect__tip vue3-treeselect__${props.type}-tip`}>
        <div class="vue3-treeselect__icon-container">
          <span class={`vue3-treeselect__icon-${props.icon}`} />
        </div>
        <span
          class={`vue3-treeselect__tip-text vue3-treeselect__${props.type}-tip-text`}>
          {slots.default?.()}
        </span>
      </div>
    );
  }
});
</script>
