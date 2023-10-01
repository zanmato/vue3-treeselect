<script>
import { h } from 'vue';
import { kebabCase } from "./utils.js";

export default {
  props: ['name', 'level'],
  setup(props) {
    const tag = props.level === 2 ? 'h2' : 'h1';
    return () => h(tag, { id: kebabCase(props.name), "data-section": "" }, props.name);
  },
};
</script>