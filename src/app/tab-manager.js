/**
 * Manages the set of open editor tabs over a workspace tree.
 *
 * Tabs hold direct references to workspace `TreeItem` objects. Each item is
 * identified by its path in the tree (e.g. `components/_slider.scss`); paths
 * are kept in a side map so nothing extra is persisted with the workspace.
 *
 * Dispatches a `change` event whenever the set of tabs or the active tab
 * changes.
 */
class TabManager extends EventTarget {
  /**
   * Paths of the workspace files, keyed by item reference.
   *
   * @type {Map<import('../components/tree-view.js').TreeItem, string>}
   * @private
   */
  #paths = new Map();

  /**
   * Creates a TabManager over a workspace tree.
   *
   * @param {Array} workspace The workspace tree (array of TreeItem).
   */
  constructor(workspace) {
    super();
    this.tabs = [];
    this.active = null;
    this.#indexItems(workspace, '');
  }

  /**
   * Recursively indexes the workspace files by path.
   *
   * @param {Array} items The items to index.
   * @param {string} prefix The path of the containing folder.
   * @private
   */
  #indexItems(items, prefix) {
    items.forEach(item => {
      const path = prefix ? `${prefix}/${item.name}` : item.name;

      if (item.type === 'folder') {
        this.#indexItems(item.children || [], path);
      } else {
        this.#paths.set(item, path);
      }
    });
  }

  /**
   * Registers a single new workspace file (e.g. created at runtime).
   *
   * @param {Object} item The workspace item to register.
   * @param {string} path The path identifying the item.
   */
  registerItem(item, path) {
    this.#paths.set(item, path);
  }

  /**
   * Returns the path identifying the given workspace item.
   *
   * @param {Object} item The workspace item.
   * @returns {string|undefined} The item's path.
   */
  idOf(item) {
    return this.#paths.get(item);
  }

  /**
   * Returns the workspace item identified by the given path.
   *
   * @param {string} path The path of the item.
   * @returns {Object|undefined} The matching item, if any.
   */
  itemByPath(path) {
    for (const [item, itemPath] of this.#paths) {
      if (itemPath === path) return item;
    }

    return undefined;
  }

  /**
   * The open tabs as `{id, name}` entries, ready for display.
   *
   * @returns {Array<{id: string, name: string}>} The tab entries.
   */
  get tabEntries() {
    return this.tabs.map(item => ({
      id: this.idOf(item),
      name: item.name
    }));
  }

  /**
   * The id of the active tab, if any.
   *
   * @returns {string|undefined} The active tab's id.
   */
  get activeId() {
    return this.active ? this.idOf(this.active) : undefined;
  }

  /**
   * Opens a tab for the given item (if not already open) and activates it.
   *
   * @param {Object} item The workspace item to open.
   */
  open(item) {
    if (!this.tabs.includes(item)) {
      this.tabs = [...this.tabs, item];
    }

    this.activate(this.idOf(item));
  }

  /**
   * Activates the tab identified by the given id.
   *
   * @param {string} id The id of the tab to activate.
   */
  activate(id) {
    this.active = this.itemByPath(id) ?? null;
    this.#notify();
  }

  /**
   * Closes the tab identified by the given id. When the active tab is
   * closed, the nearest remaining tab becomes active.
   *
   * @param {string} id The id of the tab to close.
   */
  close(id) {
    const item = this.itemByPath(id);
    const index = this.tabs.indexOf(item);

    this.tabs = this.tabs.filter(tab => tab !== item);

    if (this.active === item) {
      this.#activateNeighbour(index);
    } else {
      this.#notify();
    }
  }

  /**
   * Restores a set of tabs from persisted paths, dropping stale ones.
   *
   * @param {string[]} paths The paths of the tabs to open.
   * @param {string} activePath The path of the tab to activate.
   */
  restore(paths, activePath) {
    this.tabs = paths.map(path => this.itemByPath(path)).filter(Boolean);

    const active = this.itemByPath(activePath);

    this.active = this.tabs.includes(active) ? active : this.tabs[0] ?? null;
    this.#notify();
  }

  /**
   * Activates the tab nearest to the given position, if any remain.
   *
   * @param {number} index The position of the tab that was just closed.
   * @private
   */
  #activateNeighbour(index) {
    this.active = this.tabs[Math.min(index, this.tabs.length - 1)] ?? null;
    this.#notify();
  }

  /**
   * Dispatches the `change` event.
   *
   * @private
   */
  #notify() {
    this.dispatchEvent(new CustomEvent('change'));
  }
}

export default TabManager;
