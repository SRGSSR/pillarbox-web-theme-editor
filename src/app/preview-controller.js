import WorkspaceProvider from '../workspace/workspace-provider.js';
import UiState from '../services/ui-state.js';
import { recompile } from './editor-controller.js';

/**
 * The context of the preview controller.
 *
 * @typedef {Object} PreviewControllerContext
 * @property {import('../workspace/sass-workspace-compiler.js')
 *   .SassWorkspaceCompiler} compiler The sass compiler singleton.
 * @property {HTMLElement} preview The `preview-box` element.
 * @property {HTMLElement} navigation The `tree-view` element, so a broken
 * persisted workspace is flagged from the very first compilation.
 * @property {HTMLElement} mediaSearch The `media-search` element.
 * @property {HTMLElement} downloadButton The zip export button.
 * @property {HTMLElement} resetButton The workspace reset button.
 * @property {HTMLElement} resetDialog The reset confirmation dialog.
 */

/**
 * Controls the preview side of the workbench: initial compilation, media
 * search and loading, theme export and workspace reset.
 *
 * @param {PreviewControllerContext} ctx The controller context.
 */
export default function initPreviewController(ctx) {
  recompile(ctx);
  initMediaSearch(ctx);
  initDownload(ctx);
  initReset(ctx);
}

/**
 * Loads searched or pasted medias in the preview and persists the business
 * unit selection.
 *
 * @param {PreviewControllerContext} ctx The controller context.
 */
function initMediaSearch({ mediaSearch, preview }) {
  mediaSearch.bu = UiState.load().bu;
  mediaSearch.addEventListener('media-selected', (event) => {
    preview.mediaSrc = event.detail.urn;
  });
  mediaSearch.addEventListener('bu-changed', (event) => {
    UiState.save({ bu: event.detail.bu });
  });
}

/**
 * Triggers the zip download of the workspace.
 *
 * @param {PreviewControllerContext} ctx The controller context.
 */
function initDownload({ downloadButton, compiler }) {
  downloadButton.addEventListener('click', () => compiler.download());
}

/**
 * Wires the reset button and its confirmation dialog.
 *
 * @param {PreviewControllerContext} ctx The controller context.
 */
function initReset({ resetButton, resetDialog }) {
  resetButton.addEventListener('click', () => resetDialog.toggle());
  resetDialog.addEventListener('close', (event) => {
    if (!event.detail.accepted) return;

    WorkspaceProvider.clear();
    window.location.reload();
  });
}
