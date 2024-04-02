/**
 * Creates a string of active names from an object for dynamic HTML part or attribute binding.
 *
 * @param parts {{ [key: string]: boolean; }} Object with part names as keys and boolean values.
 * @returns {string} Space-separated string of active parts.
 *
 * @example
 * render() {
 *   const parts = {
 *     'active': true,
 *     'highlighted': false
 *   };
 *   return html`<div class=${partMap(parts)}>Content</div>`;
 * }
 */
export function partMap(parts) {
  return Object.entries(parts)
    .filter(([, value]) => value)
    .map(([key]) => key)
    .join(' ');
}
