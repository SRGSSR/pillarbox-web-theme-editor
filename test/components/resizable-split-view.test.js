import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../src/components/resizable-split-view.js';

describe('ResizableSplitView', () => {
  let container, element;

  beforeEach(async() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    // Render the component with initial slots
    container.innerHTML = `
      <resizable-split-view>
        <div slot="left">Left panel content goes here.</div>
        <div slot="right">Right panel content goes here.</div>
      </resizable-split-view>
    `;

    await container.updateComplete;

    // Retrieve the component from the container
    element = container.querySelector('resizable-split-view');
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('renders with initial slots', async() => {
    // Check if both slots are rendered correctly
    const leftSlot = element.shadowRoot.querySelector('slot[name="left"]');
    const rightSlot = element.shadowRoot.querySelector('slot[name="right"]');

    expect(leftSlot).toBeTruthy();
    expect(rightSlot).toBeTruthy();
    expect(leftSlot.assignedNodes().length).toBe(1);
    expect(rightSlot.assignedNodes().length).toBe(1);
  });

  it('resizes the left panel when resizable-bar emits resize-move event', async() => {
    const resizer = element.shadowRoot.querySelector('resizable-bar');

    const getBoundingClientRectSpy = vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      width: 800, // Set an arbitrary width
      left: 0, // Assuming left position is 0
      right: 800, // Assuming right position is the same as width
      top: 0, // Assuming top position is 0
      bottom: 100, // Set an arbitrary bottom value
      x: 0, // Assuming x coordinate is 0
      y: 0, // Assuming y coordinate is 0
      toJSON: () => {
      } // Mocking toJSON as well
    });

    // Simulate the resizing
    resizer.dispatchEvent(new CustomEvent('resize-move', {
      detail: { clientX: 200 } // Simulating a clientX position
    }));

    await element.updateComplete;

    // Check if the left panel width has been adjusted
    const computedStyle = getComputedStyle(element);

    expect(computedStyle.getPropertyValue('--left-panel-width').trim()).toBe('25%');

    // Cleanup
    getBoundingClientRectSpy.mockRestore();
  });
});
