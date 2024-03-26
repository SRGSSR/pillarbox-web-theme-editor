import { css, html, LitElement } from 'lit';

/**
 * `ResizableBar` is a LitElement component that implements a UI element
 * which can be resized horizontally by the user. It's designed to be
 * a divider between two panels or sections in a layout, providing
 * a visual handle that users can drag to resize adjacent content areas.
 *
 * @element resizable-bar
 * @fires ResizableBar#resize-move Fired as the user resizes, with the current pointer X-coordinate.
 *
 * @example
 * <resizable-bar></resizable-bar>
 */
class ResizableBar extends LitElement {
  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      margin-inline: 1em;
    }

    [part="resizer"] {
      background-color: #575454;
      cursor: ew-resize;
      width: 0.3em;
      height: 50%;
      border-radius: 5px;
  `;

  render() {
    return html`
      <div part="resizer" @pointerdown="${this.initResize}"></div>
    `;
  }

  /**
   * Initializes the resize operation. This method adds event listeners for
   * pointer movements and releases, and dispatches a `resize-move` event
   * when the user moves the bar around.
   *
   * @param {PointerEvent} e - The pointer event that initiated the resize.
   */
  initResize(e) {
    const doResize = (e) => {
      /**
       * Custom event dispatched by the component as the user resizes.
       *
       * @event ResizableBar#resize-move
       * @type {CustomEvent}
       * @property {Object} detail The event detail object.
       * @property {number} detail.clientX The current X-coordinate of the pointer.
       */
      this.dispatchEvent(new CustomEvent('resize-move', { detail: { clientX: e.clientX } }));
    };

    const stopResize = () => {
      document.removeEventListener('pointermove', doResize);
      document.removeEventListener('pointerup', stopResize);
    };

    document.addEventListener('pointermove', doResize);
    document.addEventListener('pointerup', stopResize);
  }
}

customElements.define('resizable-bar', ResizableBar);
