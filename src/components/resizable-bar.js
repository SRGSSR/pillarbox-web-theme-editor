import { html, LitElement, unsafeCSS } from 'lit';
import resizableBarStyle from './resizable-bar.scss?inline';

/**
 * `ResizableBar` is a LitElement component that implements a UI element
 * which can be resized horizontally by the user. It's designed to be
 * a divider between two panels or sections in a layout, providing
 * a visual handle that users can drag to resize adjacent content areas.
 *
 * @element resizable-bar
 *
 * @fires ResizableBar#resize-move Fired as the user resizes, with the current pointer X-coordinate.
 *
 * @part resizer - The resizer element.
 *
 * @cssproperty [--resizable-bar-margin-inline=1em] - The margin on the sides of the resizable bar.
 * @cssproperty [--resizable-bar-resizer-bg-color=#575454] - The background color of the resizable bar.
 * @cssproperty [--resizable-bar-resizer-width=0.3em] - The width of the resizable bar.
 * @cssproperty [--resizable-bar-resizer-height=50%] - The height of the resizable bar.
 * @cssproperty [--resizable-bar-resizer-border-radius=5px] - The border radius of the resizable bar.
 *
 * @example
 * <resizable-bar></resizable-bar>
 */
class ResizableBar extends LitElement {
  static styles = unsafeCSS(resizableBarStyle);

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
