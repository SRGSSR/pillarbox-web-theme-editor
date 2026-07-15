import UiState from '../services/ui-state.js';

/**
 * Controls the workbench layout: sidebar visibility, preview visibility and
 * the dock position (right or bottom) of the preview panel. Every change is
 * persisted through {@link UiState}.
 *
 * @param {Object} ctx The controller context.
 * @param {HTMLElement} ctx.split The main `resizable-split-view` element.
 * @param {HTMLElement} ctx.sidebar The sidebar element hosting the file tree.
 * @param {HTMLElement} ctx.sidebarButton The sidebar toggle button.
 * @param {HTMLElement} ctx.previewButton The preview toggle button.
 * @param {HTMLElement} ctx.dockButton The dock position toggle button.
 */
export default function initLayoutController(ctx) {
  applyLayout(ctx, UiState.load());
  wireToggles(ctx);
  syncGlyphs(ctx);
}

/**
 * Applies a persisted layout state to the workbench.
 *
 * @param {Object} ctx The controller context.
 * @param {Object} state The persisted UI state.
 */
function applyLayout({ split, sidebar }, state) {
  split.orientation = toOrientation(state.previewDock);
  split.collapsed = !state.previewVisible;
  sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
}

/**
 * Sets a button's ligature icon.
 *
 * @param {HTMLElement} button The button hosting the icon span.
 * @param {string} name The Material Symbols glyph name.
 */
function setGlyph(button, name) {
  button.querySelector('.material-symbols-outlined').textContent = name;
}

/**
 * Reflects the current layout in the toggle button icons: the sidebar and
 * preview buttons show their state, the dock button shows its target.
 *
 * @param {Object} ctx The controller context.
 */
function syncGlyphs(ctx) {
  const { sidebarButton, previewButton, dockButton, split, sidebar } = ctx;
  const sidebarCollapsed = sidebar.classList.contains('collapsed');
  const toBottom = split.orientation !== 'vertical';

  setGlyph(sidebarButton, sidebarCollapsed ? 'left_panel_open' : 'left_panel_close');
  setGlyph(previewButton, split.collapsed ? 'visibility_off' : 'visibility');

  // dock_to_left is picked by what it draws — the docked pane on the
  // right — not by its name; dock_to_right draws the pane on the left.
  setGlyph(dockButton, toBottom ? 'dock_to_bottom' : 'dock_to_left');
}

/**
 * Maps a dock position to a split view orientation.
 *
 * @param {('right'|'bottom')} dock The preview dock position.
 * @returns {('horizontal'|'vertical')} The split view orientation.
 */
function toOrientation(dock) {
  return dock === 'bottom' ? 'vertical' : 'horizontal';
}

/**
 * Wires the three layout toggle buttons.
 *
 * @param {Object} ctx The controller context.
 */
function wireToggles(ctx) {
  const { sidebarButton, previewButton, dockButton, split, sidebar } = ctx;

  sidebarButton.addEventListener('click', () => {
    const collapsed = sidebar.classList.toggle('collapsed');

    UiState.save({ sidebarCollapsed: collapsed });
    syncGlyphs(ctx);
  });
  previewButton.addEventListener('click', () => {
    split.collapsed = !split.collapsed;
    UiState.save({ previewVisible: !split.collapsed });
    syncGlyphs(ctx);
  });
  dockButton.addEventListener('click', () => {
    toggleDock(split);
    syncGlyphs(ctx);
  });
}

/**
 * Switches the preview dock between the right and the bottom of the editor.
 *
 * @param {HTMLElement} split The main split view element.
 */
function toggleDock(split) {
  const toBottom = split.orientation !== 'vertical';

  split.orientation = toBottom ? 'vertical' : 'horizontal';
  UiState.save({ previewDock: toBottom ? 'bottom' : 'right' });
}
