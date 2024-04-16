import { afterEach, beforeEach, beforeAll, describe, expect, test, vi } from 'vitest';
import '../../src/components/confirmation-dialog.js';

describe('ConfirmationDialog Component', () => {
  let element;

  beforeAll(() => {
    HTMLDialogElement.prototype.show = vi.fn();
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  beforeEach(async() => {
    element = document.createElement('confirmation-dialog');
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  test('dispatches an "open" event when the dialog is opened', async() => {
    const openSpy = vi.fn();

    element.addEventListener('open', openSpy);

    element.toggle(true);
    await element.updateComplete;
    expect(openSpy).toHaveBeenCalledTimes(1);
  });

  test('dispatches a "close" event with details when the dialog is closed by acceptance', async() => {
    const closeSpy = vi.fn();

    element.addEventListener('close', closeSpy);

    element.toggle(true);
    await element.updateComplete;

    // Simulate clicking the 'Accept' button
    element.shadowRoot.querySelector('button[part="button accept"]').click();
    await element.updateComplete;

    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(closeSpy).toHaveBeenCalledWith(expect.objectContaining({
      detail: { accepted: true }
    }));
  });

  test('dispatches a "close" event with details when the dialog is closed by cancelling', async() => {
    const closeSpy = vi.fn();

    element.addEventListener('close', closeSpy);

    element.toggle(true);
    await element.updateComplete;

    // Simulate clicking the 'Cancel' button
    element.shadowRoot.querySelector('button[part="button cancel"]').click();
    await element.updateComplete;

    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(closeSpy).toHaveBeenCalledWith(expect.objectContaining({
      detail: { accepted: false }
    }));
  });

  test('dispatches a "close" event with details when the dialog is closed programmatically', async() => {
    const closeSpy = vi.fn();

    element.addEventListener('close', closeSpy);

    element.toggle(true);
    await element.updateComplete;

    element.toggle(false);
    await element.updateComplete;

    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(closeSpy).toHaveBeenCalledWith(expect.objectContaining({
      detail: { accepted: false }
    }));
  });
});
