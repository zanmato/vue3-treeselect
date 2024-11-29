<template>
  <treeselect :options="options" :value="value" multiple>
    <template #control-icon>
      <span>👳</span>
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
