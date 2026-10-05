import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PLAYER_OPTIONS_CONTENT,
  ensurePlayerOptionsFile,
  evaluatePlayerOptions,
  PLAYER_OPTIONS_FILE_NAME
} from '../../src/workspace/player-options.js';
import themePresets from '../../src/assets/theme-presets.js';

describe('player-options', () => {
  it('creates the options file at the workspace root with defaults', () => {
    const workspace = [];
    const file = ensurePlayerOptionsFile(workspace);

    expect(workspace).toContain(file);
    expect(file.name).toBe(PLAYER_OPTIONS_FILE_NAME);
    expect(file.type).toBe('js');
    expect(file.content).toBe(DEFAULT_PLAYER_OPTIONS_CONTENT);
  });

  it('returns the existing file untouched when present', () => {
    const existing = {
      name: PLAYER_OPTIONS_FILE_NAME,
      type: 'js',
      content: 'export default { volume: 0.5 };'
    };
    const workspace = [existing];

    expect(ensurePlayerOptionsFile(workspace)).toBe(existing);
    expect(workspace).toHaveLength(1);
    expect(existing.content).toContain('volume');
  });

  it('evaluates the default content to an empty object', async() => {
    await expect(evaluatePlayerOptions(DEFAULT_PLAYER_OPTIONS_CONTENT))
      .resolves.toEqual({});
  });

  it('evaluates nested option structures', async() => {
    const content =
      'export default { controlBar: { volumePanel: { inline: false } } };';

    await expect(evaluatePlayerOptions(content))
      .resolves.toEqual({ controlBar: { volumePanel: { inline: false } } });
  });

  it('rejects invalid javascript', async() => {
    await expect(evaluatePlayerOptions('export default {')).rejects.toThrow();
  });

  it('rejects non-object default exports', async() => {
    await expect(evaluatePlayerOptions('export default 42;'))
      .rejects.toThrow(/object/);
  });

  it.each(themePresets)('evaluates the "$name" preset options', async(preset) => {
    expect(preset.options).toBeTruthy();
    await expect(evaluatePlayerOptions(preset.options))
      .resolves.toBeTypeOf('object');
  });
});
