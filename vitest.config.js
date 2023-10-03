import { defineConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./test/unit/setup.js"]
  },
  esbuild: {
    loader: "jsx",
    jsxFactory: "h",
    jsxFragment: "Fragment",
    jsxInject: `import { h } from "vue";`
  },
  resolve: {
    alias: {
      "@/": `${path.resolve(__dirname, "src")}/`
    }
  }
});
