import themePresets from '../assets/theme-presets.js';
import WorkspaceProvider from '../workspace/workspace-provider.js';
import {
  applyPreset,
  PRESET_FILE_NAME
} from '../workspace/preset-applier.js';
import {
  PLAYER_OPTIONS_FILE_NAME
} from '../workspace/player-options.js';
import { applyPlayerOptions, recompile } from './editor-controller.js';

/**
 * Controls the theme preset menu of the toolbar.
 *
 * @param {Object} ctx The controller context.
 * @param {Object} ctx.compiler The sass workspace compiler singleton.
 * @param {import('./tab-manager.js').default} ctx.tabManager The tab manager.
 * @param {HTMLElement} ctx.navigation The `tree-view` element.
 * @param {HTMLElement} ctx.editor The `css-editor` element.
 * @param {HTMLElement} ctx.preview The `preview-box` element.
 * @param {HTMLElement} ctx.presetButton The preset `toggle-pane-button`.
 * @param {HTMLElement} ctx.presetList The list element inside the popup.
 * @param {HTMLElement} ctx.presetDialog The preset confirmation dialog.
 */
export default function initPresetController(ctx) {
  let pending = null;

  renderPresetMenu(ctx, (preset) => {
    pending = preset;
    ctx.presetButton.opened = false;
    ctx.presetDialog.toggle();
  });
  ctx.presetDialog.addEventListener('close', (event) => {
    if (event.detail.accepted && pending) {
      applySelectedPreset(ctx, pending);
    }

    pending = null;
  });
}

/**
 * Renders one menu entry per bundled preset.
 *
 * @param {Object} ctx The controller context.
 * @param {Function} onSelect Called with the preset chosen by the user.
 */
function renderPresetMenu({ presetList }, onSelect) {
  themePresets.forEach(preset => {
    const item = document.createElement('li');
    const button = buildPresetOption(preset);

    button.addEventListener('click', () => onSelect(preset));
    item.appendChild(button);
    presetList.appendChild(item);
  });
}

/**
 * Builds the button for a preset entry.
 *
 * @param {Object} preset The preset to render.
 * @returns {HTMLButtonElement} The menu entry button.
 */
function buildPresetOption(preset) {
  const button = document.createElement('button');

  return Object.assign(button, {
    type: 'button',
    className: 'preset-option',
    textContent: preset.name
  });
}

/**
 * Applies a preset to the workspace and propagates the change to the
 * preview, the persisted workspace, the file tree and the open editors.
 *
 * @param {Object} ctx The controller context.
 * @param {Object} preset The preset to apply.
 */
function applySelectedPreset(ctx, preset) {
  const { compiler, navigation } = ctx;
  const presetFile = applyPreset(compiler.workspace, compiler.mainScss, preset);

  registerPresetFile(ctx, presetFile);
  recompile(ctx);
  applyPlayerOptions(ctx);
  WorkspaceProvider.saveWorkspace(compiler.workspace);
  navigation.requestUpdate();
  refreshOpenDocuments(ctx, presetFile);
}

/**
 * Registers the preset file with the sass importer and the tab manager.
 *
 * @param {Object} ctx The controller context.
 * @param {Object} presetFile The preset workspace item.
 */
function registerPresetFile({ compiler, tabManager }, presetFile) {
  compiler.registerFile(PRESET_FILE_NAME, presetFile);

  if (!tabManager.idOf(presetFile)) {
    tabManager.registerItem(presetFile, PRESET_FILE_NAME);
  }
}

/**
 * Refreshes the documents touched by the preset in the editor, if open.
 *
 * @param {Object} ctx The controller context.
 * @param {Object} presetFile The preset workspace item.
 */
function refreshOpenDocuments({ editor, tabManager, compiler }, presetFile) {
  const mainId = tabManager.idOf(compiler.mainScss);
  const options = compiler.workspace
    .find(item => item.name === PLAYER_OPTIONS_FILE_NAME);

  editor.refreshDocument(PRESET_FILE_NAME, presetFile.content);
  editor.refreshDocument(mainId, compiler.mainScss.content);

  if (options) {
    editor.refreshDocument(PLAYER_OPTIONS_FILE_NAME, options.content);
  }
}
