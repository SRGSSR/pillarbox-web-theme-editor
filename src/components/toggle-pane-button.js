import { html, LitElement, unsafeCSS } from 'lit';
import togglePaneButtonStyle from './toggle-pane-button.scss?inline';

/**
 * A LitElement component that creates a toggle button to show or hides a popup pane.
 * It changes its state when clicked, and can display custom content within a popup.
 *
 * @element toggle-pane-button
 *
 * @property {String} title - The title of the button, shown as a tooltip.
 * @property {String} label - The visible label of the button.
 * @property {Boolean} opened - Indicates whether the popup is currently visible. Reflects to attribute.
 *
 * @attribute {Boolean} opened - Reflects the `opened` property to an attribute. Determines the visibility of the popup.
 *
 * @slot - Default slot for the content of the popup.
 *
 * @part button - The button element that can be styled independently.
 * @part popup - The popup element that appears or hides based on the `opened` state.
 *
 * @cssproperty [--button-background=#282c33] - The background color of the button.
 * @cssproperty [--button-hover-background=#305273] - The background color of the button on hover.
 * @cssproperty [--button-color=rgb(255 255 255 / 87%)] - The text color of the button.
 * @cssproperty [--button-border=1px solid #33383f] - The border of the button.
 * @cssproperty [--button-hover-border-color=#6fa8d8] - The border color of the button on hover.
 * @cssproperty [--button-border-radius=4px] - The border radius of the button.
 * @cssproperty [--popup-background=#242424] - The background color of the popup element.
 * @cssproperty [--popup-border=1px solid #666] - The border style for the popup element.
 * @cssproperty [--popup-border-radius=0.5em] - The border radius of the popup element.
 * @cssproperty [--popup-z-index=100] - The z-index of the popup element, controlling its stack order.
 *
 * @example
 * <toggle-pane-button label="Display a message">
 *   <span>Hello World!</span>
 * </toggle-pane-button>
 */
class TogglePaneButton extends LitElement {
  /**
   * A private method to close the popup.
   * @type {Function}
   * @private
   */
  #closePopup = () => { this.opened = false; };

  static styles = unsafeCSS(togglePaneButtonStyle);

  static properties = {
    opened: { type: Boolean, reflect: true },
    title: { type: String },
    label: { type: String }
  };

  constructor() {
    super();
    this.opened = false;
  }

  render() {
    return html`
      <button part="button" 
              @click="${() => { this.opened = !this.opened; }}"
              title="${this.title}">
        ${this.label}
      </button>
      <div part="popup">
        <slot></slot>
      </div>
    `;
  }

  updated(_changedProperties) {
    super.updated(_changedProperties);

    if (_changedProperties.has('opened')) {
      this.#togglePopup();
    }
  }

  #togglePopup() {
    if (this.opened) {
      document.addEventListener('click', this.#closePopup, { once: true });
    } else {
      document.removeEventListener('click', this.#closePopup);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', e => e.stopPropagation());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.#closePopup);
  }
}

customElements.define('toggle-pane-button', TogglePaneButton);
