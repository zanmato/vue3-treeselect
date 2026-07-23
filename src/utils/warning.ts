import { noop } from "./noop";

type Warning = (checker: () => boolean, complainer: () => unknown) => void;

export const warning: Warning =
  process.env.NODE_ENV === "production"
    ? /* istanbul ignore next */ noop
    : function warning(checker, complainer) {
        if (!checker()) {
          const message = (["[Vue3-Treeselect Warning]"] as unknown[]).concat(
            complainer()
          );
          console.error(...message);
        }
      };
