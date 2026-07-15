import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recompile } from '../../src/app/editor-controller.js';

describe('editor-controller recompile', () => {
  let ctx;

  const mainScss = { name: 'main.scss', type: 'scss', content: '' };
  const nested = { name: '_slider.scss', type: 'scss', content: '' };

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    ctx = {
      compiler: {
        mainScss,
        workspace: [
          mainScss,
          { name: 'components', type: 'folder', children: [nested] }
        ],
        compile: vi.fn().mockReturnValue('.a{color:red}')
      },
      preview: {},
      navigation: {}
    };
  });

  it('applies the compiled css and clears the errors', () => {
    ctx.navigation.errors = [mainScss];
    recompile(ctx);

    expect(ctx.preview.appliedCss).toBe('.a{color:red}');
    expect(ctx.navigation.errors).toEqual([]);
  });

  it('flags the entry file when the error carries no url', () => {
    ctx.compiler.compile = vi.fn(() => {
      throw Object.assign(new Error('bad scss'), { span: { url: null } });
    });
    recompile(ctx);

    expect(ctx.navigation.errors).toEqual([mainScss]);
  });

  it('flags the imported virtual file behind the error url', () => {
    ctx.compiler.compile = vi.fn(() => {
      throw Object.assign(new Error('bad import'), {
        span: { url: new URL('virtual-file://components/_slider.scss') }
      });
    });
    recompile(ctx);

    expect(ctx.navigation.errors).toEqual([nested]);
  });

  it('tolerates a context without a navigation element', () => {
    delete ctx.navigation;
    ctx.compiler.compile = vi.fn(() => {
      throw new Error('bad scss');
    });

    expect(() => recompile(ctx)).not.toThrow();
  });
});
