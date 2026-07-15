import { ensurePlayerOptionsFile } from './player-options.js';

export const PRESET_FILE_NAME = '_preset.scss';

/**
 * Applies a theme preset to the workspace: writes the preset content into
 * the `_preset.scss` file at the workspace root (creating it if needed),
 * makes sure the main scss file imports it last, so the preset overrides
 * the default theme, and writes the preset's player options file.
 *
 * @param {Array} workspace The workspace tree.
 * @param {Object} main The main scss file of the workspace.
 * @param {{content: string, options?: string}} preset The preset to apply.
 * @returns {Object} The workspace item holding the preset.
 */
export function applyPreset(workspace, main, preset) {
  const presetFile = ensurePresetFile(workspace);

  presetFile.content = preset.content;
  ensurePresetImport(main);

  if (preset.options) {
    ensurePlayerOptionsFile(workspace).content = preset.options;
  }

  return presetFile;
}

/**
 * Finds or creates the preset file at the root of the workspace.
 *
 * @param {Array} workspace The workspace tree.
 * @returns {Object} The preset workspace item.
 */
function ensurePresetFile(workspace) {
  let file = workspace.find(item => item.name === PRESET_FILE_NAME);

  if (!file) {
    file = { name: PRESET_FILE_NAME, type: 'scss', content: '' };
    workspace.push(file);
  }

  return file;
}

/**
 * Injects `@import "preset";` as the last statement of the
 * main file's top-level block.
 *
 * @param {Object} main The main scss file of the workspace.
 */
function ensurePresetImport(main) {
  if (/@import\s+["']preset["']/.test(main.content)) return;

  const closing = main.content.lastIndexOf('}');
  const importLine = '  @import "preset";\n';

  main.content = closing === -1
    ? `${main.content}\n${importLine}`
    : main.content.slice(0, closing) + importLine + main.content.slice(closing);
}
