import { describe, expect, it, vi } from 'vitest';
import {
  SassWorkspaceCompiler
} from '../../src/workspace/sass-workspace-compiler.js';
import ZipWorkspace from '../../src/workspace/zip-workspace.js';

describe('SassWorkspaceCompiler without mocks', () => {
  it('compiles SCSS to CSS with imports', () => {
    // Simulate a workspace that includes both the base and importable SCSS files.
    const testWorkspace = [
      {
        name: 'main.scss',
        content: '@import "variables"; .test { color: $primaryColor; }',
        type: 'scss'
      },
      {
        name: 'variables.scss',
        content: '$primaryColor: blue;',
        type: 'scss'
      }
    ];
    const compiler = new SassWorkspaceCompiler(testWorkspace, 'main.scss');
    const result = compiler.compile();

    expect(result).toContain('.test{color:blue}');
  });

  it('triggers the download of the ZIP file with the correct filename', async() => {
    const workspace = [{
      name: 'main.scss',
      content: '',
      type: 'scss'
    }];
    const downloadSpy = vi.spyOn(ZipWorkspace.prototype, 'download').mockImplementation(() => {});
    const compiler = new SassWorkspaceCompiler(workspace, 'main.scss');

    await compiler.download('custom-theme.zip');
    expect(downloadSpy).toHaveBeenCalledWith('custom-theme.zip');

    await compiler.download();
    expect(downloadSpy).toHaveBeenCalledWith('pillarbox-theme.zip');

    downloadSpy.mockRestore();
  });
});
