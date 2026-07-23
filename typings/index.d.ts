import type { ComponentOptionsMixin, DefineComponent } from "vue";

/** Action types of delayed loading. */
export declare const LOAD_ROOT_OPTIONS: "LOAD_ROOT_OPTIONS";
export declare const LOAD_CHILDREN_OPTIONS: "LOAD_CHILDREN_OPTIONS";
export declare const ASYNC_SEARCH: "ASYNC_SEARCH";

/** Library version. */
export declare const VERSION: string;

/** Node id. */
export type NodeId = string | number;

/** A raw option node. */
export interface TreeselectNode {
  /** Used to identify the option within the tree. Its value must be unique across all options. */
  id: NodeId;
  /** Used to display the option. */
  label: string;
  /**
   * Declares a branch node. Sub options.
   * Set to `null` to declare an unloaded branch node (see `loadOptions`).
   */
  children?: TreeselectNode[] | null;
  /** Disable an option? */
  isDisabled?: boolean;
  /** New option marker (used by async search). */
  isNew?: boolean;
  /** Collapse a branch node by default? */
  isDefaultExpanded?: boolean;
  /** Any other custom properties. */
  [key: string]: unknown;
}

/** Types of count number, acceptable values of the `showCountOf` prop. */
export type ShowCountOf =
  | "ALL_CHILDREN"
  | "ALL_DESCENDANTS"
  | "LEAF_CHILDREN"
  | "LEAF_DESCENDANTS";

/** Acceptable values of the `valueConsistsOf` prop. */
export type ValueConsistsOf =
  | "ALL"
  | "BRANCH_PRIORITY"
  | "LEAF_PRIORITY"
  | "ALL_WITH_INDETERMINATE";

/** Acceptable values of the `sortValueBy` prop. */
export type SortValueBy = "ORDER_SELECTED" | "LEVEL" | "INDEX";

/** Acceptable values of the `openDirection` prop. */
export type OpenDirection = "auto" | "top" | "bottom" | "above" | "below";

/** Acceptable values of the `valueFormat` prop. */
export type ValueFormat = "id" | "object";

/** Value of the control. Format depends on the `valueFormat` and `multiple` props. */
export type TreeselectValue =
  | NodeId
  | TreeselectNode
  | (NodeId | TreeselectNode)[]
  | null;

export type LoadOptionsAction =
  | typeof LOAD_ROOT_OPTIONS
  | typeof LOAD_CHILDREN_OPTIONS
  | typeof ASYNC_SEARCH;

export interface LoadOptionsArg {
  /** Indicates which kind of options to load. */
  action: LoadOptionsAction;
  /** The parent node to load children for. Present when `action` is `LOAD_CHILDREN_OPTIONS`. */
  parentNode?: TreeselectNode;
  /** The search query. Present when `action` is `ASYNC_SEARCH`. */
  searchQuery?: string;
  /**
   * Call to signal completion.
   * Call with no argument on success, or with an `Error` (or error message) on failure.
   * When `action` is `ASYNC_SEARCH`, pass the result options as the second argument.
   */
  callback: (error?: Error | string | null, options?: TreeselectNode[]) => void;
  /** The value of the `instanceId` prop. */
  instanceId: NodeId;
}

export type LoadOptionsFn = (arg: LoadOptionsArg) => void | Promise<unknown>;

export interface TreeselectProps {
  /** Whether to allow resetting value even if there are disabled selected nodes. Default: `false`. */
  allowClearingDisabled?: boolean;
  /**
   * When an ancestor node is selected/deselected, whether its disabled descendants should be selected/deselected.
   * You may want to use this in conjunction with `allowClearingDisabled`. Default: `false`.
   */
  allowSelectingDisabledDescendants?: boolean;
  /** Whether the menu should be always open. Default: `false`. */
  alwaysOpen?: boolean;
  /** Append the menu to `<body />`? Default: `false`. */
  appendToBody?: boolean;
  /** Whether to enable async search mode. Default: `false`. */
  async?: boolean;
  /** Automatically focus the component on mount? Default: `false`. */
  autoFocus?: boolean;
  /**
   * Automatically load root options on mount.
   * When set to `false`, root options will be loaded when the menu is opened. Default: `true`.
   */
  autoLoadRootOptions?: boolean;
  /** When user deselects a node, automatically deselect its ancestors. Applies to flat mode only. Default: `false`. */
  autoDeselectAncestors?: boolean;
  /** When user deselects a node, automatically deselect its descendants. Applies to flat mode only. Default: `false`. */
  autoDeselectDescendants?: boolean;
  /** When user selects a node, automatically select its ancestors. Applies to flat mode only. Default: `false`. */
  autoSelectAncestors?: boolean;
  /** When user selects a node, automatically select its descendants. Applies to flat mode only. Default: `false`. */
  autoSelectDescendants?: boolean;
  /** Whether pressing backspace key removes the last item if there is no text input. Default: `true`. */
  backspaceRemoves?: boolean;
  /**
   * Function that processes before clearing all input fields.
   * Return `false` to prevent value from being cleared.
   */
  beforeClearAll?: () => boolean | Promise<boolean>;
  /** Show branch nodes before leaf nodes? Default: `false`. */
  branchNodesFirst?: boolean;
  /** Should cache results of every search request? Default: `true`. */
  cacheOptions?: boolean;
  /** Show an "×" button that resets value? Default: `true`. */
  clearable?: boolean;
  /** Title for the "×" button when `multiple: true`. Default: `"Clear all"`. */
  clearAllText?: string;
  /**
   * Whether to clear the search input after selecting. Use only when `multiple` is `true`.
   * For single-select mode, it always clears the input after selecting regardless of this prop. Default: `false`.
   */
  clearOnSelect?: boolean;
  /** Title for the "×" button. Default: `"Clear value"`. */
  clearValueText?: string;
  /** Whether to close the menu after selecting an option? Use only when `multiple` is `true`. Default: `true`. */
  closeOnSelect?: boolean;
  /**
   * How many levels of branch nodes should be automatically expanded when loaded.
   * Set `Infinity` to make all branch nodes expanded by default. Default: `0`.
   */
  defaultExpandLevel?: number;
  /** Whether pressing delete key removes the last item if there is no text input. Default: `true`. */
  deleteRemoves?: boolean;
  /** Delimiter to use to join multiple values for the hidden field value. Default: `","`. */
  delimiter?: string;
  /** Only show the nodes that match the search value directly, excluding their ancestors. Default: `false`. */
  flattenSearchResults?: boolean;
  /** Prevent branch nodes from being selected? Default: `false`. */
  disableBranchNodes?: boolean;
  /** Disable the control? Default: `false`. */
  disabled?: boolean;
  /** Disable the fuzzy matching functionality? Default: `false`. */
  disableFuzzyMatching?: boolean;
  /**
   * Whether to enable flat mode or not. Non-flat mode (default) means:
   *   - Whenever a branch node gets checked, all its children will be checked too
   *   - Whenever a branch node has all children checked, the branch node itself will be checked too
   * Set `true` to disable this mechanism. Default: `false`.
   */
  flat?: boolean;
  /** Will be passed with all events as the last param. Useful for identifying events origin. */
  instanceId?: string | number;
  /** Joins multiple values into a single form field with the `delimiter` (legacy mode). Default: `false`. */
  joinValues?: boolean;
  /** Limit the display of selected options. The rest will be hidden within the `limitText` string. Default: `Infinity`. */
  limit?: number;
  /** Function that processes the message shown when selected elements pass the defined limit. */
  limitText?: (count: number) => string;
  /** Text displayed when loading options. Default: `"Loading..."`. */
  loadingText?: string;
  /** Used for dynamically loading options. */
  loadOptions?: LoadOptionsFn;
  /** Which node properties to filter on. Default: `["label"]`. */
  matchKeys?: string[];
  /** Sets `maxHeight` style value of the menu. Default: `300`. */
  maxHeight?: number;
  /** The value of the control (`v-model`). */
  modelValue?: TreeselectValue;
  /** Set `true` to allow selecting multiple options (a.k.a., multi-select mode). Default: `false`. */
  multiple?: boolean;
  /** Generates a hidden `<input />` tag with this field name for html forms. */
  name?: string;
  /** Text displayed when a branch node has no children. Default: `"No sub-options."`. */
  noChildrenText?: string;
  /** Text displayed when there are no available options. Default: `"No options available."`. */
  noOptionsText?: string;
  /** Text displayed when there are no matching search results. Default: `"No results found..."`. */
  noResultsText?: string;
  /** Used for normalizing source data. */
  normalizer?: (node: unknown, instanceId: NodeId) => TreeselectNode;
  /**
   * By default (`"auto"`), the menu will open below the control.
   * If there is not enough space, the menu will automatically flip.
   * Use one of the other options to force the direction. Default: `"auto"`.
   */
  openDirection?: OpenDirection;
  /** Whether to automatically open the menu when the control is clicked. Default: `true`. */
  openOnClick?: boolean;
  /** Whether to automatically open the menu when the control is focused. Default: `false`. */
  openOnFocus?: boolean;
  /** Array of available options. */
  options?: TreeselectNode[];
  /** Field placeholder, displayed when there's no value. Default: `"Select..."`. */
  placeholder?: string;
  /** Applies HTML5 required attribute when needed. Default: `false`. */
  required?: boolean;
  /** Text displayed asking user whether to retry loading children options. Default: `"Retry?"`. */
  retryText?: string;
  /** Title for the retry button. Default: `"Click to retry"`. */
  retryTitle?: string;
  /** Enable searching feature? Default: `true`. */
  searchable?: boolean;
  /** Search in ancestor nodes too. Default: `false`. */
  searchNested?: boolean;
  /** Text tip to prompt for async search. Default: `"Type to search..."`. */
  searchPromptText?: string;
  /** Whether to show a children count next to the label of each branch node. Default: `false`. */
  showCount?: boolean;
  /** Used in conjunction with `showCount` to specify which type of count number should be displayed. Default: `"ALL_CHILDREN"`. */
  showCountOf?: ShowCountOf;
  /** Whether to show children count when searching. Fallbacks to the value of `showCount` when not specified. */
  showCountOnSearch?: boolean;
  /** In which order the selected options should be displayed in trigger & sorted in `value` array. Multi-select mode only. Default: `"ORDER_SELECTED"`. */
  sortValueBy?: SortValueBy;
  /** Tab index of the control. Default: `0`. */
  tabIndex?: number;
  /** Which kind of nodes should be included in the `value` array in multi-select mode. Default: `"BRANCH_PRIORITY"`. */
  valueConsistsOf?: ValueConsistsOf;
  /**
   * Format of `modelValue` prop.
   * When set to `"object"`, only `id` & `label` properties are required in each node object. Default: `"id"`.
   */
  valueFormat?: ValueFormat;
  /** z-index of the menu. Default: `999`. */
  zIndex?: number | string;
}

export type TreeselectEmits = {
  /** Emitted when the value changes. */
  "update:modelValue": (value: TreeselectValue, instanceId: NodeId) => void;
  /** Emitted after opening the menu. */
  open: (instanceId: NodeId) => void;
  /** Emitted after closing the menu. */
  close: (value: TreeselectValue, instanceId: NodeId) => void;
  /** Emitted after selecting an option. */
  select: (node: TreeselectNode, instanceId: NodeId) => void;
  /** Emitted after deselecting an option. */
  deselect: (node: TreeselectNode, instanceId: NodeId) => void;
  /** Emitted after the search query changes. */
  "search-change": (searchQuery: string, instanceId: NodeId) => void;
};

export declare const Treeselect: DefineComponent<
  TreeselectProps,
  {},
  {},
  {},
  {},
  ComponentOptionsMixin,
  ComponentOptionsMixin,
  TreeselectEmits
>;

export declare const treeselectMixin: ComponentOptionsMixin;

export default Treeselect;
