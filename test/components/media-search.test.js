import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../src/components/media-search.js';

const okResponse = (payload) => ({
  ok: true,
  json: async() => payload
});

const resultsFixture = [
  {
    title: 'A media',
    urn: 'urn:rts:video:123',
    mediaType: 'VIDEO',
    date: '2024-01-01',
    duration: 120000
  }
];

describe('MediaSearch', () => {
  let element, fetchMock;

  const type = async(value) => {
    const input = element.shadowRoot.querySelector('[part~="input"]');

    input.value = value;
    input.dispatchEvent(new Event('input'));
    await element.updateComplete;
  };

  const runSearch = async(value) => {
    await type(value);
    await vi.advanceTimersByTimeAsync(300);
    await element.updateComplete;
  };

  beforeEach(async() => {
    vi.useFakeTimers();
    fetchMock = vi.fn()
      .mockResolvedValue(okResponse({ searchResultMediaList: resultsFixture }));
    vi.stubGlobal('fetch', fetchMock);

    element = document.createElement('media-search');
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    document.body.removeChild(element);
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('renders the business unit selector with srf selected by default', () => {
    const select = element.shadowRoot.querySelector('[part~="bu-select"]');

    expect(select).toBeTruthy();
    expect(element.bu).toBe('srf');
    expect(select.querySelectorAll('option').length).toBe(5);
  });

  it('debounces rapid inputs into a single search', async() => {
    await type('fed');
    await type('feder');
    await runSearch('federer');

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const url = new URL(fetchMock.mock.calls[0][0]);

    expect(url.searchParams.get('q')).toBe('federer');
  });

  it('shows the results dropdown after a successful search', async() => {
    await runSearch('federer');

    const results = element.shadowRoot.querySelectorAll('[part~="result"]');

    expect(results.length).toBe(1);
    expect(results[0].textContent).toContain('A media');
  });

  it('aborts the previous request when a new search starts', async() => {
    vi.stubGlobal('fetch', fetchMock.mockReturnValue(new Promise(() => {})));

    await runSearch('first');

    const firstSignal = fetchMock.mock.calls[0][1].signal;

    await runSearch('second');

    expect(firstSignal.aborted).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('dispatches media-selected when a result is clicked', async() => {
    let detail;

    element.addEventListener('media-selected', (e) => (detail = e.detail));
    await runSearch('federer');

    element.shadowRoot.querySelector('[part~="result"]').click();

    expect(detail).toEqual(resultsFixture[0]);
  });

  it('dispatches media-selected with the raw value on Enter, without searching', async() => {
    let detail;

    element.addEventListener('media-selected', (e) => (detail = e.detail));
    await type('urn:rts:video:456');

    const input = element.shadowRoot.querySelector('[part~="input"]');

    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

    expect(detail).toEqual({ urn: 'urn:rts:video:456' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('dispatches bu-changed when the business unit changes', async() => {
    let detail;

    element.addEventListener('bu-changed', (e) => (detail = e.detail));

    const select = element.shadowRoot.querySelector('[part~="bu-select"]');

    select.value = 'rts';
    select.dispatchEvent(new Event('change'));

    expect(detail).toEqual({ bu: 'rts' });
    expect(element.bu).toBe('rts');
  });

  it('closes the dropdown when clicking outside the component', async() => {
    await runSearch('federer');

    expect(element.shadowRoot.querySelector('[part~="results"]')).toBeTruthy();

    document.body.click();
    await element.updateComplete;

    expect(element.shadowRoot.querySelector('[part~="results"]')).toBeNull();
  });
});
