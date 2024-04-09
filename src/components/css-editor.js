import { html, LitElement } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';

self.MonacoEnvironment = {
  getWorker: function(_, label) {
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new CssWorker();
    }

    return new EditorWorker();
  }
};

/**
 * `CssEditor` integrates the Monaco Editor into a LitElement component, providing
 * a rich editing environment for CSS within a custom element. It supports theme switching
 * based on the user's preferred color scheme and emits a `change` event when the content changes.
 *
 * @element css-editor
 *
 * @property {String} theme The current theme of the editor, either 'vs-dark' or 'vs-light'.
 *
 * @fires CssEditor#change Event fired when the editor's content changes.
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
   * @type string
   * @private
   */
  #initialValue = '';

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

    this.editor.getModel().onDidChangeContent(() => {
      /**
       * Custom event dispatched by the editor when its content changes.
       *
       * @event CssEditor#change
       * @type {CustomEvent}
       * @property {Object} detail The event detail object.
       * @property {Boolean} detail.value The new content of the editor.
       */
      this.dispatchEvent(new CustomEvent('value-changed', { detail: { value: this.editor.getValue() } }));
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      monaco.editor.setTheme(this.getTheme());
    });
  }
}

customElements.define('css-editor', CssEditor);
