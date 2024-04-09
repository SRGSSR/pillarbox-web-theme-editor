import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import '../../src/components/toggle-pane-button.js';

describe('toggle-pane-button', () => {
  let element;

  beforeEach(() => {
    document.body.innerHTML = '<toggle-pane-button label="Toggle" title="Click to toggle"></toggle-pane-button>';
    element = document.body.querySelector('toggle-pane-button');
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('initially not opened', () => {
    // Verify the popup is not visible initially
    expect(element.opened).toBeFalsy();
    expect(element.hasAttribute('opened')).toBeFalsy();
  });

  it('toggles open state on button click', async() => {
    const button = element.shadowRoot.querySelector('button[part="button"]');

    button.click();

    await element.updateComplete;

    // Verify the popup is visible after a click
    expect(element.opened).toBeTruthy();
    expect(element.hasAttribute('opened')).toBeTruthy();

    button.click();
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify the popup is hidden after another click
    expect(element.opened).toBeFalsy();
    expect(element.hasAttribute('opened')).toBeFalsy();
  });

  it('reflects "opened" property to attribute correctly', async() => {
    element.opened = true;

    await element.updateComplete;

    // Verify the attribute reflects the property
    expect(element.hasAttribute('opened')).toBeTruthy();

    element.opened = false;
    await element.updateComplete;

    // Verify the attribute reflects the changed property
    expect(element.hasAttribute('opened')).toBeFalsy();
  });

  it('closes popup when clicking outside', async() => {
    // Open the popup first
    element.opened = true;
    await element.updateComplete;

    // Simulate a document click event
    document.dispatchEvent(new MouseEvent('click'));
    await element.updateComplete;

    // Verify the popup is closed after document click
    expect(element.opened).toBeFalsy();
  });
});
