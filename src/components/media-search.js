import { html, LitElement, unsafeCSS } from 'lit';
import { BUSINESS_UNITS, searchMedia } from '../services/il-provider.js';
import mediaSearchStyle from './media-search.scss?inline';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Formats a media duration in milliseconds as a compact label.
 *
 * @param {number} millis The duration in milliseconds.
 * @returns {string} The formatted duration, empty when unknown.
 */
const formatDuration = (millis) => {
  if (!millis) return '';

  return `${Math.max(1, Math.round(millis / 60000))} min`;
};

/**
 * `MediaSearch` is a search box over the SRG SSR integration layer. It offers
 * a business unit selector and a text input; typing triggers a debounced
 * search whose results are shown in a dropdown. Pressing Enter submits the
 * raw input directly, which allows pasting URNs.
 *
 * @element media-search
 *
 * @property {String} bu The business unit to search (rsi, rtr, rts, srf or swi).
 *
 * @fires MediaSearch#media-selected Fired when a result is clicked or a raw value is submitted.
 * @fires MediaSearch#bu-changed Fired when the business unit selection changes.
 *
 * @part container - The component container.
 * @part bu-select - The business unit selector.
 * @part input - The search input.
 * @part results - The results dropdown.
 * @part result - A single result entry.
 * @part result-title - The title of a result.
 * @part result-meta - The media type and duration of a result.
 *
 * @example
 * <media-search bu="rts"></media-search>
 */
class MediaSearch extends LitElement {
  static styles = unsafeCSS(mediaSearchStyle);
  static properties = {
    bu: { type: String, reflect: true },
    results: { state: true },
    open: { state: true }
  };

  /**
   * The id of the pending debounced search, if any.
   *
   * @type {number|undefined}
   * @private
   */
  #debounceId;

  /**
   * The abort controller of the in-flight search, if any.
   *
   * @type {AbortController|undefined}
   * @private
   */
  #abortController;

  /**
   * Closes the results dropdown; bound once so the document listener can be
   * removed on disconnect.
   *
   * @private
   */
  #closeResults = () => {
    this.open = false;
  };

  constructor() {
    super();
    this.bu = 'srf';
    this.results = [];
    this.open = false;
  }

  connectedCallback() {
    super.connectedCallback();
    // Keep clicks inside the component from closing the dropdown.
    this.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', this.#closeResults);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.#closeResults);
  }

  render() {
    return html`
      <div part="container">
        <select part="bu-select" @change="${this.#changeBu}">
          ${BUSINESS_UNITS.map(bu => this.#renderBuOption(bu))}
        </select>
        <input part="input"
               type="search"
               placeholder="Search a media or paste a URN…"
               @input="${this.#handleInput}"
               @keyup="${this.#handleKeyup}"/>
        ${this.#renderResults()}
      </div>
    `;
  }

  /**
   * Renders a business unit option.
   *
   * @param {string} bu The business unit.
   * @returns {import('lit').TemplateResult} The option template.
   * @private
   */
  #renderBuOption(bu) {
    return html`
      <option value="${bu}" ?selected="${bu === this.bu}">
        ${bu.toUpperCase()}
      </option>
    `;
  }

  /**
   * Renders the results dropdown when open.
   *
   * @returns {import('lit').TemplateResult|string} The dropdown template.
   * @private
   */
  #renderResults() {
    if (!this.open || !this.results.length) return '';

    return html`
      <ul part="results">
        ${this.results.map(result => this.#renderResult(result))}
      </ul>
    `;
  }

  /**
   * Renders a single search result.
   *
   * @param {Object} result The media result.
   * @returns {import('lit').TemplateResult} The result template.
   * @private
   */
  #renderResult(result) {
    return html`
      <li part="result" @click="${() => this.#selectResult(result)}">
        <span part="result-title">${result.title}</span>
        <span part="result-meta">
          ${result.mediaType?.toLowerCase()} ${formatDuration(result.duration)}
        </span>
      </li>
    `;
  }

  /**
   * Handles a business unit change.
   *
   * @param {Event} e The change event of the selector.
   * @private
   */
  #changeBu(e) {
    this.bu = e.target.value;

    /**
     * @event MediaSearch#bu-changed
     * @type {CustomEvent}
     * @property {Object} detail The event detail object.
     * @property {String} detail.bu The newly selected business unit.
     */
    const detail = { bu: this.bu };

    this.dispatchEvent(new CustomEvent('bu-changed', { detail }));
  }

  /**
   * Debounces the search as the user types. URNs and empty inputs close the
   * dropdown instead of searching.
   *
   * @param {Event} e The input event.
   * @private
   */
  #handleInput(e) {
    const query = e.target.value.trim();

    clearTimeout(this.#debounceId);

    if (!query || query.startsWith('urn:')) {
      this.open = false;

      return;
    }

    this.#debounceId = setTimeout(
      () => this.#search(query),
      SEARCH_DEBOUNCE_MS
    );
  }

  /**
   * Submits the raw input value when Enter is pressed.
   *
   * @param {KeyboardEvent} e The keyup event.
   * @private
   */
  #handleKeyup(e) {
    const value = e.target.value.trim();

    if (e.key === 'Enter' && value) {
      this.#notifySelection({ urn: value });
    }
  }

  /**
   * Notifies the selection of a search result.
   *
   * @param {Object} result The selected media result.
   * @private
   */
  #selectResult(result) {
    this.#notifySelection(result);
  }

  /**
   * Closes the dropdown and dispatches the `media-selected` event.
   *
   * @param {Object} detail The selected media.
   * @private
   */
  #notifySelection(detail) {
    this.open = false;

    /**
     * @event MediaSearch#media-selected
     * @type {CustomEvent}
     * @property {Object} detail The selected media.
     * @property {String} detail.urn The URN of the media to load.
     * @property {String} [detail.title] The title of the media, when selected
     * from the search results.
     */
    this.dispatchEvent(new CustomEvent('media-selected', { detail }));
  }

  /**
   * Runs a search on the integration layer, aborting any in-flight request.
   *
   * @param {string} query The search query.
   * @private
   */
  async #search(query) {
    this.#abortController?.abort();
    this.#abortController = new AbortController();

    try {
      const signal = this.#abortController.signal;

      this.results = await searchMedia(this.bu, query, signal);
      this.open = true;
    } catch (error) {
      this.#handleSearchError(error);
    }
  }

  /**
   * Logs search failures, ignoring aborted requests.
   *
   * @param {*} error The search error.
   * @private
   */
  #handleSearchError(error) {
    if (error?.name !== 'AbortError') {
      console.warn('Media search failed:', error);
    }
  }
}

customElements.define('media-search', MediaSearch);
