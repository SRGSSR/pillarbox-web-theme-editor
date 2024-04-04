import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../src/components/css-editor.js';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: query.includes('dark'),
    addEventListener: vi.fn()
  }))
});

vi.mock('monaco-editor', () => {
  const callbacks = [];

  return {
    editor: {
      create: vi.fn().mockReturnValue({
        getModel: vi.fn().mockReturnValue({
          onDidChangeContent: vi.fn(callback => callbacks.push(callback)),
          // Utility to trigger the change
          __triggerModelChange: () => callbacks.forEach(cb => cb())
        }),
        getValue: vi.fn().mockReturnValue('/* New CSS */'),
        setValue: vi.fn()
      }),
      setTheme: vi.fn()
    }
  };
});

describe('CssEditor', () => {
  let element;

  beforeEach(async() => {
    element = document.createElement('css-editor');
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should initialize monaco editor with correct initial content', () => {
    expect(element.getValue()).toBe('/* New CSS */');
  });

  it('should apply the correct theme based on system preference', () => {
    expect(element.getTheme()).toBe('vs-dark' || 'vs-light');
  });

  it('should emit a change event when the editor content changes', async() => {
    const changeEventSpy = vi.spyOn(element, 'dispatchEvent');

    element.editor.getModel().__triggerModelChange();
    expect(changeEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      type: 'value-changed',
      detail: { value: '/* New CSS */' }
    }));

    // Cleanup
    changeEventSpy.mockRestore();
  });
});
