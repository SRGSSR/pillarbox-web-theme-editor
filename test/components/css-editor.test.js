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
  const makeModel = (initialValue = '/* New CSS */') => {
    const callbacks = [];
    let content = initialValue;

    return {
      onDidChangeContent: vi.fn(callback => callbacks.push(callback)),
      getValue: vi.fn(() => content),
      setValue: vi.fn(value => {
        content = value;
        callbacks.forEach(cb => cb());
      }),
      dispose: vi.fn(),
      // Utility to trigger the change
      __triggerModelChange: () => callbacks.forEach(cb => cb())
    };
  };

  const defaultModel = makeModel();

  return {
    editor: {
      create: vi.fn().mockReturnValue({
        getModel: vi.fn().mockReturnValue(defaultModel),
        getValue: vi.fn().mockReturnValue('/* New CSS */'),
        setValue: vi.fn(),
        setModel: vi.fn(),
        saveViewState: vi.fn(() => ({})),
        restoreViewState: vi.fn()
      }),
      createModel: vi.fn(value => makeModel(value)),
      setTheme: vi.fn()
    },
    Uri: { parse: vi.fn(uri => uri) }
  };
});

describe('CssEditor', () => {
  let element;

  beforeEach(async() => {
    vi.clearAllMocks();
    element = document.createElement('css-editor');
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should apply the correct theme based on system preference', () => {
    expect(['vs-dark', 'vs-light']).toContain(element.getTheme());
  });

  it('creates one model per document id and reuses it on reopen', async() => {
    const monaco = await import('monaco-editor');

    element.openDocument('a.scss', 'a content');
    element.openDocument('b.scss', 'b content');
    element.openDocument('a.scss', 'ignored on reopen');

    expect(monaco.editor.createModel).toHaveBeenCalledTimes(2);
    expect(element.editor.setModel).toHaveBeenCalledTimes(3);

    const firstModel = element.editor.setModel.mock.calls[0][0];
    const thirdModel = element.editor.setModel.mock.calls[2][0];

    expect(thirdModel).toBe(firstModel);
    expect(firstModel.getValue()).toBe('a content');
  });

  it('emits value-changed with the document id for opened documents', () => {
    const changeEventSpy = vi.spyOn(element, 'dispatchEvent');

    element.openDocument('a.scss', 'a content');

    const model = element.editor.setModel.mock.calls[0][0];

    model.__triggerModelChange();
    expect(changeEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      type: 'value-changed',
      detail: { value: 'a content', id: 'a.scss' }
    }));

    changeEventSpy.mockRestore();
  });

  it('disposes the model when closing a document', () => {
    element.openDocument('a.scss', 'a content');

    const model = element.editor.setModel.mock.calls[0][0];

    element.closeDocument('a.scss');
    expect(model.dispose).toHaveBeenCalled();

    // Reopening after close creates a fresh model
    element.openDocument('a.scss', 'fresh content');

    const reopenedModel = element.editor.setModel.mock.calls[1][0];

    expect(reopenedModel).not.toBe(model);
    expect(reopenedModel.getValue()).toBe('fresh content');
  });

  it('replaces the content of an open document on refresh', () => {
    element.openDocument('a.scss', 'a content');

    const model = element.editor.setModel.mock.calls[0][0];

    element.refreshDocument('a.scss', 'updated content');
    expect(model.setValue).toHaveBeenCalledWith('updated content');
    expect(model.getValue()).toBe('updated content');
  });

  it('restores a document view state captured when switching away', () => {
    const stateA = { scrollTop: 42 };

    element.editor.saveViewState.mockReturnValue(stateA);
    element.openDocument('a.scss', 'a content');
    element.openDocument('b.scss', 'b content');

    expect(element.editor.restoreViewState).not.toHaveBeenCalled();

    element.openDocument('a.scss', 'a content');
    expect(element.editor.restoreViewState).toHaveBeenCalledTimes(1);
    expect(element.editor.restoreViewState).toHaveBeenCalledWith(stateA);
  });

  it('drops the view state of a closed document', () => {
    element.editor.saveViewState.mockReturnValue({ scrollTop: 42 });
    element.openDocument('a.scss', 'a content');
    element.openDocument('b.scss', 'b content');

    element.closeDocument('a.scss');
    element.openDocument('a.scss', 'fresh content');

    expect(element.editor.restoreViewState).not.toHaveBeenCalled();
  });

  it('replays openDocument calls made before the editor is ready', async() => {
    const earlyElement = document.createElement('css-editor');

    earlyElement.openDocument('early.scss', 'early content');
    document.body.appendChild(earlyElement);
    await earlyElement.updateComplete;

    const lastCall = earlyElement.editor.setModel.mock.calls.at(-1);

    expect(lastCall[0].getValue()).toBe('early content');
    document.body.removeChild(earlyElement);
  });
});
