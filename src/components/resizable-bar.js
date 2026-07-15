import { html, LitElement, unsafeCSS } from 'lit';
import resizableBarStyle from './resizable-bar.scss?inline';

/**
 * `ResizableBar` is a LitElement component that implements a UI element
 * which can be dragged by the user. It's designed to be a divider between
 * two panels or sections in a layout, providing a visual handle that users
 * can drag to resize adjacent content areas. It supports both horizontal
 * (default) and vertical orientations.
 *
 * @element resizable-bar
 *
 * @property {('horizontal'|'vertical')} orientation The axis of the split
 * this bar belongs to. Horizontal separates side-by-side panels, vertical
 * separates stacked panels.
 *
 * @fires ResizableBar#resize-move Fired as the user resizes, with the current pointer coordinates.
 *
 * @part resizer - The resizer element.
 *
 * @cssproperty [--resizable-bar-margin-inline=0] - The margin along the split axis of the resizable bar.
 * @cssproperty [--resizable-bar-resizer-bg-color=#33383f] - The background color of the resizable bar.
 * @cssproperty [--resizable-bar-resizer-hover-bg-color=#6fa8d8] - The background color of the resizable bar on hover.
 * @cssproperty [--resizable-bar-resizer-width=4px] - The thickness of the resizable bar.
 * @cssproperty [--resizable-bar-resizer-height=100%] - The length of the resizable bar.
 * @cssproperty [--resizable-bar-resizer-border-radius=0] - The border radius of the resizable bar.
 *
 * @example
 * <resizable-bar orientation="vertical"></resizable-bar>
 */
class ResizableBar extends LitElement {
  static styles = unsafeCSS(resizableBarStyle);
  static properties = {
    orientation: { type: String, reflect: true }
  };

  constructor() {
    super();
    this.orientation = 'horizontal';
  }

  render() {
    return html`
      <div part="resizer" @pointerdown="${this.initResize}"></div>
    `;
  }

  /**
   * Initializes the resize operation. This method adds event listeners for
   * pointer movements and releases, and dispatches a `resize-move` event
   * when the user moves the bar around.
   */
  initResize() {
    const doResize = (e) => {
      /**
       * Custom event dispatched by the component as the user resizes.
       *
       * @event ResizableBar#resize-move
       * @type {CustomEvent}
       * @property {Object} detail The event detail object.
       * @property {number} detail.clientX The current X-coordinate of the pointer.
       * @property {number} detail.clientY The current Y-coordinate of the pointer.
       */
      this.dispatchEvent(new CustomEvent('resize-move', {
        detail: { clientX: e.clientX, clientY: e.clientY }
      }));
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
