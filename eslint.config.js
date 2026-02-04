const { defineConfig } = require("eslint/config");

const pluginPrettier = require("eslint-plugin-prettier");
const pluginVue = require("eslint-plugin-vue");
const globals = require("globals");
const js = require("@eslint/js");

module.exports = defineConfig([
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["src/**/*.{vue,js}"],

    plugins: {
      js: js.configs.recommended,
      prettier: pluginPrettier
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        PKG_VERSION: true
      },

      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },

    rules: {
      "no-console": [
        "error",
        {
          allow: ["warn", "error"]
        }
      ],

      "no-constant-condition": [
        "error",
        {
          checkLoops: false
        }
      ],
      "vue/max-attributes-per-line": "off",
      "vue/multi-word-component-names": "off",
      "vue/component-definition-name-casing": "off",
      "vue/one-component-per-file": "off",
      "vue/no-v-html": "off",
      curly: "error"
    }
  }
]);
