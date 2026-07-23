import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../src/components/editor-tabs.js';

describe('EditorTabs', () => {
  let element;

  const tabs = [
    { id: 'pillarbox.scss', name: 'pillarbox.scss' },
    { id: 'components/_slider.scss', name: '_slider.scss' }
  ];

  beforeEach(async() => {
    element = document.createElement('editor-tabs');
    document.body.appendChild(element);
    element.tabs = tabs;
    element.activeId = 'pillarbox.scss';
    await element.updateComplete;
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('renders one tab per entry', () => {
    const renderedTabs = element.shadowRoot.querySelectorAll('[part~="tab"]');

    expect(renderedTabs.length).toBe(2);
    expect(renderedTabs[0].textContent).toContain('pillarbox.scss');
    expect(renderedTabs[1].textContent).toContain('_slider.scss');
  });

  it('marks only the active tab with the active part token', () => {
    const active = element.shadowRoot.querySelectorAll('[part~="active"]');

    expect(active.length).toBe(1);
    expect(active[0].getAttribute('title')).toBe('pillarbox.scss');
  });

  it('dispatches tab-selected when a tab is clicked', () => {
    let detail;

    element.addEventListener('tab-selected', (e) => (detail = e.detail));

    const secondTab = element.shadowRoot
      .querySelectorAll('[part~="tab"]')[1];

    secondTab.click();
    expect(detail).toEqual({ id: 'components/_slider.scss' });
  });

  it('dispatches tab-selected when a tab is activated with the keyboard', () => {
    let detail;

    element.addEventListener('tab-selected', (e) => (detail = e.detail));

    const secondTab = element.shadowRoot
      .querySelectorAll('[part~="tab"]')[1];

    secondTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(detail).toEqual({ id: 'components/_slider.scss' });
  });

  it('renders the close control as a focusable native button', () => {
    const closeButton = element.shadowRoot
      .querySelector('[part~="tab-close"]');

    expect(closeButton.tagName).toBe('BUTTON');
    expect(closeButton.closest('button')).toBe(closeButton);
  });

  it('dispatches tab-closed without selecting when close is clicked', () => {
    const selectedSpy = vi.fn();
    let detail;

    element.addEventListener('tab-selected', selectedSpy);
    element.addEventListener('tab-closed', (e) => (detail = e.detail));

    const closeButton = element.shadowRoot
      .querySelectorAll('[part~="tab-close"]')[1];

    closeButton.click();
    expect(detail).toEqual({ id: 'components/_slider.scss' });
    expect(selectedSpy).not.toHaveBeenCalled();
  });
});
