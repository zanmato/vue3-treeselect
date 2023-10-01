module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "plugin:prettier/recommended"
  ],
  plugins: ["prettier"],
  globals: {
    PKG_VERSION: true
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-constant-condition": ["error", { checkLoops: false }],
    "vue/multi-word-component-names": "off",
    "vue/component-definition-name-casing": "off",
    "vue/one-component-per-file": "off",
    "vue/no-v-html": "off",
    curly: "error"
  }
};
