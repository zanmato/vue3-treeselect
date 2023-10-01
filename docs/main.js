import { createApp } from "vue";

import Treeselect from "../src";
import App from "./App.vue";

const app = createApp(App);

function loadComponents(app) {
  const loadContext = (context) => {
    context.keys().forEach((key) => {
      const componentName = key.replace(/^\.\/|\.vue$/g, "");
      const component = context(key).default;
      app.component(componentName, component);
    });
  };

  loadContext(require.context("./components", false, /\.vue$/));
}

loadComponents(app);
app.component("treeselect", Treeselect);

app.mount("#app");
