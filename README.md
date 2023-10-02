# vue3-treeselect

[![npm](https://badgen.now.sh/npm/v/@zanmato/vue3-treeselect)](https://www.npmjs.com/package/@zanmato/vue3-treeselect) ![License](https://badgen.net/github/license/zanmato/vue3-treeselect)

A multi-select component with nested options support for Vue 3.

### Features

- Single & multiple select with nested options support
- Fuzzy matching
- Async searching
- Delayed loading (load data of deep level options only when needed)
- Keyboard support (navigate using <kbd>Arrow Up</kbd> & <kbd>Arrow Down</kbd> keys, select option using <kbd>Enter</kbd> key, etc.)
- Rich options & highly customizable
- Supports a wide range of browsers (see [below](#browser-compatibility))
- RTL support

## Changes from the original vue-treeselect

- Async searching combined with delayed loading

_Requires Vue 3.0+_

### Getting Started

It's recommended to install vue3-treeselect via npm, and build your app using a bundler like [webpack](https://webpack.js.org/).

```bash
npm install --save @zanmato/vue3-treeselect
```

This example shows how to integrate the component with your [Vue SFCs](https://vuejs.org/guide/scaling-up/sfc.html).

```vue
<!-- Vue SFC -->
<template>
  <div id="app">
    <treeselect v-model="state.value" :multiple="true" :options="options" />
  </div>
</template>

<script setup>
import { reactive } from "vue";

// import the component
import Treeselect from "@zanmato/vue3-treeselect";
// import the styles
import "@zanmato/vue3-treeselect/dist/vue3-treeselect.min.css";

const options = [
  {
    id: "a",
    label: "a",
    children: [
      {
        id: "aa",
        label: "aa"
      },
      {
        id: "ab",
        label: "ab"
      }
    ]
  },
  {
    id: "b",
    label: "b"
  },
  {
    id: "c",
    label: "c"
  }
];

const state = reactive({
  value: null
});
</script>
```

### Browser Compatibility

- Chrome
- Edge
- Firefox
- Safari

It should function well on IE9, but the style can be slightly broken due to the lack of support of some relatively new CSS features, such as `transition` and `animation`. Nevertheless it should look 90% same as on modern browsers.

### Bugs

You can [open an issue](https://github.com/zanmato/vue3-treeselect/issues/new).

### Contributing

1. Fork & clone the repo
2. Install dependencies by `yarn` or `npm install`
3. Check out a new branch
4. `yarn docs` & hack
5. Make sure the examples in the docs are working
6. Push your changes & file a pull request

### Credits

This project is based on [vue3-treeselect by megafetis](https://github.com/megafetis/vue3-treeselect) which was based on [vue-treeselect by riophae](https://github.com/riophae/vue-treeselect).
Special thanks go to their respective authors!

Some icons used in this project:

- "link" icon made by [Smashicons](https://www.flaticon.com/authors/smashicons) is licensed under [CC 3.0 BY](https://creativecommons.org/licenses/by/3.0/)
- "spinner" icon from [SpinKit](https://github.com/tobiasahlin/SpinKit) is licensed under the [MIT License](https://github.com/tobiasahlin/SpinKit/blob/master/LICENSE)
- "caret" icon made by [Dave Gandy](https://www.flaticon.com/authors/dave-gandy) is licensed under [CC 3.0 BY](https://creativecommons.org/licenses/by/3.0/)
- "delete" icon made by [Freepik](https://www.flaticon.com/authors/freepik) is licensed under [CC 3.0 BY](https://creativecommons.org/licenses/by/3.0/)
- "checkmark symbol" & "minus symbol" icons made by [Catalin Fertu](https://www.flaticon.com/authors/catalin-fertu) are licensed under [CC 3.0 BY](https://creativecommons.org/licenses/by/3.0/)

### License

Released under the [MIT License](https://github.com/zanmato/vue3-treeselect/blob/master/LICENSE).
