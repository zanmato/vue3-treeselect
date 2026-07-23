// Injected by webpack DefinePlugin at build time.
declare const PKG_VERSION: string;

// Minimal `process.env` shim; `NODE_ENV` is substituted by webpack/vite.
declare const process: {
  env: {
    NODE_ENV?: string;
  };
};

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module "*.less";

declare module "watch-size" {
  export type SizeListener = (size: {
    width: number;
    height: number;
  }) => unknown;
  export default function watchSize(
    el: HTMLElement,
    listener: SizeListener
  ): () => void;
}
