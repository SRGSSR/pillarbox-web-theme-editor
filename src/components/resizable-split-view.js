import { css, html, LitElement } from 'lit';
import './resizable-bar.js';

/**
 * A LitElement component that creates a resizable split view layout. It contains a `resizable-bar`
 * that users can drag to resize the adjacent content sections. Each section is represented by a slot,
 * allowing users to inject custom content into each side of the split view.
 *
 * @element resizable-split-view
 * @example
 * <resizable-split-view>
 *   <div slot="left">Left panel content goes here.</div>
 *   <div slot="right">Right panel content goes here.</div>
 * </resizable-split-view>
 */
class ResizableSplitView extends LitElement {
  static styles = css`
    :host {
      display: flex;
      width: 100%;
      height: 100%;
      
      --left-panel-width: 50%; /* Default width for the left panel */
    }

    ::slotted([slot="left"]), ::slotted([slot="right"]) {
      display: flex;
      flex-direction: column;
      overflow: auto;
    }
    
    ::slotted([slot="left"]) {
      flex: 0 0 var(--left-panel-width);
    }

    ::slotted([slot="right"]) {
      flex: 1;
    }
  `;

  render() {
    return html`
      <slot name="left"></slot>
      <resizable-bar @resize-move="${this.handleResize}"></resizable-bar>
      <slot name="right"></slot>
    `;
  }

  /**
   * Handles the resizing movement by adjusting the flex-basis of the left panel
   * based on the resize event detail, effectively resizing the content sections.
   *
   * @param {CustomEvent} e The custom event emitted by the `resizable-bar` with current resize details.
   */
  handleResize(e) {
    // Get the bounding rectangle of the resizable-split-view component itself
    const rect = this.getBoundingClientRect();
    // Calculate the new width based on the event's clientX position and the left edge of the component
    const newWidth = e.detail.clientX - rect.left;
    // Convert the new width to a percentage of the resizable-split-view's total width
    const newWidthPercent = (newWidth / rect.width) * 100;

    // Update the CSS custom property to adjust the width of the left panel
    this.style.setProperty('--left-panel-width', `${newWidthPercent}%`);
  }
}

customElements.define('resizable-split-view', ResizableSplitView);
