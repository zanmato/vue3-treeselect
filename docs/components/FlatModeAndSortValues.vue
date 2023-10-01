<template>
  <div>
    <treeselect
      v-model="value"
      :multiple="true"
      :options="options"
      :flat="true"
      :sort-value-by="sortValueBy"
      :default-expand-level="1"
      placeholder="Try selecting some options." />
    <treeselect-value :value="value" />
    <p><strong>Sort value by:</strong></p>
    <p class="options">
      <label>
        <input v-model="sortValueBy" type="radio" value="ORDER_SELECTED" />
        Order selected
      </label>
      <label>
        <input v-model="sortValueBy" type="radio" value="LEVEL" />
        Level
      </label>
      <label>
        <input v-model="sortValueBy" type="radio" value="INDEX" />
        Index
      </label>
    </p>
  </div>
</template>

<script>
import { generateOptions } from "./utils";

export default {
  data() {
    return {
      value: ["c", "aaa", "bb"],
      options: generateOptions(3),
      sortValueBy: "ORDER_SELECTED"
    };
  }
};
</script>
