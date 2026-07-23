import WorkspaceProvider from '../workspace/workspace-provider.js';
import UiState from '../services/ui-state.js';

/**
 * @typedef {import('./tab-manager.js').default} TabManager
 * @typedef {import('../components/tree-view.js').TreeItem} TreeItem
 * @typedef {import('../workspace/sass-workspace-compiler.js')
 *   .SassWorkspaceCompiler} SassWorkspaceCompiler
 */

/**
 * The context of the editor controller.
 *
 * @typedef {Object} EditorControllerContext
 * @property {SassWorkspaceCompiler} compiler The sass compiler singleton.
 * @property {TabManager} tabManager The tab manager.
 * @property {HTMLElement} navigation The `tree-view` element.
 * @property {HTMLElement} tabs The `editor-tabs` element.
 * @property {HTMLElement} editor The `css-editor` element.
 * @property {HTMLElement} preview The `preview-box` element.
 * @property {HTMLElement} editorPane The section hosting tabs and editor.
 */

/**
 * Wires the file tree, the tab strip and the code editor together around a
 * {@link TabManager}, and keeps the preview and the persisted workspace in
 * sync with the edits.
 *
 * @param {EditorControllerContext} ctx The controller context.
 */
export default function initEditorController(ctx) {
  initNavigation(ctx);
  initTabs(ctx);
  initEditor(ctx);
  ctx.tabManager.addEventListener('change', () => syncTabs(ctx));
  restoreTabs(ctx);
}

/**
 * Populates the file tree and opens a tab on selection.
 *
 * @param {EditorControllerContext} ctx The controller context.
 */
function initNavigation({ navigation, tabManager, compiler }) {
  navigation.items = compiler.workspace;
  navigation.addEventListener('selected', (e) => tabManager.open(e.detail));
}

/**
 * Routes tab strip interactions to the tab manager.
 *
 * @param {EditorControllerContext} ctx The controller context.
 */
function initTabs({ tabs, tabManager, editor }) {
  tabs.addEventListener('tab-selected', (e) => {
    tabManager.activate(e.detail.id);
  });
  tabs.addEventListener('tab-closed', (e) => {
    editor.closeDocument(e.detail.id);
    tabManager.close(e.detail.id);
  });
}

/**
 * Applies editor changes to the workspace, the preview and local storage.
 *
 * @param {EditorControllerContext} ctx The controller context.
 */
function initEditor(ctx) {
  ctx.editor.addEventListener('value-changed', (e) => {
    applyEdit(ctx, e.detail);
  });
}

/**
 * Writes an edit back to its workspace item and refreshes the preview.
 *
 * @param {EditorControllerContext} ctx The controller context.
 * @param {{id: string, value: string}} detail The change event detail.
 */
function applyEdit(ctx, { id, value }) {
  const item = ctx.tabManager.itemByPath(id);

  if (!item) return;

  item.content = value;
  recompile(ctx);
  WorkspaceProvider.saveWorkspace(ctx.compiler.workspace);
}

/**
 * Recompiles the workspace into the preview, tolerating transient syntax
 * errors while the user is typing. The file behind a compilation error is
 * flagged in the file tree until a compilation succeeds again.
 *
 * Shared across controllers: any context carrying these fields works.
 *
 * @param {Object} ctx The controller context.
 * @param {SassWorkspaceCompiler} ctx.compiler The sass compiler singleton.
 * @param {HTMLElement} ctx.preview The `preview-box` element.
 * @param {HTMLElement} [ctx.navigation] The `tree-view` element, when error
 * markers are wanted.
 */
export function recompile(ctx) {
  try {
    ctx.preview.appliedCss = ctx.compiler.compile();
    setErrors(ctx, []);
  } catch (error) {
    setErrors(ctx, [failingItem(ctx, error)].filter(Boolean));
    console.warn('SCSS compilation failed:', error.message);
  }
}

/**
 * Reflects compilation errors in the file tree, when one is wired.
 *
 * @param {Object} ctx The controller context.
 * @param {HTMLElement} [ctx.navigation] The `tree-view` element.
 * @param {TreeItem[]} errors The workspace items in error.
 */
function setErrors({ navigation }, errors) {
  if (navigation) navigation.errors = errors;
}

/**
 * Resolves the workspace item a sass error points at: the entry file when
 * the error carries no url, otherwise the virtual file behind the import.
 *
 * @param {Object} ctx The controller context.
 * @param {SassWorkspaceCompiler} ctx.compiler The sass compiler singleton.
 * @param {Error} error The sass compilation error.
 * @returns {TreeItem|undefined} The workspace item in error, if resolvable.
 */
function failingItem({ compiler }, error) {
  const url = error.span?.url?.href;

  if (!url) return compiler.mainScss;

  return findItem(compiler.workspace, url.replace('virtual-file://', ''));
}

/**
 * Finds a workspace item by its virtual path.
 *
 * @param {TreeItem[]} items The workspace (sub)tree to search.
 * @param {string} path The virtual path of the item.
 * @param {string} [prefix=''] The path of the subtree, used in recursion.
 * @returns {TreeItem|undefined} The matching item, if any.
 */
function findItem(items, path, prefix = '') {
  return items
    .map((item) => matchItem(item, path, prefix))
    .find(Boolean);
}

/**
 * Matches a single item against a virtual path, descending into folders.
 *
 * @param {TreeItem} item The workspace item to match.
 * @param {string} path The virtual path searched for.
 * @param {string} prefix The path of the item's parent.
 * @returns {TreeItem|undefined} The matching item, if any.
 */
function matchItem(item, path, prefix) {
  const itemPath = [prefix, item.name].filter(Boolean).join('/');

  if (item.type === 'folder') {
    return findItem(item.children ?? [], path, itemPath);
  }

  return itemPath === path ? item : undefined;
}

/**
 * Reflects the tab manager's state into the UI and persists it.
 *
 * @param {EditorControllerContext} ctx The controller context.
 */
function syncTabs(ctx) {
  const { tabManager, tabs, navigation } = ctx;

  tabs.tabs = tabManager.tabEntries;
  tabs.activeId = tabManager.activeId;
  navigation.selected = tabManager.active;
  showActiveDocument(ctx);
  UiState.save({
    openTabs: tabManager.tabEntries.map(tab => tab.id),
    activeTab: tabManager.activeId ?? null
  });
}

/**
 * Opens the active document in the editor, or shows the empty state when
 * no tab remains open.
 *
 * @param {EditorControllerContext} ctx The controller context.
 */
function showActiveDocument({ tabManager, editor, editorPane }) {
  const item = tabManager.active;

  editorPane.classList.toggle('empty', !item);

  if (item) {
    editor.openDocument(tabManager.activeId, item.content);
  }
}

/**
 * Restores the persisted tabs, falling back to the main scss file.
 *
 * @param {EditorControllerContext} ctx The controller context.
 */
function restoreTabs(ctx) {
  const { openTabs, activeTab } = UiState.load();
  const paths = openTabs.length ? openTabs : ['pillarbox.scss'];

  ctx.tabManager.restore(paths, activeTab ?? 'pillarbox.scss');
}
