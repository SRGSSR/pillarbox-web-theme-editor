export const IL_DEFAULT_HOST = 'il.srgssr.ch';

/**
 * The business units of the SRG SSR whose media can be searched.
 */
export const BUSINESS_UNITS = ['srf', 'rts', 'rsi', 'rtr', 'swi'];

const DEFAULT_SEARCH_PARAMS = {
  vector: 'srgplay',
  includeAggregations: false,
  includeSuggestions: false,
  sortBy: 'default',
  sortDir: 'desc',
  pageSize: 50
};

const toMedia = ({ title, urn, mediaType, date, duration }) => ({
  title, urn, mediaType, date, duration
});

/**
 * Searches media content on the SRG SSR integration layer.
 *
 * @param {string} bu The business unit to search (rsi, rtr, rts, srf or swi).
 * @param {string} query The search query.
 * @param {AbortSignal} [signal] (Optional) An abort signal, allows aborting
 * the request through an abort controller.
 *
 * @returns {Promise<Array<{title: string, urn: string, mediaType: string, date: string, duration: number}>>}
 * A promise resolving to the matching medias.
 *
 * @throws {Promise<Response>} A rejected promise with the response object if
 * the request fails.
 */
export async function searchMedia(bu, query, signal = undefined) {
  const params = new URLSearchParams({ ...DEFAULT_SEARCH_PARAMS, q: query });
  const path = `${bu.toLowerCase()}/searchResultMediaList`;
  const url = `https://${IL_DEFAULT_HOST}/integrationlayer/2.0/${path}?${params}`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    return Promise.reject(response);
  }

  const data = await response.json();

  return (data.searchResultMediaList ?? []).map(toMedia);
}
