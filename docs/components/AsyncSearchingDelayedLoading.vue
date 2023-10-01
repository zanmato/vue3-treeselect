<template>
  <treeselect
    v-model="value"
    :multiple="true"
    :options="options"
    :auto-load-root-options="false"
    :async="true"
    :load-options="loadOptions"
    placeholder="Try expanding any folder option..." />
</template>

<script>
// We just use `setTimeout()` here to simulate an async operation
// instead of requesting a real API server for demo purpose.
const simulateAsyncOperation = (fn) => {
  setTimeout(fn, 2000);
};

export default {
  data: () => ({
    value: null,
    options: null
  }),

  methods: {
    loadOptions({ action, parentNode, callback, searchQuery }) {
      // Typically, do the AJAX stuff here.
      // Once the server has responded,
      // assign children options to the parent node & call the callback.
      if (action === "LOAD_CHILDREN_OPTIONS") {
        switch (parentNode.id) {
          case "success": {
            simulateAsyncOperation(() => {
              parentNode.children = [
                {
                  id: "child",
                  label: "Child option"
                }
              ];
              callback();
            });
            break;
          }
          case "no-children": {
            simulateAsyncOperation(() => {
              parentNode.children = [];
              callback();
            });
            break;
          }
          case "failure": {
            simulateAsyncOperation(() => {
              callback(new Error("Failed to load options: network error."));
            });
            break;
          }
          default: /* empty */
        }
      } else if (action === "ASYNC_SEARCH") {
        simulateAsyncOperation(() => {
          const options = [1, 2, 3, 4, 5].map((i) => ({
            id: `${searchQuery}-${i}`,
            label: `${searchQuery}-${i}`
          }));
          callback(null, options);
        });
      } else if (action === "LOAD_ROOT_OPTIONS") {
        simulateAsyncOperation(() => {
          this.options = [
            {
              id: "success",
              label: "With children",
              // Declare an unloaded branch node.
              children: null
            },
            {
              id: "no-children",
              label: "With no children",
              children: null
            },
            {
              id: "failure",
              label: "Demonstrates error handling",
              children: null
            }
          ];
          callback();
        });
      }
    }
  }
};
</script>
