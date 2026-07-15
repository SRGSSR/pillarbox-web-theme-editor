import WorkspaceProvider from '../workspace/workspace-provider.js';
import UiState from '../services/ui-state.js';
import { recompile } from './editor-controller.js';

/**
 * Controls the preview side of the workbench: initial compilation, media
 * search and loading, theme export and workspace reset.
 *
 * @param {Object} ctx The controller context.
 * @param {Object} ctx.compiler The sass workspace compiler singleton.
 * @param {HTMLElement} ctx.preview The `preview-box` element.
 * @param {HTMLElement} ctx.navigation The `tree-view` element, so a broken
 * persisted workspace is flagged from the very first compilation.
 * @param {HTMLElement} ctx.mediaSearch The `media-search` element.
 * @param {HTMLElement} ctx.downloadButton The zip export button.
 * @param {HTMLElement} ctx.resetButton The workspace reset button.
 * @param {HTMLElement} ctx.resetDialog The reset confirmation dialog.
 */
export default function initPreviewController(ctx) {
  recompile(ctx);
  wireMediaSearch(ctx);
  wireDownload(ctx);
  wireReset(ctx);
}

/**
 * Loads searched or pasted medias in the preview and persists the business
 * unit selection.
 *
 * @param {Object} ctx The controller context.
 */
function wireMediaSearch({ mediaSearch, preview }) {
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
 * @param {Object} ctx The controller context.
 */
function wireDownload({ downloadButton, compiler }) {
  downloadButton.addEventListener('click', () => compiler.download());
}

/**
 * Wires the reset button and its confirmation dialog.
 *
 * @param {Object} ctx The controller context.
 */
function wireReset({ resetButton, resetDialog }) {
  resetButton.addEventListener('click', () => resetDialog.toggle());
  resetDialog.addEventListener('close', (event) => {
    if (!event.detail.accepted) return;

    WorkspaceProvider.clear();
    window.location.reload();
  });
}
