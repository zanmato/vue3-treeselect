<script lang="jsx">
import treeselectMixin from "../mixins/treeselectMixin.js";
import HiddenFields from "./HiddenFields.vue";
import Control from "./Control.vue";
import { default as TreeMenu } from "./Menu.vue";
import MenuPortal from "./MenuPortal.vue";

import { defineComponent } from "vue";
export default defineComponent({
  name: "vue3-treeselect",
  components: {
    HiddenFields,
    Control,
    TreeMenu,
    MenuPortal
  },
  mixins: [treeselectMixin],

  computed: {
    wrapperClass() {
      return {
        "vue3-treeselect": true,
        "vue3-treeselect--single": this.single,
        "vue3-treeselect--multi": this.multiple,
        "vue3-treeselect--searchable": this.searchable,
        "vue3-treeselect--disabled": this.disabled,
        "vue3-treeselect--focused": this.trigger.isFocused,
        "vue3-treeselect--has-value": this.hasValue,
        "vue3-treeselect--open": this.menu.isOpen,
        "vue3-treeselect--open-above": this.menu.placement === "top",
        "vue3-treeselect--open-below": this.menu.placement === "bottom",
        "vue3-treeselect--branch-nodes-disabled": this.disableBranchNodes,
        "vue3-treeselect--append-to-body": this.appendToBody
      };
    }
  },
  render() {
    return (
      <div ref="wrapper" class={this.wrapperClass}>
        <HiddenFields />
        <Control ref="control" />
        {this.appendToBody ? (
          <MenuPortal ref="portal" />
        ) : (
          <TreeMenu ref="menu" />
        )}
      </div>
    );
  }
});
</script>
