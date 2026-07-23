/**
 * @typedef {import('../components/tree-view.js').TreeItem} TreeItem
 */

/**
 * Manages the set of open editor tabs over a workspace tree.
 *
 * Tabs hold direct references to workspace {@link TreeItem} objects. Each
 * item is identified by its path in the tree (e.g.
 * `components/_slider.scss`); the path index is kept in side maps so
 * nothing extra is persisted with the workspace.
 *
 * @fires TabManager#change
 */
class TabManager extends EventTarget {
  /**
   * The workspace files by path.
   *
   * @type {Map<string, TreeItem>}
   * @private
   */
  #itemsByPath = new Map();

  /**
   * The reverse index of {@link TabManager##itemsByPath}.
   *
   * @type {Map<TreeItem, string>}
   * @private
   */
  #pathsByItem = new Map();

  /**
   * The open workspace items, in tab order.
   *
   * @type {TreeItem[]}
   */
  tabs = [];

  /**
   * The item shown in the editor, or null when no tab is active.
   *
   * @type {TreeItem|null}
   */
  active = null;

  /**
   * Creates a TabManager over a workspace tree.
   *
   * @param {TreeItem[]} workspace The workspace tree.
   */
  constructor(workspace) {
    super();
    this.#indexItems(workspace, '');
  }

  /**
   * Recursively indexes the workspace files by path.
   *
   * @param {TreeItem[]} items The items to index.
   * @param {string} prefix The path of the containing folder.
   * @private
   */
  #indexItems(items, prefix) {
    items.forEach(item => {
      const path = prefix ? `${prefix}/${item.name}` : item.name;

      if (item.type === 'folder') {
        this.#indexItems(item.children || [], path);
      } else {
        this.registerItem(item, path);
      }
    });
  }

  /**
   * Registers a single new workspace file (e.g. created at runtime).
   *
   * @param {TreeItem} item The workspace item to register.
   * @param {string} path The path identifying the item.
   */
  registerItem(item, path) {
    this.#itemsByPath.set(path, item);
    this.#pathsByItem.set(item, path);
  }

  /**
   * Returns the path identifying the given workspace item.
   *
   * @param {TreeItem} item The workspace item.
   * @returns {string|undefined} The item's path.
   */
  idOf(item) {
    return this.#pathsByItem.get(item);
  }

  /**
   * Returns the workspace item identified by the given path.
   *
   * @param {string} path The path of the item.
   * @returns {TreeItem|undefined} The matching item, if any.
   */
  itemByPath(path) {
    return this.#itemsByPath.get(path);
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
   * @param {TreeItem} item The workspace item to open.
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
    /**
     * Dispatched whenever the set of tabs or the active tab changes.
     *
     * @event TabManager#change
     * @type {CustomEvent}
     */
    this.dispatchEvent(new CustomEvent('change'));
  }
}

export default TabManager;
