<template>
  <div>
    <div :dir="rtl ? 'rtl' : 'ltr'">
      <treeselect
        v-model="value"
        name="demo"
        :multiple="multiple"
        :clearable="clearable"
        :searchable="searchable"
        :disabled="disabled"
        :open-on-click="openOnClick"
        :open-on-focus="openOnFocus"
        :clear-on-select="clearOnSelect"
        :close-on-select="closeOnSelect"
        :always-open="alwaysOpen"
        :append-to-body="appendToBody"
        :options="options"
        :limit="3"
        :max-height="200" />
    </div>
    <treeselect-value :value="value" />
    <p>
      <label>
        <input v-model="multiple" type="checkbox" />
        Multi-select
      </label>
      <label>
        <input v-model="clearable" type="checkbox" />
        Clearable
      </label>
      <label>
        <input v-model="searchable" type="checkbox" />
        Searchable
      </label>
      <label>
        <input v-model="disabled" type="checkbox" />
        Disabled
      </label>
    </p>
    <p>
      <label>
        <input v-model="openOnClick" type="checkbox" />
        Open on click
      </label>
      <label>
        <input v-model="openOnFocus" type="checkbox" />
        Open on focus
      </label>
    </p>
    <p>
      <label>
        <input v-model="clearOnSelect" type="checkbox" />
        Clear on select
      </label>
      <label>
        <input v-model="closeOnSelect" type="checkbox" />
        Close on select
      </label>
    </p>
    <p>
      <label>
        <input v-model="alwaysOpen" type="checkbox" />
        Always open
      </label>
      <label>
        <input v-model="appendToBody" type="checkbox" />
        Append to body
      </label>
      <label>
        <input v-model="rtl" type="checkbox" />
        RTL mode
      </label>
    </p>
  </div>
</template>

<script>
import { generateOptions } from "./utils";

export default {
  data: () => ({
    multiple: true,
    clearable: true,
    searchable: true,
    disabled: false,
    openOnClick: true,
    openOnFocus: false,
    clearOnSelect: true,
    closeOnSelect: false,
    alwaysOpen: false,
    appendToBody: false,
    rtl: false,
    value: ["a"],
    options: generateOptions(2, 3)
  }),

  watch: {
    multiple(newValue) {
      if (newValue) {
        this.value = this.value ? [this.value] : [];
      } else {
        this.value = this.value[0];
      }
    }
  }
};
</script>
