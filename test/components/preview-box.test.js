import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../src/components/preview-box.js';
import pillarbox from '@srgssr/pillarbox-web';

const srcSpy = vi.fn();

vi.mock('@srgssr/pillarbox-web', () => {
  return {
    __esModule: true,
    default: vi.fn().mockImplementation(() => ({
      src: srcSpy
    }))
  };
});

describe('PreviewBox Component', () => {
  let element;

  beforeEach(async() => {
    element = document.createElement('preview-box');
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('initializes pillarbox with correct parameters', () => {
    const pillarboxMock = vi.mocked(pillarbox);

    expect(pillarboxMock).toHaveBeenCalledWith(expect.anything(), {
      muted: true,
      restoreEl: true
    });
    expect(srcSpy).toHaveBeenCalledWith({
      disableTrackers: true,
      src: 'urn:srf:video:05457f66-fd67-4131-8e0a-6d85743efc39',
      type: 'srgssr/urn'
    });
  });

  it('applies and updates CSS through appliedCss property', async() => {
    const newCss = 'video { opacity: 0.5; }';

    element.appliedCss = newCss;
    await element.updateComplete;
    expect(element.shadowRoot.innerHTML).toContain(newCss);
  });
});
