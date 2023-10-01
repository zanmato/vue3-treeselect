<template>
  <div>
    <treeselect
      v-model="value"
      :multiple="true"
      :options="options"
      :value-consists-of="valueConsistsOf" />
    <treeselect-value :value="value" />
    <p><strong>Value consists of:</strong></p>
    <p class="options">
      <label>
        <input v-model="valueConsistsOf" type="radio" value="ALL" />
        All
      </label>
      <br />
      <label>
        <input v-model="valueConsistsOf" type="radio" value="BRANCH_PRIORITY" />
        Branch priority
      </label>
      <br />
      <label>
        <input v-model="valueConsistsOf" type="radio" value="LEAF_PRIORITY" />
        Leaf priority
      </label>
      <br />
      <label>
        <input
          v-model="valueConsistsOf"
          type="radio"
          value="ALL_WITH_INDETERMINATE" />
        All with indeterminate
      </label>
      <br />
    </p>
  </div>
</template>

<script>
export default {
  data: () => ({
    value: ["team-i"],
    valueConsistsOf: "BRANCH_PRIORITY",
    options: [
      {
        id: "company",
        label: "Company 🏢",
        children: [
          {
            id: "team-i",
            label: "Team I 👥",
            children: [
              {
                id: "person-a",
                label: "Person A 👱"
              },
              {
                id: "person-b",
                label: "Person B 🧔"
              }
            ]
          },
          {
            id: "team-ii",
            label: "Team II 👥",
            children: [
              {
                id: "person-c",
                label: "Person C 👳"
              },
              {
                id: "person-d",
                label: "Person D 👧"
              }
            ]
          },
          {
            id: "person-e",
            label: "Person E 👩"
          }
        ]
      }
    ]
  })
};
</script>
