<script lang="jsx">
import { createApp } from "vue";
import { watchSize, setupResizeAndScrollEventListeners } from "../utils";
import Menu from "./Menu.vue";

const PortalTarget = {
  name: "vue3-treeselect--portal-target",
  inject: ["instance"],

  watch: {
    "instance.menu.isOpen"(newValue) {
      if (newValue) {
        this.setupHandlers();
      } else {
        this.removeHandlers();
      }
    },

    "instance.menu.placement"() {
      this.updateMenuContainerOffset();
    }
  },

  created() {
    this.controlResizeAndScrollEventListeners = null;
    this.controlSizeWatcher = null;
  },

  mounted() {
    const { instance } = this;

    if (instance.menu.isOpen) {
      this.setupHandlers();
    }
  },

  methods: {
    setupHandlers() {
      this.updateWidth();
      this.updateMenuContainerOffset();
      this.setupControlResizeAndScrollEventListeners();
      this.setupControlSizeWatcher();
    },

    removeHandlers() {
      this.removeControlResizeAndScrollEventListeners();
      this.removeControlSizeWatcher();
    },

    setupControlResizeAndScrollEventListeners() {
      const { instance } = this;
      const $control = instance.getControl();

      // istanbul ignore next
      if (this.controlResizeAndScrollEventListeners) {
        return;
      }

      this.controlResizeAndScrollEventListeners = {
        remove: setupResizeAndScrollEventListeners(
          $control,
          this.updateMenuContainerOffset
        )
      };
    },

    setupControlSizeWatcher() {
      const { instance } = this;
      const $control = instance.getControl();

      // istanbul ignore next
      if (this.controlSizeWatcher) {
        return;
      }

      this.controlSizeWatcher = {
        remove: watchSize($control, () => {
          this.updateWidth();
          this.updateMenuContainerOffset();
        })
      };
    },

    removeControlResizeAndScrollEventListeners() {
      if (!this.controlResizeAndScrollEventListeners) {
        return;
      }

      this.controlResizeAndScrollEventListeners.remove();
      this.controlResizeAndScrollEventListeners = null;
    },

    removeControlSizeWatcher() {
      if (!this.controlSizeWatcher) {
        return;
      }

      this.controlSizeWatcher.remove();
      this.controlSizeWatcher = null;
    },

    updateWidth() {
      const { instance } = this;
      const $portalTarget = this.$el;
      const $control = instance.getControl();
      const controlRect = $control.getBoundingClientRect();

      $portalTarget.style.width = controlRect.width + "px";
    },

    updateMenuContainerOffset() {
      const { instance } = this;
      const $control = instance.getControl();
      const $portalTarget = this.$el;
      const controlRect = $control.getBoundingClientRect();
      const portalTargetRect = $portalTarget.getBoundingClientRect();
      const offsetY =
        instance.menu.placement === "bottom" ? controlRect.height : 0;
      const left = Math.round(controlRect.left - portalTargetRect.left) + "px";
      const top =
        Math.round(controlRect.top - portalTargetRect.top + offsetY) + "px";
      const menuContainerStyle = this.$refs.menu.$refs["menu-container"].style;
      menuContainerStyle.transform = `translate(${left}, ${top})`;
    }
  },

  render() {
    const { instance } = this;
    const portalTargetClass = [
      "vue3-treeselect__portal-target",
      instance.wrapperClass
    ];
    const portalTargetStyle = { zIndex: instance.zIndex };

    return (
      <div
        class={portalTargetClass}
        style={portalTargetStyle}
        data-instance-id={instance.getInstanceId()}>
        <Menu ref="menu" />
      </div>
    );
  },

  unmounted() {
    this.removeHandlers();
  }
};

let placeholder;

export default {
  name: "vue3-treeselect--menu-portal",
  inject: ["instance"],

  data() {
    return {
      el: null
    };
  },

  created() {
    this.portalTarget = null;
  },

  mounted() {
    this.setup();
  },

  unmounted() {
    this.teardown();
  },

  methods: {
    setup() {
      const el = document.createElement("div");
      document.body.appendChild(el);
      this.portalTarget = createApp({
        parent: this,
        ...PortalTarget
      });

      const { instance } = this;
      this.portalTarget.provide("instance", instance);
      this.portalTarget.mount(el);
      this.el = el;
    },

    teardown() {
      this.el.remove();
      this.el.innerHTML = "";

      this.portalTarget = null;
    }
  },

  render() {
    if (!placeholder) {
      placeholder = (
        <div ref="menu" class="vue3-treeselect__menu-placeholder" />
      );
    }

    return placeholder;
  }
};
</script>
