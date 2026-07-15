import { afterEach, describe, expect, it, vi } from 'vitest';
import { BUSINESS_UNITS, searchMedia } from '../../src/services/il-provider.js';

const mediaFixture = {
  title: 'A media',
  urn: 'urn:rts:video:123',
  mediaType: 'VIDEO',
  date: '2024-01-01T00:00:00+01:00',
  duration: 120000,
  ignoredField: 'ignored'
};

const okResponse = (payload) => ({
  ok: true,
  json: async() => payload
});

describe('il-provider', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exposes the five business units', () => {
    expect(BUSINESS_UNITS).toEqual(['srf', 'rts', 'rsi', 'rtr', 'swi']);
  });

  it('queries the search endpoint of the given business unit', async() => {
    const fetchMock = vi.fn()
      .mockResolvedValue(okResponse({ searchResultMediaList: [] }));

    vi.stubGlobal('fetch', fetchMock);

    await searchMedia('SRF', 'federer');

    const url = new URL(fetchMock.mock.calls[0][0]);

    expect(url.host).toBe('il.srgssr.ch');
    expect(url.pathname).toBe('/integrationlayer/2.0/srf/searchResultMediaList');
    expect(url.searchParams.get('q')).toBe('federer');
    expect(url.searchParams.get('vector')).toBe('srgplay');
    expect(url.searchParams.get('includeAggregations')).toBe('false');
    expect(url.searchParams.get('includeSuggestions')).toBe('false');
    expect(url.searchParams.get('sortBy')).toBe('default');
    expect(url.searchParams.get('sortDir')).toBe('desc');
    expect(url.searchParams.get('pageSize')).toBe('50');
  });

  it('maps the results to the media shape', async() => {
    const fetchMock = vi.fn()
      .mockResolvedValue(okResponse({ searchResultMediaList: [mediaFixture] }));

    vi.stubGlobal('fetch', fetchMock);

    const results = await searchMedia('rts', 'query');

    expect(results).toEqual([{
      title: 'A media',
      urn: 'urn:rts:video:123',
      mediaType: 'VIDEO',
      date: '2024-01-01T00:00:00+01:00',
      duration: 120000
    }]);
  });

  it('returns an empty list when the result list is missing', async() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse({})));

    expect(await searchMedia('rts', 'query')).toEqual([]);
  });

  it('rejects with the response when the request fails', async() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(searchMedia('rts', 'query'))
      .rejects.toMatchObject({ status: 500 });
  });

  it('passes the abort signal to fetch', async() => {
    const fetchMock = vi.fn()
      .mockResolvedValue(okResponse({ searchResultMediaList: [] }));

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    await searchMedia('rts', 'query', controller.signal);

    expect(fetchMock.mock.calls[0][1]).toEqual({ signal: controller.signal });
  });
});
