<template>
  <div class="example">
    <div class="example-demo">
      <label class="example-label">Demo</label>
      <div class="example-inner">
        <component :is="props.name"></component>
      </div>
    </div>
    <div class="example-code">
      <label class="example-label">
        Code
        <span class="example-code-lang-switch">
          <a
            class="example-code-lang"
            :class="{ current: state.current === 'html' }"
            @click="toggle">
            HTML
          </a>
          |
          <a
            class="example-code-lang"
            :class="{ current: state.current === 'javascript' }"
            @click="toggle">
            JavaScript
          </a>
        </span>
      </label>
      <div class="example-inner">
        <pre
          class="language-html"
          :class="{
            current: state.current === 'html'
          }"><code class="language-html" v-html="loadSFCSource(props.name, 'template')" /></pre>
        <pre
          class="language-javascript"
          :class="{
            current: state.current === 'javascript'
          }"><code class="language-javascript" v-html="loadSFCSource(props.name, 'script')" /></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import Prism from "prismjs";

import stripIndent from "strip-indent";

const props = defineProps({
  name: {
    type: String,
    required: true
  }
});

const state = reactive({
  current: "html"
});

const toggle = () => {
  state.current = state.current === "html" ? "javascript" : "html";
};

const loadSFCSource = (name, type) => {
  const source = require(`./${name}.vue?raw`);
  const startTag = `<${type}>`;
  const endTag = `</${type}>`;
  const start = source.indexOf(startTag) + startTag.length;
  const end = source.indexOf(endTag);

  try {
    if (type === "script") {
      return Prism.highlight(
        stripIndent(source.slice(start, end).replace(/^\n+/, "")),
        Prism.languages.javascript,
        "javascript"
      );
    } else if (type === "template") {
      return Prism.highlight(
        stripIndent(source.slice(start, end).replace(/^\n+/, "")),
        Prism.languages.markup,
        "html"
      );
    }
  } catch (e) {
    console.error(e);
  }

  return "could not load source";
};
</script>
