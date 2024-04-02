import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../src/components/resizable-bar.js';

// Mock PointerEvent if it's not defined in the testing environment
if (typeof PointerEvent === 'undefined') {
  global.PointerEvent = class extends MouseEvent { };
}

describe('ResizableBar', () => {
  let element, resizer;

  beforeEach(async() => {
    // Create and append the element to the document body
    element = document.createElement('resizable-bar');
    document.body.appendChild(element);
    await element.updateComplete;
    resizer = element.shadowRoot.querySelector('[part~=resizer]');
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should be registered as a custom element', () => {
    expect(customElements.get('resizable-bar')).toBeDefined();
  });

  it('renders the resizer part', () => {
    expect(resizer).toBeDefined();
  });

  it('dispatches resize-move event on pointermove after pointerdown', async() => {
    // Create a spy for the dispatchEvent to listen for `resize-move` event
    const dispatchEventSpy = vi.spyOn(element, 'dispatchEvent');
    const testClientX = 100;

    // Simulate pointerdown to initialize resizing
    resizer.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true,
      composed: true
    }));

    // Simulate pointermove to trigger resize-move event
    document.dispatchEvent(new PointerEvent('pointermove', {
      clientX: testClientX,
      bubbles: true,
      composed: true
    }));

    // Check if the custom event was dispatched with the correct detail
    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      type: 'resize-move',
      detail: { clientX: testClientX }
    }));

    // Cleanup
    dispatchEventSpy.mockRestore();
  });
});
