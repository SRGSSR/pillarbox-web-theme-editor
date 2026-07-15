import { html, LitElement } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';

const WORKERS = {
  css: CssWorker,
  scss: CssWorker,
  less: CssWorker
};

self.MonacoEnvironment = {
  getWorker: function(_, label) {
    const Worker = WORKERS[label] ?? EditorWorker;

    return new Worker();
  }
};

/**
 * Monaco language ids by file extension; documents default to scss.
 */
const LANGUAGES = { css: 'css' };

/**
 * Resolves the Monaco language for a document id (its file path).
 *
 * @param {string} id The document identifier.
 * @returns {string} The Monaco language id.
 */
function languageFor(id) {
  return LANGUAGES[id?.split('.').pop()] ?? 'scss';
}

/**
 * `CssEditor` integrates the Monaco Editor into a LitElement component, providing
 * a rich editing environment for CSS within a custom element. It supports theme switching
 * based on the user's preferred color scheme and emits a `value-changed` event when the
 * content changes.
 *
 * Multiple documents can be edited through `openDocument`, each keeping its
 * own Monaco model, so switching between documents preserves the undo history
 * of each one.
 *
 * @element css-editor
 *
 * @property {String} theme The current theme of the editor, either 'vs-dark' or 'vs-light'.
 *
 * @fires CssEditor#value-changed Event fired when the editor's content changes.
 *
 * @example
 * <css-editor theme="vs-dark"></css-editor>
 */
class CssEditor extends LitElement {
  static properties = {
    theme: { type: String }
  };

  /**
   * Holds the initial value passed to this css editor.
   *
   * @type {string}
   * @private
   */
  #initialValue = '';

  /**
   * Monaco models by document id.
   *
   * @type {Map<string, import('monaco-editor').editor.ITextModel>}
   * @private
   */
  #models = new Map();

  /**
   * Holds an `openDocument` call received before the editor was created.
   *
   * @type {{id: string, content: string}|null}
   * @private
   */
  #pendingOpen = null;

  constructor() {
    super();
    this.container = createRef();
    this.theme = undefined;
  }

  createRenderRoot() {
    // Temporarily forces the rendering to occur within the light DOM to address an issue with the color picker.
    // The color picker disappears when interacting with it in a shadow DOM context.
    // Reference: https://github.com/microsoft/monaco-editor/issues/3845

    // TODO: Remove this method to use shadow DOM rendering once the above-mentioned issue is resolved.
    return this;
  }

  render() {
    return html`
      <div class="monaco-container" ${ref(this.container)}></div>
    `;
  }

  /**
   * Determines the appropriate editor theme based on the component's theme property or system preference.
   *
   * @returns {String} The Monaco Editor theme ('vs-dark' or 'vs-light').
   */
  getTheme() {
    if (this.theme) return this.theme;
    if (this.isDark()) return 'vs-dark';

    return 'vs-light';
  }

  /**
   * Checks if the user prefers a dark color scheme.
   *
   * @returns {boolean} True if the user prefers a dark color scheme, false otherwise.
   */
  isDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Retrieves the current content of the Monaco Editor.
   *
   * @returns {String} The current content of the editor.
   */
  getValue() {
    return this.editor ? this.editor.getValue() : this.#initialValue;
  }

  /**
   * Set the new content of the Monaco Editor.
   *
   * Note that this resets the undo history of the current document; prefer
   * `openDocument` when working with multiple documents.
   *
   * @param value {string} The new content fo the editor.
   */
  setValue(value) {
    if (!this.editor) {
      this.#initialValue = value;
    } else {
      this.editor.setValue(value);
    }
  }

  /**
   * Opens a document in the editor. The first call for a given id creates a
   * dedicated Monaco model initialized with `content`; subsequent calls
   * reattach the existing model, preserving its content and undo history.
   *
   * @param {string} id A unique identifier of the document (e.g. its path).
   * @param {string} content The initial content of the document.
   */
  openDocument(id, content) {
    if (!this.editor) {
      this.#pendingOpen = { id, content };

      return;
    }

    this.editor.setModel(this.#modelFor(id, content));
  }

  /**
   * Closes a document and disposes its Monaco model. If the document is
   * currently displayed the editor is left without a model; open another
   * document afterwards.
   *
   * @param {string} id The identifier used when opening the document.
   */
  closeDocument(id) {
    const model = this.#models.get(id);

    this.#models.delete(id);
    model?.dispose();
  }

  /**
   * Replaces the content of an open document (e.g. after the underlying file
   * changed outside the editor). Resets that document's undo history.
   *
   * @param {string} id The identifier used when opening the document.
   * @param {string} content The new content of the document.
   */
  refreshDocument(id, content) {
    this.#models.get(id)?.setValue(content);
  }

  /**
   * Returns the model for the given document, creating it if needed.
   *
   * @param {string} id The document identifier.
   * @param {string} content The initial content, used on first open only.
   * @returns {import('monaco-editor').editor.ITextModel} The document model.
   * @private
   */
  #modelFor(id, content) {
    if (!this.#models.has(id)) {
      this.#models.set(id, this.#createModel(id, content));
    }

    return this.#models.get(id);
  }

  /**
   * Creates a Monaco model for a document and wires its change event.
   *
   * @param {string} id The document identifier.
   * @param {string} content The initial content of the model.
   * @returns {import('monaco-editor').editor.ITextModel} The created model.
   * @private
   */
  #createModel(id, content) {
    const uri = monaco.Uri.parse(`inmemory://pbte/${id}`);
    const model = monaco.editor.createModel(content, languageFor(id), uri);

    model.onDidChangeContent(() => this.#notifyChange(id, model));

    return model;
  }

  /**
   * Dispatches the `value-changed` event for a document.
   *
   * @param {string|undefined} id The document identifier, or undefined when
   * the change comes from the default single-document model.
   * @param {import('monaco-editor').editor.ITextModel} model The changed model.
   * @private
   */
  #notifyChange(id, model) {
    /**
     * Custom event dispatched by the editor when its content changes.
     *
     * @event CssEditor#value-changed
     * @type {CustomEvent}
     * @property {Object} detail The event detail object.
     * @property {String} detail.value The new content of the document.
     * @property {String} [detail.id] The id of the changed document, when it
     * was opened through `openDocument`.
     */
    this.dispatchEvent(new CustomEvent('value-changed', {
      detail: { value: model.getValue(), id }
    }));
  }

  /**
   * Replays an `openDocument` call received before the editor was ready.
   *
   * @private
   */
  #replayPendingOpen() {
    if (!this.#pendingOpen) return;

    const { id, content } = this.#pendingOpen;

    this.#pendingOpen = null;
    this.openDocument(id, content);
  }

  /**
   * Initializes the Monaco Editor when the component is first updated.
   * Configures the editor, sets the initial content, and sets up event listeners.
   */
  firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);

    this.editor = monaco.editor.create(this.container.value, {
      value: this.#initialValue,
      language: 'scss',
      theme: this.getTheme(),
      automaticLayout: true,
      fixedOverflowWidgets: true,
      minimap: { enabled: false }
    });

    const defaultModel = this.editor.getModel();

    defaultModel.onDidChangeContent(() => {
      this.#notifyChange(undefined, defaultModel);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      monaco.editor.setTheme(this.getTheme());
    });

    this.#replayPendingOpen();
  }
}

customElements.define('css-editor', CssEditor);
