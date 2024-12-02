<script lang="jsx">
import { onLeftClick, isPromise } from "../utils";
import SingleValue from "./SingleValue.vue";
import MultiValue from "./MultiValue.vue";
import DeleteIcon from "./icons/Delete.vue";
import ArrowIcon from "./icons/Arrow.vue";

export default {
  name: "vue3-treeselect--control",
  inject: ["instance"],

  computed: {
    /* eslint-disable valid-jsdoc */
    /**
     * Should show the "×" button that resets value?
     * @return {boolean}
     */
    shouldShowX() {
      const { instance } = this;

      return (
        instance.clearable &&
        !instance.disabled &&
        instance.hasValue &&
        (this.hasUndisabledValue || instance.allowClearingDisabled)
      );
    },

    /**
     * Should show the arrow button that toggles menu?
     * @return {boolean}
     */
    shouldShowArrow() {
      const { instance } = this;

      if (!instance.alwaysOpen) {
        return true;
      }
      // Even with `alwaysOpen: true`, sometimes the menu is still closed,
      // e.g. when the control is disabled.
      return !instance.menu.isOpen;
    },

    /**
     * Has any undisabled option been selected?
     * @type {boolean}
     */
    hasUndisabledValue() {
      const { instance } = this;

      return (
        instance.hasValue &&
        instance.internalValue.some((id) => !instance.getNode(id).isDisabled)
      );
    }
    /* eslint-enable valid-jsdoc */
  },

  methods: {
    renderX() {
      const { instance } = this;
      const title = instance.multiple
        ? instance.clearAllText
        : instance.clearValueText;

      if (!this.shouldShowX) {
        return null;
      }

      const xClass = {
        "vue3-treeselect__x": true
      };

      const customXRenderer = instance.$slots["control-x"];

      return (
        <div
          class="vue3-treeselect__x-container"
          title={title}
          onMousedown={this.handleMouseDownOnX}>
          {customXRenderer ? (
            customXRenderer({ xClass })
          ) : (
            <DeleteIcon class={xClass} />
          )}
        </div>
      );
    },

    renderArrow() {
      const { instance } = this;
      const arrowClass = {
        "vue3-treeselect__control-arrow": true,
        "vue3-treeselect__control-arrow--rotated": instance.menu.isOpen
      };

      const customArrowRenderer = instance.$slots["control-arrow"];

      if (customArrowRenderer) {
        return customArrowRenderer({
          showArrow: this.shouldShowArrow,
          menuIsOpen: instance.menu.isOpen,
          isLoading: instance.rootOptionsStates.isLoading,
          arrowClass
        });
      }

      if (!this.shouldShowArrow) {
        return null;
      }

      return <ArrowIcon class={arrowClass} />;
    },

    renderArrowContainer() {
      return (
        <div
          class="vue3-treeselect__control-arrow-container"
          onMousedown={this.handleMouseDownOnArrow}>
          {this.renderArrow()}
        </div>
      );
    },

    handleMouseDownOnX: onLeftClick(function handleMouseDownOnX(evt) {
      /**
       * We don't use async/await here because we don't want
       * to rely on Babel polyfill or regenerator runtime.
       * See: https://babeljs.io/docs/plugins/transform-regenerator/
       * We also don't want to assume there is a global `Promise`
       * class, since we are targeting to support IE9 without the
       * need of any polyfill.
       */

      evt.stopPropagation();
      evt.preventDefault();

      const { instance } = this;
      const result = instance.beforeClearAll();
      const handler = (shouldClear) => {
        if (shouldClear) {
          instance.clear();
        }
      };

      if (isPromise(result)) {
        // The handler will be called async.
        result.then(handler);
      } else {
        // Keep the same behavior here.
        setTimeout(() => handler(result), 0);
        // Also, note that IE9 requires:
        //   setTimeout(() => fn(...args), delay)
        // Instead of:
        //   setTimeout(fn, delay, ...args)
      }
    }),

    handleMouseDownOnArrow: onLeftClick(function handleMouseDownOnArrow(evt) {
      evt.preventDefault();
      evt.stopPropagation();

      const { instance } = this;

      // Focus the input or prevent blurring.
      instance.focusInput();
      instance.toggleMenu();
    }),

    // This is meant to be called by child `<Value />` component.
    renderValueContainer(children) {
      return <div class="vue3-treeselect__value-container">{children}</div>;
    }
  },

  render() {
    const { instance } = this;
    const ValueContainer = instance.single ? SingleValue : MultiValue;

    const customIconRenderer = instance.$slots["control-icon"];

    const controlClass = {
      "vue3-treeselect__control": true,
      "vue3-treeselect__control--has-icon": customIconRenderer
    };

    return (
      <div class={controlClass} onMousedown={instance.handleMouseDown}>
        <ValueContainer ref="value-container" />
        {customIconRenderer && (
          <div class="vue3-treeselect__control-icon-container">
            {customIconRenderer()}
          </div>
        )}
        {this.renderX()}
        {this.renderArrowContainer()}
      </div>
    );
  }
};
</script>
