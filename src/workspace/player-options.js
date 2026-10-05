export const PLAYER_OPTIONS_FILE_NAME = 'player-options.js';

/**
 * Default content of the player options file: no options beyond the
 * editor's own defaults, plus a short guide for integrators.
 */
export const DEFAULT_PLAYER_OPTIONS_CONTENT = `// Options passed to the preview player. This file is JavaScript:
// edit it like code, the preview player rebuilds when it changes.
// Any video.js / Pillarbox player option works here, for example:
//
//   playbackRates: [0.5, 1, 1.5, 2],
//   controlBar: { volumePanel: { inline: false } },
//
// Reference: https://videojs.com/guides/options/
export default {
};
`;

/**
 * Finds or creates the player options file at the root of the workspace.
 *
 * @param {Array} workspace The workspace tree.
 * @returns {Object} The workspace item holding the player options.
 */
export function ensurePlayerOptionsFile(workspace) {
  let file = workspace.find(item => item.name === PLAYER_OPTIONS_FILE_NAME);

  if (!file) {
    file = {
      name: PLAYER_OPTIONS_FILE_NAME,
      type: 'js',
      content: DEFAULT_PLAYER_OPTIONS_CONTENT
    };
    workspace.push(file);
  }

  return file;
}

/**
 * Evaluates the player options file as an ES module and returns its
 * default export. Rejects when the content is not valid JavaScript or
 * does not export an object.
 *
 * @param {string} content The content of the player options file.
 * @returns {Promise<Object>} The evaluated options object.
 */
export async function evaluatePlayerOptions(content) {
  const url = `data:text/javascript;charset=utf-8,${encodeURIComponent(content)}`;
  const module = await import(/* @vite-ignore */ url);
  const options = module.default;

  if (typeof options !== 'object' || options === null) {
    throw new Error('player options must export a default object');
  }

  return options;
}
