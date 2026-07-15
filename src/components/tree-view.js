import { html, LitElement, unsafeCSS } from 'lit';
import { map } from 'lit/directives/map.js';
import treeViewStyle from './tree-view.scss?inline';
import { partMap } from './component-utils.js';

/**
 * `TreeView` is a custom Lit element that renders a hierarchical tree structure.
 * It is capable of toggling folders open and closed and dispatching an event when
 * a file (non-folder item) is selected.
 *
 * @element tree-view
 *
 * @fires TreeView#selected Dispatched when a non-folder item is clicked, with the item's data as detail.
 *
 * @property {Array<TreeItem>} items Holds the tree structure data.
 * @property {TreeItem|null} selected The currently selected item, highlighted
 * in the tree, or null when nothing is selected. Compared by identity against
 * the elements of `items`.
 * @property {Array<TreeItem>} errors Items in error, marked with a dot in
 * the tree. Folders containing an errored item carry the marker too.
 * Compared by identity against the elements of `items`.
 *
 * @part item - The item element. Carries the additional `selected` token for the selected item
 * and the `error` token for items in error.
 * @part item-name - The element displaying the item's name.
 * @part root - The root element of the tree.
 *
 * @cssproperty [--tree-background-color=transparent] - The background color of the tree component.
 * @cssproperty [--tree-item-hover-color=rgb(255 255 255 / 5%)] - The background color of a tree item when hovered.
 * @cssproperty [--tree-item-selected-color=rgb(111 168 216 / 22%)] - The background color of a tree item when selected.
 * @cssproperty [--tree-folder-icon='folder'] - The glyph name (a string) for closed folders.
 * @cssproperty [--tree-folder-open-icon='folder_open'] - The glyph name for open folders.
 * @cssproperty [--tree-file-icon='draft'] - The glyph name for generic files.
 * @cssproperty [--tree-file-css-icon='css'] - The glyph name for css and scss files.
 * @cssproperty [--tree-file-js-icon='javascript'] - The glyph name for js files.
 * @cssproperty [--tree-icon-font='Material Symbols Outlined'] - The ligature icon font resolving
 * the glyph names. The host document must register the font face; the component only uses it.
 * @cssproperty [--tree-icon-size=1em] - The size of the icons in the tree.
 * @cssproperty [--tree-error-color=#e5534b] - The color of the error marker dot.
 * @cssproperty [--tree-indentation=1.5em] - The indentation size for nested items in the tree.
 *
 * @example
 * // Example of setting `items` for the TreeView component:
 * <tree-view .items=${[
 *   { name: 'Folder 1', type: 'folder', children: [
 *     { name: 'File 1.1', type: 'file' },
 *     { name: 'File 1.2', type: 'file' }
 *   ]},
 *   { name: 'Folder 2', type: 'folder', children: [
 *     { name: 'Folder 2.1', type: 'folder' }
 *   ]}
 * ]}></tree-view>
 */
class TreeView extends LitElement {
  static styles = unsafeCSS(treeViewStyle);

  static properties = {
    items: { type: Array },
    selected: { attribute: false },
    errors: { attribute: false }
  };

  constructor() {
    super();
    this.items = [];
    this.selected = null;
    this.errors = [];
  }

  /**
   * Whether an item, or any of its descendants, is in error. Folders
   * inherit the marker so a problem stays visible while they are closed.
   *
   * @param {TreeItem} item The item to check.
   * @returns {boolean} True when the item should carry the error marker.
   * @private
   */
  #hasError(item) {
    if (this.errors?.includes(item)) return true;

    return item.type === 'folder' &&
      (item.children ?? []).some((child) => this.#hasError(child));
  }

  #handleSelect(e, item) {
    e.stopPropagation();

    if (item.type === 'folder') {
      item.closed = !(item.closed ?? true);
      this.requestUpdate();

      return;
    }

    /**
     * Custom event dispatched by the component as the user selects a non-folder item.
     *
     * @event TreeView#selected
     * @type {CustomEvent}
     * @property {Object} detail The event detail object.
     * @property {TreeItem} detail.item The currently selected item.
     */
    this.dispatchEvent(new CustomEvent('selected', { detail: item }));
  }

  renderItem(item) {
    const itemParts = {
      folder: item.type === 'folder',
      closed: item.closed ?? true,
      scss: item.type === 'scss',
      css: item.type === 'css' || item.type === 'scss',
      js: item.type === 'js',
      selected: item === this.selected,
      error: this.#hasError(item),
      item: true
    };

    return html`
      <li part="${partMap(itemParts)}"
          @click=${(e) => this.#handleSelect(e, item)}>
        <span part="item-name">${item.name}</span>
        ${item.type === 'folder' ? html`${this.renderTree(item.children || [])}` : ''}
      </li>
    `;
  }

  renderTree(items) {
    return html`
      <ul part="root">
        ${map(items, (item) => this.renderItem(item))}
      </ul>
    `;
  }

  render() {
    return html`${this.renderTree(this.items)}`;
  }
}

customElements.define('tree-view', TreeView);

/**
 * Represents a single item in the tree structure, which could be a folder or a file.
 *
 * @typedef {Object} TreeItem
 * @property {string} name The name of the item.
 * @property {string} type The type of the item, typically 'folder' or 'file'.
 * @property {string} content The content of this item.
 * @property {boolean} [closed=true] (Optional) Whether the item is closed or opened (applies only to folders).
 * @property {TreeItem[]} [children] (Optional) Array of child items if this is a folder.
 */
