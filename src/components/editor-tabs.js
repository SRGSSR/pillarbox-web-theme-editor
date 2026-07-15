import { html, LitElement, unsafeCSS } from 'lit';
import { partMap } from './component-utils.js';
import editorTabsStyle from './editor-tabs.scss?inline';

/**
 * `EditorTabs` renders a strip of tabs, one per open document. It is purely
 * presentational: the list of tabs and the active tab are driven through
 * properties, and user interactions are reported through events.
 *
 * @element editor-tabs
 *
 * @property {Array<{id: String, name: String}>} tabs The open tabs.
 * @property {String} activeId The id of the currently active tab.
 *
 * @fires EditorTabs#tab-selected Fired when the user clicks a tab.
 * @fires EditorTabs#tab-closed Fired when the user clicks a tab's close button.
 *
 * @part tabs - The tab strip container.
 * @part tab - A single tab. Carries the additional `active` token for the active tab.
 * @part tab-label - The label of a tab.
 * @part tab-close - The close button of a tab.
 *
 * @cssproperty [--tabs-background=#1e2126] - The background of the tab strip.
 * @cssproperty [--tab-background=transparent] - The background of an inactive tab.
 * @cssproperty [--tab-active-background=#17191d] - The background of the active tab.
 * @cssproperty [--tab-color=#a9adb3] - The text color of an inactive tab.
 * @cssproperty [--tab-active-color=#ebeef1] - The text color of the active tab.
 * @cssproperty [--tab-active-border=#6fa8d8] - The color of the active tab's accent border.
 * @cssproperty [--tab-border-color=#33383f] - The color of the separator between tabs.
 *
 * @example
 * <editor-tabs .tabs="${tabs}" activeId="pillarbox.scss"></editor-tabs>
 */
class EditorTabs extends LitElement {
  static styles = unsafeCSS(editorTabsStyle);
  static properties = {
    tabs: { type: Array },
    activeId: { type: String, attribute: 'active-id' }
  };

  constructor() {
    super();
    this.tabs = [];
    this.activeId = undefined;
  }

  render() {
    return html`
      <div part="tabs" role="tablist">
        ${this.tabs.map(tab => this.renderTab(tab))}
      </div>
    `;
  }

  /**
   * Renders a single tab.
   *
   * @param {{id: String, name: String}} tab The tab to render.
   * @returns {import('lit').TemplateResult} The tab template.
   */
  renderTab(tab) {
    const active = tab.id === this.activeId;

    return html`
      <button part="${partMap({ tab: true, active })}"
              role="tab"
              aria-selected="${active}"
              title="${tab.id}"
              @click="${() => this.#selectTab(tab)}">
        <span part="tab-label">${tab.name}</span>
        <span part="tab-close"
              role="button"
              aria-label="Close ${tab.name}"
              @click="${(e) => this.#closeTab(e, tab)}">close</span>
      </button>
    `;
  }

  /**
   * Dispatches the `tab-selected` event for a tab.
   *
   * @param {{id: String}} tab The selected tab.
   * @private
   */
  #selectTab(tab) {
    /**
     * @event EditorTabs#tab-selected
     * @type {CustomEvent}
     * @property {Object} detail The event detail object.
     * @property {String} detail.id The id of the selected tab.
     */
    const detail = { id: tab.id };

    this.dispatchEvent(new CustomEvent('tab-selected', { detail }));
  }

  /**
   * Dispatches the `tab-closed` event for a tab without selecting it.
   *
   * @param {Event} e The click event on the close button.
   * @param {{id: String}} tab The tab to close.
   * @private
   */
  #closeTab(e, tab) {
    e.stopPropagation();

    /**
     * @event EditorTabs#tab-closed
     * @type {CustomEvent}
     * @property {Object} detail The event detail object.
     * @property {String} detail.id The id of the closed tab.
     */
    const detail = { id: tab.id };

    this.dispatchEvent(new CustomEvent('tab-closed', { detail }));
  }
}

customElements.define('editor-tabs', EditorTabs);
