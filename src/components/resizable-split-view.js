import { html, LitElement, unsafeCSS } from 'lit';
import resizableSplitViewStyle from './resizable-split-view.scss?inline';
import './resizable-bar.js';

/**
 * A LitElement component that creates a resizable split view layout. It contains a `resizable-bar`
 * that users can drag to resize the adjacent content sections. Each section is represented by a slot,
 * allowing users to inject custom content into each side of the split view.
 *
 * The split can be horizontal (panels side by side, default) or vertical
 * (panels stacked). The `left` slot always holds the first panel (left or
 * top), the `right` slot the second panel (right or bottom).
 *
 * @element resizable-split-view
 *
 * @property {('horizontal'|'vertical')} orientation The axis of the split.
 * @property {Boolean} collapsed When true, the second panel and the bar are
 * hidden and the first panel takes all the available space.
 *
 * @slot left - The first (left or top) element of the split view
 * @slot right - The second (right or bottom) element of the split view
 *
 * @part resizer - The resizer handle of the inner `resizable-bar`.
 *
 * @example
 * <resizable-split-view orientation="vertical">
 *   <div slot="left">First panel content goes here.</div>
 *   <div slot="right">Second panel content goes here.</div>
 * </resizable-split-view>
 */
class ResizableSplitView extends LitElement {
  static styles = unsafeCSS(resizableSplitViewStyle);
  static properties = {
    orientation: { type: String, reflect: true },
    collapsed: { type: Boolean, reflect: true }
  };

  constructor() {
    super();
    this.orientation = 'horizontal';
    this.collapsed = false;
  }

  render() {
    return html`
      <slot name="left"></slot>
      <resizable-bar exportparts="resizer"
                     orientation="${this.orientation}"
                     @resize-move="${this.handleResize}"></resizable-bar>
      <slot name="right"></slot>
    `;
  }

  /**
   * Handles the resizing movement by adjusting the flex-basis of the first
   * panel based on the resize event detail, effectively resizing the content
   * sections. The pointer coordinate used depends on the orientation.
   *
   * @param {CustomEvent} e The custom event emitted by the `resizable-bar` with current resize details.
   */
  handleResize(e) {
    const rect = this.getBoundingClientRect();
    const vertical = this.orientation === 'vertical';
    const offset = vertical
      ? e.detail.clientY - rect.top
      : e.detail.clientX - rect.left;
    const size = vertical ? rect.height : rect.width;

    // Note: despite its name this property drives the size of the first
    // panel on both axes; renaming it would break existing consumers.
    this.style.setProperty('--left-panel-width', `${(offset / size) * 100}%`);
  }
}

customElements.define('resizable-split-view', ResizableSplitView);
