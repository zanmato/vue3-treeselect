<template>
  <treeselect :multiple="true" :async="true" :load-options="loadOptions">
    <template #search-prompt-tip>
      <span>🔍 Type to search...</span>
    </template>
  </treeselect>
</template>

<script>
const simulateAsyncOperation = (fn) => {
  setTimeout(fn, 2000);
};

export default {
  methods: {
    loadOptions({ action, searchQuery, callback }) {
      if (action === "ASYNC_SEARCH") {
        simulateAsyncOperation(() => {
          const options = [1, 2, 3, 4, 5].map((i) => ({
            id: `${searchQuery}-${i}`,
            label: `${searchQuery}-${i}`
          }));
          callback(null, options);
        });
      }
    }
  }
};
</script>
