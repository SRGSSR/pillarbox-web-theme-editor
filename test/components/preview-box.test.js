import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../src/components/preview-box.js';
import pillarbox from '@srgssr/pillarbox-web';

vi.mock('@srgssr/pillarbox-web', () => {
  const src = vi.fn(); // Set up the spy for the 'src' method

  return {
    __esModule: true,
    default: vi.fn().mockImplementation(() => ({
      src // Return this spy when the pillarbox function is called
    })),
    srcSpy: src // Expose the spy for assertions
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
    expect(pillarboxMock.mock.instances[0].srcSpy).toHaveBeenCalledWith({
      disableTrackers: true,
      src: 'urn:rts:video:14318206',
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
