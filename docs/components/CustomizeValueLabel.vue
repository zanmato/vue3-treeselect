<template>
  <div>
    <treeselect :options="options" :value="value" :multiple="multiple">
      <template #value-label="{ node }">
        <div>{{ node.raw.customLabel }}</div>
      </template>
    </treeselect>
    <p>
      <label>
        <input v-model="multiple" type="checkbox" />
        Multi-select
      </label>
    </p>
  </div>
</template>

<script>
export default {
  data: () => ({
    multiple: true,
    value: null,
    options: [1, 2, 3].map((i) => ({
      id: i,
      label: `Label ${i}`,
      customLabel: `Custom Label ${i}`
    }))
  })
};
</script>
