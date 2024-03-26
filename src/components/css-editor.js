import { css, html, LitElement, unsafeCSS } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';

// -- Monaco Editor Imports --
import * as monaco from 'monaco-editor';
import editorStyle from 'monaco-editor/min/vs/editor/editor.main.css?inline';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';

const initialStyle = `
/* Turn the progress bar white */
.pillarbox-js .vjs-play-progress { 
  color: white;
  background-color: white; 
}

/* Show the scrubber */
.pillarbox-js .vjs-play-progress::before {
  font-size: 0.9em;
}`.trim();

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
 * @property {String} theme The current theme of the editor, either 'vs-dark' or 'vs-light'.
 * @fires CssEditor#change Event fired when the editor's content changes.
 *
 * @example
 * <css-editor theme="vs-dark"></css-editor>
 */
class CssEditor extends LitElement {
  static properties = {
    theme: { type: String }
  };

  static styles = [css`
    :host {
      --editor-width: 100%;
      --editor-height: 100%;
    }

    .monaco-container {
      width: var(--editor-width);
      height: var(--editor-height);
    }
  `, unsafeCSS(editorStyle)];

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
    return this.editor ? this.editor.getValue() : initialStyle;
  }

  /**
   * Initializes the Monaco Editor when the component is first updated.
   * Configures the editor, sets the initial content, and sets up event listeners.
   */
  firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);

    this.editor = monaco.editor.create(this.container.value, {
      value: initialStyle,
      language: 'css',
      theme: this.getTheme(),
      automaticLayout: true,
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
      this.dispatchEvent(new CustomEvent('change', { detail: { value: this.editor.getValue() } }));
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      monaco.editor.setTheme(this.getTheme());
    });
  }
}

customElements.define('css-editor', CssEditor);
