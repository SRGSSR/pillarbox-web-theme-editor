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

  it('resolves files registered after construction', () => {
    const workspace = [
      {
        name: 'main.scss',
        content: '.test { color: red; }',
        type: 'scss'
      }
    ];
    const compiler = new SassWorkspaceCompiler(workspace, 'main.scss');
    const late = {
      name: '_late.scss',
      content: '.late { color: green; }',
      type: 'scss'
    };

    workspace.push(late);
    workspace[0].content += ' @import "late";';

    // Without registration the importer cannot resolve the new file
    expect(() => compiler.compile()).toThrow();

    compiler.registerFile('_late.scss', late);

    expect(compiler.compile()).toContain('.late{color:green}');
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
