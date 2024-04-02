import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import '../../src/components/tree-view.js';

describe('TreeView', () => {
  let element;

  beforeEach(async() => {
    element = document.createElement('tree-view');
    document.body.appendChild(element);
    await element.updateComplete; // Wait for the element to finish rendering
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('renders the tree structure correctly', async() => {
    element.items = [
      {
        name: 'Folder 1',
        type: 'folder',
        children: [
          { name: 'File 1.1', type: 'file' },
          { name: 'File 1.2', type: 'file' }
        ]
      },
      {
        name: 'Folder 2',
        type: 'folder',
        children: [
          { name: 'Folder 2.1', type: 'folder' }
        ]
      }
    ];
    await element.updateComplete;

    const root = element.shadowRoot.querySelector('[part~="root"]');

    expect(root).toBeDefined();
    expect(root.querySelectorAll('li').length).toBe(5);
  });

  it('toggles folder open/close on click', async() => {
    element.items = [{ name: 'Folder', type: 'folder', children: [] }];
    await element.updateComplete;
    const folder = element.shadowRoot.querySelector('[part~="item"]');

    // Initial state: folder closed
    expect(folder.getAttribute('part')).include('closed');

    // Click folder to toggle state
    folder.click();
    await element.updateComplete;

    // After click: folder open
    expect(folder.getAttribute('part')).not.include('closed');

    // Click folder again to toggle back
    folder.click();
    await element.updateComplete;

    // Back to initial state: folder closed
    expect(folder.getAttribute('part')).include('closed');
  });

  it('dispatches "selected" event for file items', async() => {
    element.items = [{ name: 'File', type: 'file' }];
    await element.updateComplete;
    const file = element.shadowRoot.querySelector('[part~="item"]');

    let selectedEventDetail = null;

    element.addEventListener('selected', (event) => {
      selectedEventDetail = event.detail;
    });

    // Click file item
    file.click();

    // Check if "selected" event is dispatched with correct detail
    expect(selectedEventDetail).toEqual({ name: 'File', type: 'file' });
  });
});
