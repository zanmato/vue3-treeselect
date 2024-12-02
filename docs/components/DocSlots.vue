<template>
  <table class="striped">
    <thead>
      <tr>
        <th class="name">Name</th>
        <th>Props</th>
        <th class="desc">Description</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="slot in slots" :key="slot.name">
        <td>
          <strong>{{ slot.name }}</strong>
        </td>
        <td v-html="slot.props" />
        <td v-html="slot.description" />
      </tr>
    </tbody>
  </table>
</template>

<script>
import { link, makePropList } from "./utils";

export default {
  data: () => ({
    slots: [
      {
        name: "option-label",
        props: makePropList([
          "node",
          "shouldShowCount",
          "count",
          "labelClassName",
          "countClassName"
        ]),
        description: `Slot for custom option label template. See ${link(
          "#customize-option-label"
        )} for detailed information.`
      },
      {
        name: "value-label",
        props: makePropList(["node"]),
        description: `Slot for custom value label template. See ${link(
          "#customize-value-label"
        )} for detailed information.`
      },
      {
        name: "control-arrow",
        props: makePropList([
          "showArrow",
          "menuIsOpen",
          "isLoading",
          "arrowClass"
        ]),
        description: `Slot for custom control arrow template. See ${link(
          "#customize-control-arrow"
        )} for detailed information.`
      },
      {
        name: "control-icon",
        props: "-",
        description: `Slot showed in the control start position. See ${link(
          "#customize-control-icon"
        )} for detailed information.`
      },
      {
        name: "control-x",
        props: makePropList(["xClass"]),
        description: `Slot for custom control x template. See ${link(
          "#customize-control-x"
        )} for detailed information.`
      },
      {
        name: "search-prompt-tip",
        props: makePropList(["text"]),
        description: `Slot for custom search prompt tip. See ${link(
          "#customize-async-searching-tip"
        )} for detailed information.`
      },
      {
        name: "loading-tip",
        props: makePropList(["text"]),
        description: `Slot for custom loading tip`
      },
      {
        name: "no-available-options-tip",
        props: makePropList(["text"]),
        description: `Slot for custom no available options tip`
      },
      {
        name: "no-results-options-tip",
        props: makePropList(["text"]),
        description: `Slot for custom no results options tip`
      },
      {
        name: "root-error-tip",
        props: makePropList([
          "loadingError",
          "handleRetry",
          "retryTitle",
          "retryText"
        ]),
        description: `Slot for custom root error tip`
      },
      {
        name: "search-loading-error-tip",
        props: makePropList([
          "loadingError",
          "handleRetry",
          "retryTitle",
          "retryText"
        ]),
        description: `Slot for custom search loading error tip`
      },
      {
        name: "before-list",
        props: makePropList(["toggleMenu"]),
        description: `Slot showed before the menu list.`
      },
      {
        name: "after-list",
        props: makePropList(["toggleMenu"]),
        description: `Slot showed after the menu list.`
      }
    ]
  })
};
</script>
