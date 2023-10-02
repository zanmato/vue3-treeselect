<template>
  <header class="site-header">
    <div id="header" class="container">
      <div class="site-header-logo">
        <a class="site-header-logo-link" href="#">
          Vue3
          <span class="site-header-logo-component-name">Treeselect</span>
        </a>
      </div>
      <nav class="site-header-nav">
        <a
          class="site-header-nav-item"
          href="https://github.com/zanmato/vue3-treeselect/releases">
          v{{ require("../package.json").version }}
        </a>
        <span class="site-header-nav-item">
          <a
            class="github-button"
            href="https://github.com/zanmato/vue3-treeselect"
            data-show-count="true"
            aria-label="Star zanmato/vue3-treeselect on GitHub">
            Star
          </a>
        </span>
      </nav>
    </div>
  </header>
  <div class="container">
    <section id="main">
      <div id="sidebar">
        <div class="sidebar-nav" :class="{ sticky: state.isNavSticky }">
          <section
            v-for="(s, i) in sections"
            :key="i"
            class="sidebar-nav-section">
            <h4 class="sidebar-nav-section-title">{{ s.name }}</h4>
            <template v-if="s.children">
              <ul
                v-for="(c, j) in s.children"
                :key="j"
                class="sidebar-nav-list">
                <li
                  class="sidebar-nav-list-item"
                  :class="{ current: state.currentPosition === c.id }">
                  <a :href="`#${c.id}`">{{ c.name }}</a>
                </li>
              </ul>
            </template>
          </section>
        </div>
      </div>
      <div id="content">
        <section-header name="Introduction" />
        <a href="https://github.com/zanmato/vue3-treeselect">vue3-treeselect</a>
        is a multi-select component with nested options support for
        <a href="https://www.vuejs.org">Vue.js</a>
        .
        <ul>
          <li>Single &amp; multiple select with nested options support</li>
          <li>Fuzzy matching</li>
          <li>Async searching</li>
          <li>
            Delayed loading (load data of deep level options only when needed)
          </li>
          <li>
            Keyboard support (navigate using
            <kbd>Arrow Up</kbd>
            &amp;
            <kbd>Arrow Down</kbd>
            keys, select option using
            <kbd>Enter</kbd>
            key, etc.)
          </li>
          <li>Rich options &amp; highly customizable</li>
        </ul>
        <p><strong>Requires Vue 3+</strong></p>

        <section-header name="Getting started" />
        <p>It's recommended to install vue3-treeselect via npm.</p>
        <pre class="language-bash">
          <code class="language-bash">
            npm install --save @zanmato/vue3-treeselect
          </code>
        </pre>

        <section-header name="Guides" />

        <section-header name="Basic Features" :level="2" />

        This example demonstrates the most commonly-used features of
        vue3-treeselect. Try the fuzzy matching functionality by typing a few
        letters.
        <demo name="BasicFeatures" />

        The first thing you need to learn is how to define options. There are
        two types of options:
        <strong>a. folder options</strong>
        that are foldable &
        <i>may</i>
        have children options, and
        <strong>b. normal options</strong>
        that aren't & don't. Here, I'd like to borrow the basic concepts from
        Computer Science and call the former as
        <i>branch nodes</i>
        & the latter as
        <i>leaf nodes</i>
        . These two kinds of nodes together compose the tree. Defining leaf
        nodes is quite simple:

        <pre class="language-javascript">
          <code class="language-javascript">
          {
            id: '&lt;id&gt;', // used to identify the option within the tree so its value must be unique across all options
            label: '&lt;label&gt;', // used to display the option
          }
          </code>
        </pre>

        Defining branch nodes only needs an extra
        <code>children</code>
        property:

        <pre class="language-javascript">
          <code class="language-javascript">
          {
            id: '&lt;id&gt;',
            label: '&lt;label&gt;',
            children: [
              {
                id: '&lt;child id&gt;',
                label: '&lt;child label&gt;',
              },
              ...
            ],
          }
          </code>
        </pre>

        <p>
          Then you can pass an array of these nodes as the
          <code>options</code>
          prop. Note that, even if you assign an empty array to the
          <code>children</code>
          property, it's still considered to be a branch node. This is likely
          different from what you've learnt from Computer Science, in which a
          node with no children is commonly known as a leaf node. For
          information on all available properties in a
          <code>node</code>
          object, see
          <a href="#node">below</a>
          .
        </p>

        <section-header name="More Features" :level="2" />

        This demonstrates more features.
        <demo name="MoreFeatures" />

        <section-header name="Delayed Loading" :level="2" />

        If you have a large number of deeply nested options, you might want to
        load options only of the most top levels on initial load, and load the
        rest only when needed. You can achieve that by following these steps: 1.
        Declare an
        <i>unloaded</i>
        branch node by setting
        <code>children: null</code>
        2. Add
        <code>loadOptions</code>
        prop 3. Whenever an unloaded branch node gets expanded,
        <code>loadOptions({ action, parentNode, callback, instanceId })</code>
        will be called, then you can perform the job requesting data from a
        remote server
        <demo name="DelayedLoading" />

        It's also possible to have root level options to be delayed loaded. If
        no options have been initially registered (
        <code>options: null</code>
        ), vue3-treeselect will attempt to load root options by calling
        <code>loadOptions({ action, callback, instanceId })</code>
        after the component is mounted. In this example I have disabled the auto
        loading feature by setting
        <code>autoLoadRootOptions: false</code>
        , and the root options will be loaded when the menu is opened.
        <demo name="DelayedRootOptions" />

        <section-header name="Async Searching" :level="2" />

        vue3-treeselect supports dynamically loading & changing the entire
        options list as the user types. By default, vue3-treeselect will cache
        the result of each AJAX request, thus the user could wait less.
        <demo name="AsyncSearching" />

        <section-header name="Delayed Loading & Async Searching" :level="2" />

        If you have a large number of deeply nested options, you might want to
        load options only of the most top levels on initial load, and load the
        rest only when needed. You might also want to enable async searching if
        the tree is very large, this combines the Delayed Loading and Async
        Searching example.
        <demo name="AsyncSearchingDelayedLoading" />

        <section-header name="Flat Mode & Sort Values" :level="2" />

        In all previous examples, we used the default non-flat mode of
        vue3-treeselect, which means: 1. Whenever a branch node gets checked,
        all its children will be checked too 2. Whenever a branch node has all
        children checked, the branch node itself will be checked too Sometimes
        we don't need that mechanism, and want branch nodes & leaf nodes don't
        affect each other. In this case, flat mode should be used, as
        demonstrated in the following. If you want to control the order in which
        selected options to be displayed, use the
        <code>sortValueBy</code>
        prop. This prop has three options: -
        <code>"ORDER_SELECTED"</code>
        (default) - Order selected -
        <code>"LEVEL"</code>
        - Level of option: C 🡒 BB 🡒 AAA -
        <code>"INDEX"</code>
        - Index of option: AAA 🡒 BB 🡒 C
        <demo name="FlatModeAndSortValues" />

        <section-header name="Prevent Value Combining" :level="2" />

        For non-flat & multi-select mode, if a branch node and its all
        descendants are checked, vue3-treeselect will combine them into a single
        item in the value array, as demonstrated in the following example. By
        using
        <code>valueConsistsOf</code>
        prop you can change that behavior. This prop has five options: -
        <code>"ALL"</code>
        - Any node that is checked will be included in the
        <code>value</code>
        array -
        <code>"BRANCH_PRIORITY"</code>
        (default) - If a branch node is checked, all its descendants will be
        excluded in the
        <code>value</code>
        array -
        <code>"LEAF_PRIORITY"</code>
        - If a branch node is checked, this node itself and its branch
        descendants will be excluded from the
        <code>value</code>
        array but its leaf descendants will be included -
        <code>"ALL_WITH_INDETERMINATE"</code>
        - Any node that is checked will be included in the
        <code>value</code>
        array, plus indeterminate nodes
        <demo name="PreventValueCombining" />

        <section-header name="Disable Branch Nodes" :level="2" />

        Set
        <code>disableBranchNodes: true</code>
        to make branch nodes uncheckable and treat them as collapsible folders
        only. You may also want to show a count next to the label of each branch
        node by setting `showCount: true`.
        <demo name="DisableBranchNodes" />

        <section-header name="Flatten Search Results" :level="2" />

        Set
        <code>flattenSearchResults: true</code>
        to flatten the tree when searching. With this option set to
        <code>true</code>
        , only the results that match will be shown. With this set to
        <code>false</code>
        (default), its ancestors will also be displayed, even if they would not
        individually be included in the results.
        <demo name="FlattenSearchResults" />

        <section-header name="Disable Item Selection" :level="2" />

        You can disable item selection by setting
        <code>isDisabled: true</code>
        on any leaf node or branch node. For non-flat mode, setting on a branch
        node will disable all its descendants as well.
        <demo name="DisableItemSelection" />

        <section-header name="Nested Search" :level="2" />

        Sometimes we need the possibility to search options within a specific
        branch. For example your branches are different restaurants and the
        leafs are the foods they order. To search for the salad order of
        "McDonals" restaurant, just search for
        <strong>"mc salad"</strong>
        . You can also try searching
        <strong>"salad"</strong>
        to feel the difference. Concretely speaking, your search query gets
        split on spaces. If each splitted string is found within the path to the
        node, then we have a match.
        <demo name="NestedSearch" />
        <p class="tip">
          Fuzzy matching functionality is disabled for this mode to avoid
          mismatching.
        </p>

        <section-header name="Customize Key Names" :level="2" />

        If your data of options is loaded via AJAX and have a different data
        structure than what vue3-treeselect asks, e.g. your data has
        <code>name</code>
        property but vue3-treeselect needs
        <code>label</code>
        , you may want to customize the key names. In this case, you can provide
        a function prop called
        <code>normalizer</code>
        which will be passed every node in the tree during data initialization.
        Use this function to create and return the transformed object.
        <demo name="CustomizeKeyNames" />

        <section-header name="Customize Option Label" :level="2" />

        You can customize the label of each option. vue3-treeselect utilizes
        Vue's scoped slot feature and provides some props you should use in your
        customized template: -
        <code>node</code>
        - a normalized node object (note that, this is differnt from what you
        return from
        <code>normalizer()</code>
        prop) -
        <code>count</code>
        &
        <code>shouldShowCount</code>
        - the count number and a boolean indicates whether the count should be
        displayed -
        <code>labelClassName</code>
        &
        <code>countClassName</code>
        - CSS classnames for making the style correct
        <demo name="CustomizeOptionLabel" />

        <section-header name="Customize Value Label" :level="2" />

        You can customize the label of value item (each item in case of
        multi-select). vue3-treeselect utilizes Vue's scoped slot feature and
        provides some props you should use in your customized template: -
        <code>node</code>
        - a normalized node object (note that, this is differnt from what you
        return from
        <code>normalizer()</code>
        prop)
        <demo name="CustomizeValueLabel" />

        <section-header name="API" />

        <section-header name="Node" :level="2" />
        <doc-node />

        <section-header name="Props" :level="2" />
        <doc-props />

        <section-header name="Events" :level="2" />
        <doc-events />

        <section-header name="Slots" :level="2" />
        <doc-slots />
      </div>
    </section>
  </div>
</template>
<script setup>
import { reactive, onMounted, onUnmounted } from "vue";
import SectionHeader from "./components/SectionHeader.vue";
import { kebabCase } from "./components/utils.js";

const sections = [
  {
    name: "Introduction"
  },
  {
    name: "Getting started"
  },
  {
    name: "Guides",
    children: [
      {
        name: "Basic Features"
      },
      {
        name: "More Features"
      },
      {
        name: "Delayed Loading"
      },
      {
        name: "Async Searching"
      },
      {
        name: "Delayed Loading & Async Searching"
      },
      {
        name: "Flat Mode & Sort Values"
      },
      {
        name: "Prevent Value Combining"
      },
      {
        name: "Disable Branch Nodes"
      },
      {
        name: "Flatten Search Results"
      },
      {
        name: "Disable Item Selection"
      },
      {
        name: "Nested Search"
      },
      {
        name: "Customize Key Names"
      },
      {
        name: "Customize Option Label"
      },
      {
        name: "Customize Value Label"
      }
    ]
  },
  {
    name: "API",
    children: [
      {
        name: "Node"
      },
      {
        name: "Props"
      },
      {
        name: "Events"
      },
      {
        name: "Slots"
      }
    ]
  }
];

for (const s of sections) {
  s.id = kebabCase(s.name);
  if (s.children) {
    for (const c of s.children) {
      c.id = kebabCase(c.name);
    }
  }
}

const state = reactive({
  currentPosition: "",
  isNavSticky: false
});

const calculateNavPositions = () => {
  state.sections = [].map.call(
    document.querySelectorAll("[data-section]"),
    (section) => ({
      id: section.id,
      offset: section.getBoundingClientRect().top + window.pageYOffset - 50
    })
  );
};

const adjustNav = () => {
  const sidebar = document.getElementById("sidebar");
  if (sidebar === null) {
    return;
  }

  const scrollTop =
    document.documentElement.scrollTop || document.body.scrollTop;
  const offset = sidebar.getBoundingClientRect().top + window.pageYOffset;
  state.isNavSticky = scrollTop > offset;
  if (!state.sections) {
    calculateNavPositions();
  }

  for (let i = state.sections.length - 1; i >= 0; i--) {
    if (scrollTop > state.sections[i].offset || i === 0) {
      state.currentPosition = state.sections[i].id;
      break;
    }
  }
};

// Lifecycle
onMounted(() => {
  adjustNav();
  window.addEventListener("scroll", adjustNav);
  setTimeout(calculateNavPositions, 1000);
});

onUnmounted(() => {
  window.removeEventListener("scroll", adjustNav);
});
</script>
<style lang="less">
@import "./styles/docs.less";
@import "../styles/style.less";
@import "prismjs/themes/prism.css";
</style>
