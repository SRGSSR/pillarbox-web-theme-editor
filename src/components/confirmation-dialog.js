import { html, LitElement, unsafeCSS } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import confirmationDialogStyle from './confirmation-dialog.scss?inline';

/**
 * `ConfirmationDialog` is a LitElement that renders a modal dialog window which
 * can be used to confirm or reject an action. It encapsulates user interaction
 * in the form of "accept" or "cancel" actions.
 *
 * @fires ConfirmationDialog#close Fired when the dialog is closed, with `detail.accepted` indicating if the "accept" was clicked.
 * @fires ConfirmationDialog#open Fired when the dialog is opened.
 *
 * @part body - The container of the dialog's content.
 * @part actions - The container of the dialog's action buttons.
 * @part button - Parts for styling the buttons individually.
 * @part button cancel - Part for styling the cancel button.
 * @part button accept - Part for styling the accept button.
 *
 * @slot title - The dialog's title. Provides context about the dialog's purpose.
 * @slot content - The main content of the dialog, such as descriptions or questions.
 * @slot cancel - (Optional) Customizes the cancel button text. Defaults to "Cancel."
 * @slot accept - (Optional) Customizes the accept button text. Defaults to "Accept."
 *
 * @cssproperty [--dialog-padding=1em] - The padding inside the dialog.
 * @cssproperty [--dialog-background-color=#242424] - The background color of the dialog.
 * @cssproperty [--dialog-border=1px solid #666] - The border style for the dialog.
 * @cssproperty [--dialog-color=rgb(255 255 255 / 87%)] - The text color inside the dialog.
 * @cssproperty [--dialog-title-font-weight=600] - The font weight for the dialog title.
 * @cssproperty [--dialog-border-radius=0.5em] - The border radius of the dialog.
 * @cssproperty [--dialog-max-width=360px] - The maximum width of the dialog.
 * @cssproperty [--button-color=rgb(255 255 255 / 87%)] - The text color of the buttons.
 * @cssproperty [--button-border-radius=0.5em] - The border radius of the buttons.
 * @cssproperty [--accept-button-background=#9D4040] - The background color of the accept button.
 * @cssproperty [--accept-button-hover-background=#733030] - The background color of the accept button on hover.
 * @cssproperty [--cancel-button-background=rgb(255 255 255 / 0%)] - The background color of the cancel button.
 * @cssproperty [--cancel-button-hover-background=rgb(255 255 255 / 20%)] - The background color of the cancel button on hover.
 * @cssproperty [--cancel-button-hover-color=rgb(0 0 0 / 87%)] - The text color of the cancel button on hover.
 *
 * @example
 * <confirmation-dialog>
 *   <span slot="title">Are you sure ?</span>
 *   <span slot="content">This action is irreversible</span>
 * </confirmation-dialog>
 */
class ConfirmationDialog extends LitElement {
  static styles = unsafeCSS(confirmationDialogStyle);

  static properties = {
    open: {
      type: Boolean,
      state: true
    },
    accepted: {
      type: Boolean,
      state: true
    }
  };

  /**
   * Reference to the dialog HTML element.
   *
   * @type {import('lit/directives/ref').Ref<HTMLDialogElement>}
   * @private
   */
  #dialog = createRef();

  constructor() {
    super();
    this.open = false;
    this.accepted = false;
  }

  render() {
    return html`
      <dialog ${ref(this.#dialog)}>
        <div part="body">
          <slot name="title"></slot>
          <slot name="content"></slot>
          <div part="actions">
            <button part="button cancel" @click=${() => this.#close(false)}>
              <slot name="cancel">Cancel</slot>
            </button>
            <button part="button accept" @click=${() => this.#close(true)}>
              <slot name="accept">Accept</slot>
            </button>
          </div>
        </div>
      </dialog>
    `;
  }

  #close(accepted = false) {
    this.open = false;
    this.accepted = accepted;
  }

  updated(_changedProperties) {
    super.updated(_changedProperties);

    if (_changedProperties.has('open')) {
      this.#updateDialog();
    }
  }

  #updateDialog() {
    if (this.open) {
      this.#dialog.value.showModal();
      /**
       * Custom event dispatched when the dialog is opened.
       *
       * @event ConfirmationDialog#open
       * @type {CustomEvent}
       */
      this.dispatchEvent(new CustomEvent('open'));
    } else {
      this.#dialog.value.close();
      /**
       * Custom event dispatched when the dialog is closed. Includes whether the closure was an acceptance.
       *
       * @event ConfirmationDialog#close
       * @type {CustomEvent}
       * @property {Object} detail - The event detail object.
       * @property {boolean} detail.accepted - Indicates if the dialog was closed with an acceptance.
       */
      this.dispatchEvent(new CustomEvent('close', { detail: { accepted: this.accepted } }));
    }
    this.accepted = false;
  }

  /**
   * Toggles the dialog's open state.
   *
   * @param {boolean} [open] Specifies the desired open state. If not provided,
   *                         it toggles the current state.
   */
  toggle(open) {
    this.open = open ?? !this.open;
  }
}

customElements.define('confirmation-dialog', ConfirmationDialog);
