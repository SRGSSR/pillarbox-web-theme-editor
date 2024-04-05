import { describe, expect, it } from 'vitest';
import {
  SassWorkspaceCompiler
} from '../../src/workspace/sass-workspace-compiler.js';

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
});
