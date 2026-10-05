import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyPreset,
  PRESET_FILE_NAME
} from '../../src/workspace/preset-applier.js';
import {
  ensurePlayerOptionsFile,
  PLAYER_OPTIONS_FILE_NAME
} from '../../src/workspace/player-options.js';
import { SassWorkspaceCompiler } from '../../src/workspace/sass-workspace-compiler.js';
import themePresets from '../../src/assets/theme-presets.js';

const MAIN_CONTENT = `.pillarbox-js {
  @import "components/control";
}
`;

describe('preset-applier', () => {
  let workspace, main;

  beforeEach(() => {
    main = { name: 'pillarbox.scss', type: 'scss', content: MAIN_CONTENT };
    workspace = [
      {
        name: 'components',
        type: 'folder',
        children: [
          {
            name: '_control.scss',
            type: 'scss',
            content: '.vjs-control { color: red; }'
          }
        ]
      },
      main
    ];
  });

  it('creates the preset file at the workspace root', () => {
    const preset = { content: '.vjs-control { color: blue; }' };
    const presetFile = applyPreset(workspace, main, preset);

    expect(workspace).toContain(presetFile);
    expect(presetFile.name).toBe(PRESET_FILE_NAME);
    expect(presetFile.type).toBe('scss');
    expect(presetFile.content).toBe(preset.content);
  });

  it('imports the preset last in the main file', () => {
    applyPreset(workspace, main, { content: '// preset' });

    const importIndex = main.content.indexOf('@import "preset";');
    const controlIndex = main.content.indexOf('@import "components/control";');

    expect(importIndex).toBeGreaterThan(controlIndex);
    expect(importIndex).toBeLessThan(main.content.lastIndexOf('}'));
  });

  it('is idempotent when applied multiple times', () => {
    const first = applyPreset(workspace, main, { content: '// first' });
    const second = applyPreset(workspace, main, { content: '// second' });

    expect(second).toBe(first);
    expect(second.content).toBe('// second');
    expect(main.content.match(/@import "preset";/g).length).toBe(1);
    expect(workspace.filter(i => i.name === PRESET_FILE_NAME).length).toBe(1);
  });

  it('writes the preset player options file', () => {
    applyPreset(workspace, main, {
      content: '// preset',
      options: 'export default { muted: true };'
    });

    const file = workspace.find(i => i.name === PLAYER_OPTIONS_FILE_NAME);

    expect(file.content).toBe('export default { muted: true };');
  });

  it('leaves the options file alone when the preset ships none', () => {
    const file = ensurePlayerOptionsFile(workspace);

    file.content = 'export default { keep: true };';
    applyPreset(workspace, main, { content: '// preset' });

    expect(file.content).toContain('keep');
  });

  it.each(themePresets)('compiles the "$name" preset', (preset) => {
    applyPreset(workspace, main, preset);

    const compiler = new SassWorkspaceCompiler(workspace, 'pillarbox.scss');

    expect(() => compiler.compile()).not.toThrow();
  });

  it('applies through a compiler created before the preset exists', () => {
    // Mirrors the runtime flow: the app's compiler singleton indexes the
    // workspace at startup, before any preset file exists.
    const compiler = new SassWorkspaceCompiler(workspace, 'pillarbox.scss');
    const presetFile = applyPreset(workspace, main, {
      content: '.vjs-control { color: blue; }'
    });

    compiler.registerFile(PRESET_FILE_NAME, presetFile);

    expect(compiler.compile()).toContain('color:blue');
  });

  it('overrides the default theme through the cascade', () => {
    applyPreset(workspace, main, {
      content: '.vjs-control { color: blue; }'
    });

    const compiler = new SassWorkspaceCompiler(workspace, 'pillarbox.scss');
    const css = compiler.compile();

    expect(css.indexOf('color:blue')).toBeGreaterThan(css.indexOf('color:red'));
  });
});
