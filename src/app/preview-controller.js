import WorkspaceProvider from '../workspace/workspace-provider.js';
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
 * @property {HTMLElement} downloadButton The zip export button.
 * @property {HTMLElement} resetButton The workspace reset button.
 * @property {HTMLElement} resetDialog The reset confirmation dialog.
 */

/**
 * Controls the preview side of the workbench: initial compilation, theme
 * export and workspace reset.
 *
 * @param {PreviewControllerContext} ctx The controller context.
 */
export default function initPreviewController(ctx) {
  recompile(ctx);
  initDownload(ctx);
  initReset(ctx);
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
