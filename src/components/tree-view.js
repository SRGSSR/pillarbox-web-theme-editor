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
 *
 * @part item - The item element.
 * @part item-name - The element displaying the item's name.
 * @part root - The root element of the tree.
 *
 * @cssproperty [--tree-background-color=#333] - The background color of the tree component.
 * @cssproperty [--tree-item-hover-color=#555] - The background color of a tree item when hovered.
 * @cssproperty [--tree-item-selected-color=#666] - The background color of a tree item when selected.
 * @cssproperty [--tree-folder-icon='📁'] - The icon used for folders in the tree.
 * @cssproperty [--tree-file-icon='📄'] - The icon used for files in the tree.
 * @cssproperty [--tree-icon-size=1em] - The size of the icons in the tree.
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
    items: { type: Array }
  };

  constructor() {
    super();
    this.items = [];
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
