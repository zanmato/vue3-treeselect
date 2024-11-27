<template>
  <treeselect :options="options" :value="value">
    <template #control-arrow="{ showArrow, menuIsOpen, arrowClass }">
      <span v-if="showArrow" :class="[arrowClass]">
        {{ menuIsOpen ? "↑" : "↓" }}
      </span>
    </template>
  </treeselect>
</template>

<script>
import { generateOptions } from "./utils";

export default {
  data: () => ({
    value: null,
    options: generateOptions(2)
  })
};
</script>
