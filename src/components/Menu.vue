<script lang="jsx">
import { Transition } from "vue";
import { MENU_BUFFER } from "../constants";
import { watchSize, setupResizeAndScrollEventListeners } from "../utils";
import Option from "./Option.vue";
import Tip from "./Tip.vue";

const directionMap = {
  top: "top",
  bottom: "bottom",
  above: "top",
  below: "bottom"
};

export default {
  name: "vue3-treeselect--menu",
  inject: ["instance"],

  computed: {
    menuStyle() {
      const { instance } = this;

      return {
        maxHeight: instance.maxHeight + "px"
      };
    },

    menuContainerStyle() {
      const { instance } = this;

      return {
        zIndex: instance.appendToBody ? null : instance.zIndex
      };
    }
  },

  watch: {
    "instance.menu.isOpen"(newValue) {
      if (newValue) {
        // In case `openMenu()` is just called and the menu is not rendered yet.
        this.$nextTick(this.onMenuOpen);
      } else {
        this.onMenuClose();
      }
    }
  },

  created() {
    this.menuSizeWatcher = null;
    this.menuResizeAndScrollEventListeners = null;
  },

  mounted() {
    const { instance } = this;

    if (instance.menu.isOpen) {
      this.$nextTick(this.onMenuOpen);
    }
  },

  unmounted() {
    this.onMenuClose();
  },

  methods: {
    renderMenu() {
      const { instance } = this;

      if (!instance.menu.isOpen) {
        return null;
      }

      return (
        <div
          ref="menu"
          class="vue3-treeselect__menu"
          onMousedown={instance.handleMouseDown}
          style={this.menuStyle}
          key={instance.menu.renderKey}>
          {this.renderBeforeList()}
          {instance.async
            ? this.renderAsyncSearchMenuInner()
            : instance.localSearch.active
            ? this.renderLocalSearchMenuInner()
            : this.renderNormalMenuInner()}
          {this.renderAfterList()}
        </div>
      );
    },

    renderBeforeList() {
      const { instance } = this;
      const beforeListRenderer = instance.$slots["before-list"];

      return beforeListRenderer
        ? beforeListRenderer({
            toggleMenu: instance.toggleMenu
          })
        : null;
    },

    renderAfterList() {
      const { instance } = this;
      const afterListRenderer = instance.$slots["after-list"];

      return afterListRenderer
        ? afterListRenderer({
            toggleMenu: instance.toggleMenu
          })
        : null;
    },

    renderNormalMenuInner() {
      const { instance } = this;

      if (instance.rootOptionsStates.isLoading) {
        return this.renderLoadingOptionsTip();
      } else if (instance.rootOptionsStates.loadingError) {
        return this.renderLoadingRootOptionsErrorTip();
      } else if (
        instance.rootOptionsStates.isLoaded &&
        instance.forest.normalizedOptions.length === 0
      ) {
        return this.renderNoAvailableOptionsTip();
      } else {
        return this.renderOptionList();
      }
    },

    renderLocalSearchMenuInner() {
      const { instance } = this;

      if (instance.rootOptionsStates.isLoading) {
        return this.renderLoadingOptionsTip();
      } else if (instance.rootOptionsStates.loadingError) {
        return this.renderLoadingRootOptionsErrorTip();
      } else if (
        instance.rootOptionsStates.isLoaded &&
        instance.forest.normalizedOptions.length === 0
      ) {
        return this.renderNoAvailableOptionsTip();
      } else if (instance.localSearch.noResults) {
        return this.renderNoResultsTip();
      } else {
        return this.renderOptionList();
      }
    },

    renderAsyncSearchMenuInner() {
      const { instance } = this;
      const isSearching = instance.trigger.searchQuery !== "";

      if (!isSearching && !instance.options) {
        return this.renderSearchPromptTip();
      }

      if (isSearching) {
        const entry = instance.getRemoteSearchEntry();
        const shouldShowNoResultsTip =
          entry.isLoaded && entry.options.length === 0;

        if (entry.isLoading) {
          return this.renderLoadingOptionsTip();
        } else if (entry.loadingError) {
          return this.renderAsyncSearchLoadingErrorTip();
        } else if (shouldShowNoResultsTip) {
          return this.renderNoResultsTip();
        }
      }

      return this.renderOptionList();
    },

    renderOptionList() {
      const { instance } = this;

      return (
        <div class="vue3-treeselect__list">
          {instance.forest.normalizedOptions.map((rootNode) => (
            <Option node={rootNode} key={rootNode.id} />
          ))}
        </div>
      );
    },

    renderSearchPromptTip() {
      const { instance } = this;
      const customSearchPromptRenderer = instance.$slots["search-prompt-tip"];

      if (customSearchPromptRenderer) {
        return (
          <div class="vue3-treeselect__tip">
            {customSearchPromptRenderer({
              text: instance.searchPromptText
            })}
          </div>
        );
      }

      return (
        <Tip type="search-prompt" icon="warning">
          {instance.searchPromptText}
        </Tip>
      );
    },

    renderLoadingOptionsTip() {
      const { instance } = this;
      const customLoadingRenderer = instance.$slots["loading-tip"];

      if (customLoadingRenderer) {
        return (
          <div class="vue3-treeselect__tip">
            {customLoadingRenderer({
              text: instance.loadingText
            })}
          </div>
        );
      }

      return (
        <Tip type="loading" icon="loader">
          {instance.loadingText}
        </Tip>
      );
    },

    renderLoadingRootOptionsErrorTip() {
      const { instance } = this;
      const customErrorRenderer = instance.$slots["root-error-tip"];

      if (customErrorRenderer) {
        return (
          <div class="vue3-treeselect__tip">
            {customErrorRenderer({
              loadingError: instance.rootOptionsStates.loadingError,
              handleRetry: instance.loadRootOptions,
              retryTitle: instance.retryTitle,
              retryText: instance.retryText
            })}
          </div>
        );
      }

      return (
        <Tip type="error" icon="error">
          {instance.rootOptionsStates.loadingError}
          <a
            class="vue3-treeselect__retry"
            onClick={instance.loadRootOptions}
            title={instance.retryTitle}>
            {instance.retryText}
          </a>
        </Tip>
      );
    },

    renderAsyncSearchLoadingErrorTip() {
      const { instance } = this;
      const entry = instance.getRemoteSearchEntry();

      // TODO: retryTitle?

      const customErrorRenderer = instance.$slots["search-loading-error-tip"];

      if (customErrorRenderer) {
        return (
          <div class="vue3-treeselect__tip">
            {customErrorRenderer({
              loadingError: entry.loadingError,
              handleRetry: instance.handleRemoteSearch,
              retryTitle: instance.retryTitle,
              retryText: instance.retryText
            })}
          </div>
        );
      }

      return (
        <Tip type="error" icon="error">
          {entry.loadingError}
          <a
            class="vue3-treeselect__retry"
            onClick={instance.handleRemoteSearch}
            title={instance.retryTitle}>
            {instance.retryText}
          </a>
        </Tip>
      );
    },

    renderNoAvailableOptionsTip() {
      const { instance } = this;
      const customNoAvailableRenderer =
        instance.$slots["no-available-options-tip"];

      if (customNoAvailableRenderer) {
        return (
          <div class="vue3-treeselect__tip">
            {customNoAvailableRenderer({
              text: instance.noOptionsText
            })}
          </div>
        );
      }

      return (
        <Tip type="no-options" icon="warning">
          {instance.noOptionsText}
        </Tip>
      );
    },

    renderNoResultsTip() {
      const { instance } = this;
      const customNoResultsRenderer = instance.$slots["no-results-options-tip"];

      if (customNoResultsRenderer) {
        return (
          <div class="vue3-treeselect__tip">
            {customNoResultsRenderer({
              text: instance.noResultsText
            })}
          </div>
        );
      }

      return (
        <Tip type="no-results" icon="warning">
          {instance.noResultsText}
        </Tip>
      );
    },

    onMenuOpen() {
      this.adjustMenuOpenDirection();
      this.setupMenuSizeWatcher();
      this.setupMenuResizeAndScrollEventListeners();
    },

    onMenuClose() {
      this.removeMenuSizeWatcher();
      this.removeMenuResizeAndScrollEventListeners();
    },

    adjustMenuOpenDirection() {
      const { instance } = this;
      if (!instance.menu.isOpen) {
        return;
      }

      const $menu = instance.getMenu();
      const $control = instance.getControl();
      const menuRect = $menu.getBoundingClientRect();
      const controlRect = $control.getBoundingClientRect();
      const menuHeight = menuRect.height;
      const viewportHeight = window.innerHeight;
      const spaceAbove = controlRect.top;
      const spaceBelow = window.innerHeight - controlRect.bottom;
      const isControlInViewport =
        (controlRect.top >= 0 && controlRect.top <= viewportHeight) ||
        (controlRect.top < 0 && controlRect.bottom > 0);
      const hasEnoughSpaceBelow = spaceBelow > menuHeight + MENU_BUFFER;
      const hasEnoughSpaceAbove = spaceAbove > menuHeight + MENU_BUFFER;

      if (!isControlInViewport) {
        instance.closeMenu();
      } else if (instance.openDirection !== "auto") {
        instance.menu.placement = directionMap[instance.openDirection];
      } else if (hasEnoughSpaceBelow || !hasEnoughSpaceAbove) {
        instance.menu.placement = "bottom";
      } else {
        instance.menu.placement = "top";
      }
    },

    setupMenuSizeWatcher() {
      const { instance } = this;
      const $menu = instance.getMenu();

      // istanbul ignore next
      if (this.menuSizeWatcher) {
        return;
      }

      this.menuSizeWatcher = {
        remove: watchSize($menu, this.adjustMenuOpenDirection)
      };
    },

    setupMenuResizeAndScrollEventListeners() {
      const { instance } = this;
      const $control = instance.getControl();

      // istanbul ignore next
      if (this.menuResizeAndScrollEventListeners) {
        return;
      }

      this.menuResizeAndScrollEventListeners = {
        remove: setupResizeAndScrollEventListeners(
          $control,
          this.adjustMenuOpenDirection
        )
      };
    },

    removeMenuSizeWatcher() {
      if (!this.menuSizeWatcher) {
        return;
      }

      this.menuSizeWatcher.remove();
      this.menuSizeWatcher = null;
    },

    removeMenuResizeAndScrollEventListeners() {
      if (!this.menuResizeAndScrollEventListeners) {
        return;
      }

      this.menuResizeAndScrollEventListeners.remove();
      this.menuResizeAndScrollEventListeners = null;
    }
  },

  render() {
    return (
      <div
        ref="menu-container"
        class="vue3-treeselect__menu-container"
        style={this.menuContainerStyle}>
        <Transition name="vue3-treeselect__menu--transition">
          {this.renderMenu()}
        </Transition>
      </div>
    );
  }
};
</script>
